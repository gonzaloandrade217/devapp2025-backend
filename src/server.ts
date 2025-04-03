// Importamos nuestras dependencias
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import process from 'process';
import { Genero, Persona } from './interfaces/persona.interface';
import { Auto } from './interfaces/auto.interface';

// Creamos nuestra app express
const app = express();
// Leemos el puerto de las variables de entorno, si no está, usamos uno por default
const port = process.env.PORT || 9000;

// Configuramos los plugins
// Más adelante intentaremos entender mejor cómo funcionan estos plugins
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

const personas: Persona[] = [
    {
        id: 1,
        nombre: "Juan",
        apellido: "Pérez",
        dni: "12345678",
        fechaNacimiento: new Date("1990-01-15"),
        genero: Genero.Masculino,
        donanteOrganos: true,
        autos: [
            {
                id: 10
            },
            {
                id: 11
            }
        ]
    },
    {
        id: 2,
        nombre: "María",
        apellido: "Gómez",
        dni: "87654321",
        fechaNacimiento: new Date("1985-05-20"),
        genero: Genero.Femenino,
        donanteOrganos: false,
        autos: [
            {
                id: 12
            }
        ]
    }
  ];

const autos: Auto[] = [
    {
        id: 10,
        marca: "Toyota",
        modelo: "Corolla",
        año: 2020,
        patente: "ABC123",
        color: "Blanco"
    },
    {
        id: 11,
        marca: "Ford",
        modelo: "Fiesta",
        año: 2018,
        patente: "DEF456"
    },{
        id: 12,
        marca: "Volkswagen",
        modelo: "Golf",
        año: 2019,
        patente: "GHI789"
    }

];
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

// Mis endpoints van acá
app.get('/',(req, res) => {
    res.json('Hello Word');
});

// GET /personas 
app.get('/personas', (req, res) => {
    const resultado = personas.map(p => ({
        id: p.id,
        dni: p.dni,
        nombre: p.nombre,
        apellido: p.apellido
    }));
    res.json(resultado);
});

// GET /autos 
app.get('/autos', (req, res) => {
    const resultado = autos.map(a => ({
        id: a.id,
        marca: a.marca,
        modelo: a.modelo,
        año: a.año,
        petente: a.patente
    }));
    res.json(resultado);
});

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
