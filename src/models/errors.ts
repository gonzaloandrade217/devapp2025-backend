import { ZodError } from 'zod';

class AppError extends Error {
    public constructor(message?: string) {
        super(message);
        // JS maneja el extender Error de forma bastante extraña, y rompe cosas
        // por lo que hay que "reestablecer la cadena de prototipos".
        Object.setPrototypeOf(this, new.target.prototype);
        // También se necesita establecer adecuadamente el nombre de la excepción.
        this.name = new.target.name;
    }
}
// Luego nuestras excepciones dependen de esta.
export class NonExistentElement extends AppError {}
export class InvalidData extends AppError {
    public constructor(
        public errors: Record<string, string>,
        message?: string
    ) {
        super(message);
    }
    public static fromZodError(error: ZodError) {
        const errors = error.errors.reduce<Record<string, string>>((acc, e) => {
            const key = e.path[0] as string;
            acc[key] = e.message;
            return acc;
        }, {});
        return new InvalidData(errors);
    }
}
export class NonExistingRelationshipId extends AppError {}
