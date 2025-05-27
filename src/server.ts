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

// Creamos nuestra app express
const app = express();
// Leemos el puerto de las variables de entorno, si no está, usamos uno por default
const port = process.env.PORT || 9000;

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

    console.log(`User: ${loginData.email}`);
    //console.log(`Password: ${loginData.password}`);

    const saludoRespuesta:Saludo = {
        destinatario: loginData.email,
        mensaje: 'Hola',
        hora: Date.now().toString()
    };

    //res.statusCode = 200;
    res.json(saludoRespuesta);
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error atrapado por el middleware de errores:', err.message);
    // Puedes diferenciar errores, enviar detalles si estás en desarrollo, etc.
    res.status(500).json({
        error: 'Algo salió mal en el servidor.',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

async function connectToDatabaseAndSetupRoutes() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017'; // Asegúrate de tener tu URI en .env
    const dbName = process.env.MONGO_DB_NAME || 'mi_base_de_datos'; // Asegúrate de tener el nombre de tu DB en .env

    let db: Db | undefined; // Declara db como posible undefined

    // Si el tipo de DB es 'mongo', intentamos conectar a MongoDB
    if (process.env.DB_TYPE !== 'transient') {
        const client = new MongoClient(uri);
        try {
            await client.connect();
            db = client.db(dbName);
            console.log('Conectado a MongoDB.');
        } catch (error) {
            console.error('Error al conectar a MongoDB:', error);
            // Manejar el error de conexión apropiadamente, quizás detener la aplicación
            process.exit(1);
        }
    } else {
        console.log('Usando base de datos transitoria (en memoria). No se conectará a MongoDB.');
    }

    // Inicializa ServiceFactory con la instancia de Db (o undefined si es transitorio)
    ServiceFactory.initialize(db);

    app.use('/personas', createPersonasRoutes());
    app.use('/autos', createAutosRoutes());

    // Levantamos el servidor en el puerto que configuramos
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
}

connectToDatabaseAndSetupRoutes().catch(console.error);