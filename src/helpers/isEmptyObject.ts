// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isEmptyObject = (obj: any): boolean => typeof obj === 'object' && Object.keys(obj).length === 0;
