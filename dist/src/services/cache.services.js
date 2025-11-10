// ** Custom servies to perform cache operation ** \\
import { cacheStore } from "../server.js";
const readOperation = (cacheKey) => {
    return cacheStore.get(cacheKey);
};
const writeOperation = (value, cacheKey) => {
    cacheStore.set(cacheKey, JSON.stringify(value));
    return;
};
const deleteOperation = (deleteType, cacheKey, pattern) => {
    if (deleteType === "cacheKey") {
        cacheStore.delete(cacheKey);
        return;
    }
    else {
        for (const key of cacheStore.keys()) {
            if (key.startsWith(pattern)) {
                cacheStore.delete(key);
            }
        }
        return;
    }
};
export { readOperation, writeOperation, deleteOperation, };
//# sourceMappingURL=cache.services.js.map