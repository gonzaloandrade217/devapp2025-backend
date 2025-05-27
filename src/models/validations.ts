type ValidationSuccess<T> = { success: true; data: T };
type ValidationError = { success: false; error: Error };

export type Validation<T> = ValidationSuccess<T> | ValidationError;
