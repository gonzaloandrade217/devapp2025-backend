export enum TipoAuto {
    Sedan = 'Sedán',
    Hatchback = 'Hatchback',
    SUV = 'SUV',
    Pickup = 'Pickup',
    Camioneta = 'Camioneta',
    Deportivo = 'Deportivo',
    Electrico = 'Eléctrico',
    Hibrido = 'Híbrido'
  }
  
  export enum EstadoAuto {
    Nuevo = 'Nuevo',
    Usado = 'Usado',
    Reparacion = 'En reparación',
    Vendido = 'Vendido',
    Reservado = 'Reservado'
  }
  
  export interface IAuto {
    marca: string;
    modelo: string;
    añoFabricacion: number;
    añoModelo: number;
    patente: string;
    chasis: string;
    tipo: TipoAuto;
    color: string;
    transmision: 'Manual' | 'Automática' | 'CVT';
    traccion: 'Delantera' | 'Trasera' | '4x4' | 'AWD';
    kilometraje: number;
    precioVenta: number;
    precioLista: number;
    estado: EstadoAuto;
    fechaIngreso: Date;
    fechaVenta?: Date;
    caracteristicas: {
      aireAcondicionado: boolean;
      alarma: boolean;
      airbags: number;
      abs: boolean;
      controlCrucero: boolean;
      cajaCambios: string;
      puertas: number;
      pasajeros: number;
    };
    combustible: {
      tipo: 'Nafta' | 'Diesel' | 'Eléctrico' | 'Híbrido';
      capacidadTanque: number;
      consumoPromedio?: number;
    };
    motor: {
      cilindrada: number;
      potencia: number;
      torque: number;
      configuracion: string;
    };
    servicios?: {
      fecha: Date;
      tipo: string;
      descripcion: string;
      kilometraje: number;
      costo: number;
    }[];
    propietario?: string; // ID del dueño si es usado
    vendidoA?: string; // ID del cliente si está vendido
    imagenes?: string[]; // URLs de imágenes
  }
  
  // Para uso con Mongoose
  export interface IAutoDocument extends IAuto, Document {
    createdAt: Date;
    updatedAt: Date;
  }