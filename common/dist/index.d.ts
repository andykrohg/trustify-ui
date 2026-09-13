export * from "./environment.js";
export * from "./branding.js";
/**
 * Return a base64 encoded JSON string containing the given `env` object.
 */
export declare const encodeEnv: (env: object, exclude?: string[]) => string;
/**
 * Return an objects from a base64 encoded JSON string.
 */
export declare const decodeEnv: (env: string) => object;
//# sourceMappingURL=index.d.ts.map