import JwtSessionHelper from 'jwt-session-helper';
export declare type HandleJwtFunctionError = (e: Error) => any;
export declare type AuthCoreOptions = {
    jwtSessionHelper?: JwtSessionHelper;
    algorithm?: string;
    issuer?: string;
    expiresIn?: string;
    acceptedIssuers?: string[];
};
export default class AuthCore {
    acceptedIssuers: string[];
    jwtSessionHelper: JwtSessionHelper;
    options: AuthCoreOptions;
    Session: any;
    constructor(secret: any, options?: AuthCoreOptions);
    decodeToken: (token: any, handleError?: HandleJwtFunctionError) => any;
    verifyToken: (token: any, handleError?: HandleJwtFunctionError) => any;
    signToken: (token: any) => any;
    verifyAuthorization(headers: any, handleError?: (e: any) => void): any;
    createSession(sessionData: any): any;
    removeSession(token: any): Promise<number>;
}
