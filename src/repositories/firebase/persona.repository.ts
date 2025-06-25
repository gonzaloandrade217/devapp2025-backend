import {
    Firestore,
    DocumentData,
    Timestamp,
    query, 
    where, 
    limit,
    getDocs
} from 'firebase/firestore'; 
import { AbstractFirebaseRepository } from './abstract.repository';
import { Persona } from '../../models/persona';
import logger from '../../config/logger';
import { Temporal } from '@js-temporal/polyfill'; 

export class PersonaFirebaseRepository extends AbstractFirebaseRepository<Persona> {
    protected collectionName = 'personas';

    constructor(firestore: Firestore) {
        super(firestore);
        logger.info(`[PersonaFirebaseRepository] Instancia creada para colección: ${this.collectionName}`);
    }

    protected mapToDomain(documentData: DocumentData, id: string): Persona {
        const fechaNacimientoFirestore = documentData.fechaNacimiento;
        let fechaNacimientoDomain: Temporal.PlainDate | undefined;

        if (fechaNacimientoFirestore instanceof Timestamp) {
            const jsDate = fechaNacimientoFirestore.toDate();
            fechaNacimientoDomain = Temporal.PlainDate.from({
                year: jsDate.getFullYear(),
                month: jsDate.getMonth() + 1,
                day: jsDate.getDate(),
            });
        } else if (typeof fechaNacimientoFirestore === 'string') {
            try {
                fechaNacimientoDomain = Temporal.PlainDate.from(fechaNacimientoFirestore);
            } catch (e) {
                logger.warn(`[PersonaFirebaseRepository] Fecha de nacimiento inválida para ID ${id}: ${fechaNacimientoFirestore}`);
                fechaNacimientoDomain = undefined;
            }
        }

        return {
            id: id,
            nombre: documentData.nombre,
            apellido: documentData.apellido,
            dni: documentData.dni,
            fechaDeNacimiento: fechaNacimientoDomain,
            genero: documentData.genero,
            donanteOrganos: documentData.donanteOrganos,
        } as unknown as Persona; 
    }

    protected mapToFirestore(entity: Omit<Persona, 'id'> | Partial<Persona>): DocumentData {
        const firestoreData: DocumentData = {
            nombre: entity.nombre,
            apellido: entity.apellido,
            dni: entity.dni,
            genero: entity.genero,             
            donanteOrganos: entity.donanteOrganos, 
        };

        if (entity.fechaDeNacimiento instanceof Temporal.PlainDate) {
            const date = new Date(entity.fechaDeNacimiento.year, entity.fechaDeNacimiento.month - 1, entity.fechaDeNacimiento.day);
            firestoreData.fechaDeNacimiento = date;
        }

        Object.keys(firestoreData).forEach(key => firestoreData[key] === undefined && delete firestoreData[key]);

        return firestoreData;
    }

    async isDniUnique(dni: string, idToIgnore?: string): Promise<boolean> {
        let q = query(this.getCollectionInstance(), where('dni', '==', dni)); 

        if (idToIgnore) {
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return true;
            }

            const relevantDocs = snapshot.docs.filter(doc => doc.id !== idToIgnore);

            return relevantDocs.length === 0;

        } else {
            const snapshot = await getDocs(query(this.getCollectionInstance(), where('dni', '==', dni), limit(1))); // <-- CAMBIO: Usar query y getDocs con limit
            return snapshot.empty;
        }
    }
}