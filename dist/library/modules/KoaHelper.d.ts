import AuthCore from './AuthCore';
import AuthProviderManager from './AuthProviderManager';
export default class KoaHelper {
    authCore: AuthCore;
    authProviderManager: AuthProviderManager;
    constructor(authCore: AuthCore, authProviderManager: AuthProviderManager);
    _ensureLocal(ctx: any): void;
    _ensureUserSession(ctx: any): void;
    verifyUserSession(request: any): any;
    isAdmin(userSession: any): boolean;
    hasUserPrivilege(userSession: any, userId: any): boolean;
    requireAdminPrivilege: (ctx: any, next: any) => any;
    getIdentity: (ctx: any, next: any) => any;
    authenticate: (ctx: any, next: any) => Promise<any>;
}
