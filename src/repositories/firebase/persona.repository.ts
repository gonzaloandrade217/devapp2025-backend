import {
    Firestore,
    DocumentData,
    Timestamp,
    query,
    where,
    limit,
    getDocs,
    CollectionReference
} from 'firebase/firestore';
import { AbstractFirebaseRepository } from './abstract.repository';
import { Persona } from '../../models/persona';
import logger from '../../config/logger';
import { Temporal } from 'temporal-polyfill';

export class PersonaFirebaseRepository extends AbstractFirebaseRepository<Persona> {
    protected collectionName = 'personas';

    constructor(firestore: Firestore) {
        super(firestore);
        logger.info(`[PersonaFirebaseRepository] Instancia creada para colección: ${this.collectionName}`);
    }

    protected mapToDomain(documentData: DocumentData, id: string): Persona {
        const fechaFirestore = documentData.fechaDeNacimiento || documentData.fechaNacimiento;
        let fechaDomain: Temporal.PlainDate | undefined;

        if (fechaFirestore instanceof Timestamp) {
            const jsDate = fechaFirestore.toDate();
            fechaDomain = Temporal.PlainDate.from({
                year: jsDate.getFullYear(),
                month: jsDate.getMonth() + 1,
                day: jsDate.getDate(),
            });
        } else if (typeof fechaFirestore === 'string') {
            try {
                fechaDomain = Temporal.PlainDate.from(fechaFirestore);
            } catch (e) {
                logger.warn(`[PersonaFirebaseRepository] Fecha de nacimiento inválida en Firestore para ID ${id}: ${fechaFirestore}`);
                fechaDomain = undefined;
            }
        }

        return {
            id: id,
            nombre: documentData.nombre,
            apellido: documentData.apellido,
            dni: documentData.dni,
            fechaDeNacimiento: fechaDomain,
            genero: documentData.genero,
            donanteOrganos: documentData.donanteOrganos,
        } as Persona;
    }

    protected mapToFirestore(entity: Omit<Persona, 'id'> | Partial<Persona>): DocumentData {
        const firestoreData: DocumentData = {
            nombre: entity.nombre,
            apellido: entity.apellido,
            dni: entity.dni,
            genero: entity.genero,
            donanteOrganos: entity.donanteOrganos,
        };

        if (
            entity.fechaDeNacimiento &&
            typeof entity.fechaDeNacimiento === 'object' &&
            'year' in entity.fechaDeNacimiento &&
            typeof (entity.fechaDeNacimiento as any).year === 'number' && 
            'month' in entity.fechaDeNacimiento &&
            typeof (entity.fechaDeNacimiento as any).month === 'number' && 
            'day' in entity.fechaDeNacimiento &&
            typeof (entity.fechaDeNacimiento as any).day === 'number'    
        ) {
            const plainDate = entity.fechaDeNacimiento as Temporal.PlainDate;
            const date = new Date(plainDate.year, plainDate.month - 1, plainDate.day);
            firestoreData.fechaDeNacimiento = date;
        } else if (entity.fechaDeNacimiento instanceof Date) { 
            firestoreData.fechaDeNacimiento = entity.fechaDeNacimiento;
        } else if (entity.fechaDeNacimiento !== undefined) {
             logger.warn(`[PersonaFirebaseRepository] 'fechaDeNacimiento' no es Temporal.PlainDate ni Date para guardar: ${entity.fechaDeNacimiento}`);
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
            const snapshot = await getDocs(query(this.getCollectionInstance(), where('dni', '==', dni), limit(1)));
            return snapshot.empty;
        }
    }
}