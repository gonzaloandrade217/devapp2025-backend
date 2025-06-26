import { Db, Document, ObjectId, WithId } from 'mongodb'; 
import { AbstractMongoRepository } from './abstract.repository'; 
import { Genero, Persona } from '../../models/persona'; 
import { Temporal } from '@js-temporal/polyfill';
import logger from '../../config/logger';

export class PersonaMongoRepository extends AbstractMongoRepository<Persona> {
    protected collectionName = 'personas';

    constructor(db: Db) {
        super(db);
    }

    protected mapToDomain(document: WithId<Document>): Persona {
        const idString = document._id.toHexString(); 
        const fechaNacimientoMongo = document.fechaDeNacimiento;
        let fechaNacimientoDomain: Temporal.PlainDate | undefined;

        if (fechaNacimientoMongo instanceof Date) {
            fechaNacimientoDomain = Temporal.PlainDate.from({
                year: fechaNacimientoMongo.getFullYear(),
                month: fechaNacimientoMongo.getMonth() + 1, 
                day: fechaNacimientoMongo.getDate(),
            });
        } else if (typeof fechaNacimientoMongo === 'string') {
            try {
                fechaNacimientoDomain = Temporal.PlainDate.from(fechaNacimientoMongo);
            } catch (e) {
                logger.warn(`[PersonaMongoRepository] Fecha de nacimiento inválida en DB para ID ${idString}: ${fechaNacimientoMongo}`);
                fechaNacimientoDomain = undefined;
            }
        }

        return {
            id: idString, 
            nombre: document.nombre as string,
            apellido: document.apellido as string,
            dni: document.dni as string,
            fechaDeNacimiento: fechaNacimientoDomain, 
            genero: document.genero as Genero, 
            donanteOrganos: document.donanteOrganos as boolean
        } as Persona;
    }

    protected mapToMongo(entity: Omit<Persona, 'id'> | Partial<Persona>): Document {
        const mongoDocument: Document = {
            nombre: entity.nombre,
            apellido: entity.apellido,
            dni: entity.dni,
            genero: entity.genero,
            donanteOrganos: entity.donanteOrganos
        };

        if (entity.fechaDeNacimiento instanceof Temporal.PlainDate) {
            const date = new Date(entity.fechaDeNacimiento.year, entity.fechaDeNacimiento.month - 1, entity.fechaDeNacimiento.day);
            mongoDocument.fechaDeNacimiento = date;
        }

        Object.keys(mongoDocument).forEach(key => mongoDocument[key] === undefined && delete mongoDocument[key]);

        return mongoDocument;
    }
    
    async isDniUnique(dni: string, idToIgnore?: string): Promise<boolean> {
        const query: any = { dni: dni };
        if (idToIgnore) {
            query._id = { $ne: new ObjectId(idToIgnore) }; 
        }
        const count = await this.getCollectionInstance().countDocuments(query);
        return count === 0;
    }
}