import { Persona, Genero } from "../interfaces/persona.interface";

export const personas: Persona[] = [
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
