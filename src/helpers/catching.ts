// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const catching = (e: unknown, catchers: Record<string, (err: any) => void>) => {
    const defaultCatch = catchers['default'];
    if (e instanceof Error) {
        const catcher = catchers[e.name];
        if (catcher) {
            return catcher(e);
        }
    }
    if (defaultCatch) {
        return defaultCatch(e);
    }
};
