import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import process from 'process';
import createPersonasRoutes from './routes/personas.routes'; 
import createAutosRoutes from './routes/autos.routes';
import 'dotenv/config';
import { MongoClient, Db } from 'mongodb'; 
import { ServiceFactory } from './services/ServiceFactory'; 
import { AutoController } from './controllers/auto.controller';
import { PersonaController } from './controllers/persona.controller'; 
import logger from './config/logger';
import { ErrorCatching } from './middlewares/ErrorCatching';

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
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const dbName = process.env.MONGO_DB_NAME || 'mi_base_de_datos';

    let db: Db | undefined; 

    if (process.env.DB_TYPE !== 'transient') {
        const client = new MongoClient(uri);
        try {
            await client.connect();
            db = client.db(dbName);
            logger.info('Conectado a MongoDB.');
        } catch (error) {
            logger.error('Error al conectar a MongoDB:', error);
            process.exit(1);
        }
    } else {
        logger.info('Usando base de datos transitoria (en memoria). No se conectará a MongoDB.');
    }

    ServiceFactory.initialize(db);

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