import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import process from 'process';
import createPersonasRoutes from './routes/personas.routes'; 
import createAutosRoutes from './routes/autos.routes';
import 'dotenv/config';
import { MongoClient, Db } from 'mongodb';
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore'; 
import { ServiceFactory } from './services/ServiceFactory'; 
import { AutoController } from './controllers/auto.controller';
import { PersonaController } from './controllers/persona.controller'; 
import logger from './config/logger';
import { ErrorCatching } from './middlewares/ErrorCatching';
import bodyParser from 'body-parser';

// Creamos nuestra app express
const app = express();
// Leemos el puerto de las variables de entorno, si no está, usamos uno por default
const port = process.env.PORT || 3000; 

// Configuramos los plugins
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

// Define la interfaz para los datos de login
interface LoginData {
    email: string;
    password: string;
}

// Define la interfaz para la respuesta de saludo
interface Saludo {
    destinatario: string;
    mensaje: string;
    hora: string;
}

//Login
app.post('/login',(req, res) => {
    const loginData:LoginData = req.body;

    logger.info(`User: ${loginData.email}`);

    const saludoRespuesta:Saludo = {
        destinatario: loginData.email,
        mensaje: 'Hola',
        hora: Date.now().toString()
    };

    //res.statusCode = 200;
    res.json(saludoRespuesta);
});

app.use(ErrorCatching);

async function connectToDatabaseAndSetupRoutes() {
    let dbInstance: Db | Firestore | undefined; 

    if (process.env.DB_TYPE === 'firebase') {
        logger.info('Intentando conectar a Firebase Firestore (SDK de cliente).');
        try {
            const firebaseConfig = {
                apiKey: process.env.FIREBASE_API_KEY,
                authDomain: process.env.FIREBASE_AUTH_DOMAIN,
                projectId: process.env.FIREBASE_PROJECT_ID,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.FIREBASE_APP_ID,
                measurementId: process.env.FIREBASE_MEASUREMENT_ID, 
            };

            const firebaseApp = initializeApp(firebaseConfig);
            dbInstance = getFirestore(firebaseApp); 

            logger.info('Conectado a Firebase Firestore (SDK de cliente).');
        } catch (error) {
            logger.error('Error al conectar a Firebase Firestore (SDK de cliente):', error);
            process.exit(1);
        }
    } else if (process.env.DB_TYPE === 'mongodb') {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
        const dbName = process.env.MONGO_DB_NAME || 'mi_base_de_datos';

        logger.info('Intentando conectar a MongoDB.');
        const client = new MongoClient(uri);
        try {
            await client.connect();
            dbInstance = client.db(dbName);
            logger.info('Conectado a MongoDB.');
        } catch (error) {
            logger.error('Error al conectar a MongoDB:', error);
            process.exit(1);
        }
    } else if (process.env.DB_TYPE === 'transient') {
        logger.info('Usando base de datos transitoria (en memoria). No se conectará a MongoDB ni Firebase.');
        dbInstance = undefined; 
    } else {
        logger.error('DB_TYPE no especificado o inválido en las variables de entorno. Use "mongodb", "firebase", o "transient".');
        process.exit(1);
    }

    ServiceFactory.initialize(dbInstance);

    const autoService = ServiceFactory.autoService();
    const personaService = ServiceFactory.personaService();

    const autoController = new AutoController(autoService);
    const personaController = new PersonaController(personaService);

    app.use('/api/personas', createPersonasRoutes(personaController));
    app.use('/api/autos', createAutosRoutes(autoController));

    app.listen(port, () => {
        logger.info(`Example app listening on port ${port}`);
    });
}

connectToDatabaseAndSetupRoutes().catch(console.error);

