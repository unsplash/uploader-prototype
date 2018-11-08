export const mergeObjects = <T>(a: T) => (b: Partial<T>) => ({
  // We cast spreaded objects to any to workaround TS issue when spreading generic objects
  // https://github.com/Microsoft/TypeScript/issues/14409
  ...(a as any),
  ...(b as any),
});
