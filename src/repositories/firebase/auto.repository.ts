import {
    Firestore,
    DocumentData,
    QuerySnapshot,
    query, 
    where, 
    limit, 
    getDocs, 
} from 'firebase/firestore';
import { AbstractFirebaseRepository } from './abstract.repository';
import { Auto } from '../../models/auto';
import logger from '../../config/logger';
import { IAutoRepository } from '../IAutoRepository';

export class AutoFirebaseRepository extends AbstractFirebaseRepository<Auto> implements IAutoRepository<string> {
    protected collectionName: string = 'autos';

    constructor(firestore: Firestore) {
        super(firestore);
        logger.info(`[AutoFirebaseRepository] Instancia creada para colección: ${this.collectionName}`);
    }

    protected mapToDomain(documentData: DocumentData, id: string): Auto {
        return {
            id: id,
            patente: documentData.patente,
            marca: documentData.marca,
            modelo: documentData.modelo,
            anio: documentData.anio,
            color: documentData.color,
            nroChasis: documentData.nroChasis,
            nroMotor: documentData.nroMotor,
            personaID: documentData.personaID,
        } as Auto;
    }

    protected mapToFirestore(entity: Omit<Auto, 'id'> | Partial<Auto>): DocumentData {
        const firestoreData: DocumentData = {
            patente: entity.patente,
            marca: entity.marca,
            modelo: entity.modelo,
            anio: entity.anio,
            color: entity.color,
            nroChasis: entity.nroChasis,
            nroMotor: entity.nroMotor,
            personaID: entity.personaID,
        };

        Object.keys(firestoreData).forEach(key => firestoreData[key] === undefined && delete firestoreData[key]);

        return firestoreData;
    }

    public async getByPatente(patente: string): Promise<Auto | null> {
        try {
            logger.debug(`[${this.collectionName}Repository] Buscando auto por patente: ${patente}`);
            const q = query(
                this.getCollectionInstance(),
                where('patente', '==', patente),
                limit(1) 
            );
            const snapshot: QuerySnapshot<DocumentData> = await getDocs(q); 

            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                logger.info(`[${this.collectionName}Repository] Auto encontrado con patente: ${patente}`);
                return this.mapToDomain(doc.data(), doc.id);
            } else {
                logger.warn(`[${this.collectionName}Repository] Auto no encontrado con patente: ${patente}`);
                return null;
            }
        } catch (error: any) {
            logger.error(`[${this.collectionName}Repository] Error al obtener auto por patente ${patente}: ${error.message}`, {
                error: error,
                stack: error.stack,
                patente: patente
            });
            throw error;
        }
    }

    public async getByPersonaId(personaID: string): Promise<Auto[]> {
        try {
            logger.debug(`[${this.collectionName}Repository] Buscando autos para persona ID: ${personaID}`);
            const q = query(
                this.getCollectionInstance(),
                where('personaID', '==', personaID)
            );
            const snapshot: QuerySnapshot<DocumentData> = await getDocs(q); 

            const autos: Auto[] = snapshot.docs.map(doc => this.mapToDomain(doc.data(), doc.id));
            logger.info(`[${this.collectionName}Repository] Se encontraron ${autos.length} autos para la persona ID: ${personaID}`);
            return autos;
        } catch (error: any) {
            logger.error(`[${this.collectionName}Repository] Error al obtener autos por persona ID ${personaID}: ${error.message}`, {
                error: error,
                stack: error.stack,
                personaID: personaID
            });
            throw error;
        }
    }
}