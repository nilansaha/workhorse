const registry = new Map<string, (payload: any) => Promise<void>>();

export const register = (id: string, fn: (payload: any) => Promise<void>) => {
  registry.set(id, fn);
};

export const getHandler = (id: string) => registry.get(id);
