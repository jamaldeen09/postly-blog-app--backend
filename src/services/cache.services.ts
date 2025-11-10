// ** Custom servies to perform cache operation ** \\
import { cacheStore } from "../server.js"

const readOperation = (
    cacheKey: string,
) => {
    return cacheStore.get(cacheKey)
}

const writeOperation = <T> (value: T, cacheKey: string) => {
    cacheStore.set(cacheKey, JSON.stringify(value));
    return;
};

const deleteOperation = (
    deleteType: "patterns" | "cacheKey",
    cacheKey?: string,
    pattern?: string,
) => {
    if (deleteType === "cacheKey") {
        cacheStore.delete(cacheKey!);
        return;
    } else {
        for (const key of cacheStore.keys()) {
            if (key.startsWith(pattern!)){
                cacheStore.delete(key);
            }
        }

        return;
    }
}

export {
    readOperation,
    writeOperation,
    deleteOperation,
}