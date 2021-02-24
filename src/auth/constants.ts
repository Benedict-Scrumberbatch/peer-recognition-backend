//Must not expose the key publicly in production. Docs suggest using either a secrets vault, environment variable, or configuration service.
export const jwtConstants = {
    secret: 'secretKey',
}