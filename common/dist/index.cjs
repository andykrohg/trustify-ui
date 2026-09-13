'use strict';

/**
 * Keys in `TrustificationEnv` that are only used on the server and therefore do not
 * need to be sent to the client.
 */
const SERVER_ENV_KEYS = ["PORT", "TRUSTIFY_API_URL", "BRANDING"];
/**
 * Create a `TrustificationEnv` from a partial `TrustificationEnv` with a set of default values.
 */
const buildTrustificationEnv = ({ NODE_ENV = "production", PORT, VERSION = "99.0.0", MOCK = "off", OIDC_SERVER_URL, OIDC_SERVER_IS_EMBEDDED = "false", OIDC_SERVER_EMBEDDED_PATH, AUTH_REQUIRED = "true", OIDC_CLIENT_ID, OIDC_SCOPE, OIDC_LOAD_USER = "true", UI_INGRESS_PROXY_BODY_SIZE = "500m", TRUSTIFY_API_URL, BRANDING, } = {}) => ({
    NODE_ENV,
    PORT,
    VERSION,
    MOCK,
    OIDC_SERVER_URL,
    OIDC_SERVER_IS_EMBEDDED,
    OIDC_SERVER_EMBEDDED_PATH,
    OIDC_LOAD_USER,
    AUTH_REQUIRED,
    OIDC_CLIENT_ID,
    OIDC_SCOPE,
    UI_INGRESS_PROXY_BODY_SIZE,
    TRUSTIFY_API_URL,
    BRANDING,
});
/**
 * Default values for `TrustificationEnvType`.
 */
const TRUSTIFICATION_ENV_DEFAULTS = buildTrustificationEnv();
/**
 * Current `@trustify-ui` environment configurations from `process.env`.
 */
const TRUSTIFICATION_ENV = buildTrustificationEnv(process.env);

const strings = {
  application: {
    title: 'Trustification',
    name: 'Trustification UI',
    description: 'Trustification UI'
  },
  about: {
    displayName: 'Trustification',
    imageSrc: 'branding/images/masthead-logo.svg',
    documentationUrl: 'https://trustification.io/'
  },
  masthead: {
    leftBrand: {
      src: 'branding/images/masthead-logo.svg',
      alt: 'brand',
      height: '40px'
    },
    leftTitle: null,
    rightBrand: null,
    supportUrl: 'https://github.com/trustification/trustify/issues'
  }
};

// Note: Typescript will look at the `paths` definition to resolve this import
//       to a stub JSON file.  In the next rollup build step, that import will
//       be replaced by the rollup virtual plugin with a dynamically generated
//       JSON import with the actual branding information.
const brandingStrings = strings;

/**
 * Return a base64 encoded JSON string containing the given `env` object.
 */
const encodeEnv = (env, exclude) => {
    const filtered = exclude
        ? Object.fromEntries(Object.entries(env).filter(([key]) => !exclude.includes(key)))
        : env;
    return btoa(JSON.stringify(filtered));
};
/**
 * Return an objects from a base64 encoded JSON string.
 */
const decodeEnv = (env) => !env ? {} : JSON.parse(atob(env));
// TODO: Include `index.html.ejs` to `index.html` template file processing...

exports.SERVER_ENV_KEYS = SERVER_ENV_KEYS;
exports.TRUSTIFICATION_ENV = TRUSTIFICATION_ENV;
exports.TRUSTIFICATION_ENV_DEFAULTS = TRUSTIFICATION_ENV_DEFAULTS;
exports.brandingStrings = brandingStrings;
exports.buildTrustificationEnv = buildTrustificationEnv;
exports.decodeEnv = decodeEnv;
exports.encodeEnv = encodeEnv;
//# sourceMappingURL=index.cjs.map
