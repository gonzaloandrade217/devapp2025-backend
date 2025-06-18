// AutoMiddleware.ts
import { AutoListingDTO } from '../DTO/auto.dto';
import { identity } from '../helpers';
import { validatedAuto, Auto } from '../models'; // Asegúrate de que esta ruta sea correcta
import { IService, ServiceFactory } from '../services'; // Asegúrate de que esta ruta sea correcta
import { BREADMiddleware } from './BREADMiddleware';
import { WithId } from 'mongodb'; // Importa WithId para el tipado, si lo necesitas directamente

// T: Auto (entidad sin _id)
// ListingDTO: AutoListingDTO
// FullEntityDTO: Auto (o un DTO completo si lo tuvieras)
// ReposEntity: WithId<Auto> (entidad con _id del repositorio)
export class AutoMiddleware extends BREADMiddleware<Auto, AutoListingDTO, Auto, WithId<Auto>> {
    // Aquí, service espera IService<Auto> según la definición en BREADMiddleware.
    // Necesitarás inyectar el Db en ServiceFactory.autoService() si es el caso.
    protected service: IService<Auto> = ServiceFactory.autoService();

    // La función ahora espera `WithId<Auto>` como parámetro, que es ReposEntity
    protected entityToListingEntity = (auto: WithId<Auto>): AutoListingDTO => ({
      id: auto._id.toString(), // Accede a _id de WithId<Auto>
      patente: auto.patente,
      marca: auto.marca,
      modelo: auto.modelo,
      anio: auto.anio,
      color: auto.color,
    });
    // identity aquí también recibirá WithId<Auto>
    protected entityToFullEntity = identity;
    // validatedEntity espera Auto (la entidad limpia para validar)
    protected validatedEntity = validatedAuto;

    // Puedes agregar métodos específicos de AutoMiddleware aquí si los necesitas
}