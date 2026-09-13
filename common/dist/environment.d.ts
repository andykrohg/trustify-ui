/** Define process.env to contain `TrustificationEnvType` */
declare global {
    namespace NodeJS {
        interface ProcessEnv extends Partial<Readonly<TrustificationEnvType>> {
        }
    }
}
/**
 * The set of environment variables used by `@trustify-ui` packages.
 */
export type TrustificationEnvType = {
    NODE_ENV: "development" | "production" | "test";
    VERSION: string;
    /** Controls how mock data is injected on the client */
    MOCK: string;
    /** Enable RBAC authentication/authorization */
    AUTH_REQUIRED: "true" | "false";
    /** SSO / Oidc client id */
    OIDC_CLIENT_ID?: string;
    /** SSO / Oidc scope */
    OIDC_SCOPE?: string;
    /** UI upload file size limit in megabytes (MB), suffixed with "m" */
    UI_INGRESS_PROXY_BODY_SIZE: string;
    /** The listen port for the UI's server */
    PORT?: string;
    /** Target URL for the UI server's `/auth` proxy */
    OIDC_SERVER_URL?: string;
    /** Whether or not `/auth` proxy will be enabled */
    OIDC_SERVER_IS_EMBEDDED?: "true" | "false";
    /** The Keycloak Realm */
    OIDC_SERVER_EMBEDDED_PATH?: string;
    /** Whether or not call to /loaduser endpoint on Auth flow */
    OIDC_LOAD_USER?: "true" | "false";
    /** Target URL for the UI server's `/api` proxy */
    TRUSTIFY_API_URL?: string;
    /** Location of branding files (relative paths computed from the project source root) */
    BRANDING?: string;
};
/**
 * Keys in `TrustificationEnv` that are only used on the server and therefore do not
 * need to be sent to the client.
 */
export declare const SERVER_ENV_KEYS: string[];
/**
 * Create a `TrustificationEnv` from a partial `TrustificationEnv` with a set of default values.
 */
export declare const buildTrustificationEnv: ({ NODE_ENV, PORT, VERSION, MOCK, OIDC_SERVER_URL, OIDC_SERVER_IS_EMBEDDED, OIDC_SERVER_EMBEDDED_PATH, AUTH_REQUIRED, OIDC_CLIENT_ID, OIDC_SCOPE, OIDC_LOAD_USER, UI_INGRESS_PROXY_BODY_SIZE, TRUSTIFY_API_URL, BRANDING, }?: Partial<TrustificationEnvType>) => TrustificationEnvType;
/**
 * Default values for `TrustificationEnvType`.
 */
export declare const TRUSTIFICATION_ENV_DEFAULTS: TrustificationEnvType;
/**
 * Current `@trustify-ui` environment configurations from `process.env`.
 */
export declare const TRUSTIFICATION_ENV: TrustificationEnvType;
//# sourceMappingURL=environment.d.ts.map