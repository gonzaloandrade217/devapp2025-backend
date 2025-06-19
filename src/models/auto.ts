import { InvalidData } from './errors';
import { Validation } from './validations';
import zod from 'zod';

export type Auto = {
    id: string; 
    patente: string;
    marca: string;
    modelo: string;
    anio: number;
    color: string;
    nroChasis: string;
    nroMotor: string;
    personaID: string;
};

export const autoSchema = zod.object({
    id: zod.string(), 
    patente: zod.string().regex(/^[A-Z]{2}\s[0-9]{3}\s[A-Z]{2}$/),
    marca: zod.string(),
    modelo: zod.string(),
    anio: zod.number().min(1850).max(2100),
    color: zod.string(),
    nroChasis: zod.string(),
    nroMotor: zod.string(),
    personaID: zod.string()
});

export const validatedAuto = (entity: Auto): Validation<Auto> => {
    const result = autoSchema.safeParse(entity);
    if (result.success) return result;
    return { success: false, error: InvalidData.fromZodError(result.error) };
};