declare const readOperation: (cacheKey: string) => string | undefined;
declare const writeOperation: <T>(value: T, cacheKey: string) => void;
declare const deleteOperation: (deleteType: "patterns" | "cacheKey", cacheKey?: string, pattern?: string) => void;
export { readOperation, writeOperation, deleteOperation, };
//# sourceMappingURL=cache.services.d.ts.map