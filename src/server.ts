// Importamos nuestras dependencias
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import process from 'process';
import personasRoutes from './routes/personas.routes';
import autosRoutes from './routes/autos.routes';
import 'dotenv/config';

// Creamos nuestra app express
const app = express();
// Leemos el puerto de las variables de entorno, si no está, usamos uno por default
const port = process.env.PORT || 9000;

// Configuramos los plugins
// Más adelante intentaremos entender mejor cómo funcionan estos plugins
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use('/personas', personasRoutes); 
app.use('/autos', autosRoutes);

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
    }

    //res.statusCode = 200;
    res.json(saludoRespuesta);
});

// Levantamos el servidor en el puerto que configuramos
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
