import {
    Firestore,
    CollectionReference,
    DocumentData,
    QuerySnapshot,
    doc,
    collection,
    getDoc, 
    getDocs, 
    addDoc,
    updateDoc, 
    deleteDoc, 
    query
} from 'firebase/firestore'; 
import { IRepository } from '../IRepository';
import logger from '../../config/logger';

export abstract class AbstractFirebaseRepository<TEntity extends { id: string }> implements IRepository<TEntity, string> {
    protected abstract collectionName: string;
    protected firestore: Firestore;

    constructor(firestore: Firestore) {
        this.firestore = firestore;
    }

    protected getCollectionInstance(): CollectionReference<DocumentData> {
        return collection(this.firestore, this.collectionName);
    }

    protected abstract mapToDomain(documentData: DocumentData, id: string): TEntity;
    protected abstract mapToFirestore(entity: Omit<TEntity, 'id'> | Partial<TEntity>): DocumentData;

    public async getAll(): Promise<TEntity[]> {
        try {
            logger.debug(`[${this.collectionName}Repository] Intentando obtener todos los documentos.`);
            const q = query(this.getCollectionInstance());
            const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);

            const entities: TEntity[] = snapshot.docs.map(doc => {
                return this.mapToDomain(doc.data(), doc.id);
            });
            logger.info(`[${this.collectionName}Repository] Se obtuvieron ${entities.length} documentos.`);
            return entities;
        } catch (error: any) {
            logger.error(`[${this.collectionName}Repository] Error al obtener todos los documentos: ${error.message}`, {
                error: error,
                stack: error.stack
            });
            throw error;
        }
    }

    public async getById(id: string): Promise<TEntity | null> {
        try {
            logger.debug(`[${this.collectionName}Repository] Intentando obtener documento por ID: ${id}`);
            const docRef = doc(this.getCollectionInstance(), id);
            const docSnapshot = await getDoc(docRef);

            if (docSnapshot.exists() && docSnapshot.data()) { 
                logger.info(`[${this.collectionName}Repository] Documento encontrado con ID: ${id}`);
                return this.mapToDomain(docSnapshot.data() as DocumentData, docSnapshot.id);
            } else {
                logger.warn(`[${this.collectionName}Repository] Documento no encontrado con ID: ${id}`);
                return null;
            }
        } catch (error: any) {
            logger.error(`[${this.collectionName}Repository] Error al obtener el documento con ID ${id}: ${error.message}`, {
                error: error,
                stack: error.stack,
                invalidId: id
            });
            throw error;
        }
    }

    public async create(entity: Omit<TEntity, 'id'>): Promise<TEntity> {
        try {
            logger.debug(`[${this.collectionName}Repository] Intentando crear nuevo documento.`);
            const dataToCreate: DocumentData = this.mapToFirestore(entity);

            const docRef = await addDoc(this.getCollectionInstance(), dataToCreate);

            logger.info(`[${this.collectionName}Repository] Documento creado con éxito. ID: ${docRef.id}`);

            return this.mapToDomain(dataToCreate, docRef.id);
        } catch (error: any) {
            logger.error(`[${this.collectionName}Repository] Error al crear un nuevo documento: ${error.message}`, {
                error: error,
                stack: error.stack,
                entityData: entity
            });
            throw error;
        }
    }

    public async update(id: string, entity: Partial<TEntity>): Promise<TEntity | null> {
        try {
            logger.debug(`[${this.collectionName}Repository] INICIANDO DEPURACIÓN DE UPDATE`);
            logger.debug(`[${this.collectionName}Repository] Intentando actualizar documento con ID: ${id}`);

            const dataToUpdate: DocumentData = this.mapToFirestore(entity);

            const docRef = doc(this.getCollectionInstance(), id);
            await updateDoc(docRef, dataToUpdate); 

            logger.info(`[${this.collectionName}Repository] Documento actualizado con éxito. ID: ${id}`);

            const updatedDocSnapshot = await getDoc(docRef);
            if (updatedDocSnapshot.exists() && updatedDocSnapshot.data()) {
                logger.debug(`[${this.collectionName}Repository] Documento COMPLETO después de actualización: ${JSON.stringify(updatedDocSnapshot.data())}`);
                logger.debug(`[${this.collectionName}Repository] FIN DEPURACIÓN DE UPDATE (ÉXITO)`);
                return this.mapToDomain(updatedDocSnapshot.data() as DocumentData, updatedDocSnapshot.id);
            } else {
                logger.warn(`[${this.collectionName}Repository] Documento NO ENCONTRADO para el ID: ${id}. No se pudo verificar la actualización.`);
                logger.debug(`[${this.collectionName}Repository] FIN DEPURACIÓN DE UPDATE (FALLO - Documento no encontrado después de actualizar)`);
                return null;
            }

        } catch (error: any) {
            logger.error(`[${this.collectionName}Repository] ERROR FATAL durante la actualización para ID ${id}: ${error.message}`, {
                error: error,
                stack: error.stack,
                entityId: id,
                updateData: entity
            });
            logger.debug(`[${this.collectionName}Repository] FIN DEPURACIÓN DE UPDATE (ERROR FATAL)`);
            throw error;
        }
    }

    public async delete(id: string): Promise<boolean> {
        try {
            logger.debug(`[${this.collectionName}Repository] Intentando eliminar documento con ID: ${id}`);
            const docRef = doc(this.getCollectionInstance(), id);
            await deleteDoc(docRef);
            logger.info(`[${this.collectionName}Repository] Documento eliminado con éxito. ID: ${id}`);
            return true;
        } catch (error: any) {
            logger.error(`[${this.collectionName}Repository] Error al eliminar el documento con ID ${id}: ${error.message}`, {
                error: error,
                stack: error.stack,
                deleteId: id
            });
            return false;
        }
    }
}