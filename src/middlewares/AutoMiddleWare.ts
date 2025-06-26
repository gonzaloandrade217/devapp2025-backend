import { AutoListingDTO } from '../DTO/auto.dto';
import { identity } from '../helpers';
import { validatedAuto, Auto } from '../models'; 
import { IService, ServiceFactory } from '../services'; 
import { BREADMiddleware } from './BREADMiddleware';
import { ObjectId } from 'mongodb'; 

export class AutoMiddleware extends BREADMiddleware<Auto, AutoListingDTO, Auto, string | ObjectId, Auto, (Auto & { _id: string | ObjectId })> {
    protected service: IService<Auto, string | ObjectId> = ServiceFactory.autoService();

    protected entityToListingEntity = (auto: Auto & { _id: string | ObjectId }): AutoListingDTO => ({
        id: typeof auto._id === 'string' ? auto._id : auto._id.toHexString(),
        patente: auto.patente,
        marca: auto.marca,
        modelo: auto.modelo,
        anio: auto.anio,
        color: auto.color,
    });

    protected entityToFullEntity = identity;

    protected validatedEntity = validatedAuto;
}