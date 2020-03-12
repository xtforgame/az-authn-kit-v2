import AccountLinkStore from './AccountLinkStore';
import { CheckParamsFunction, AuthParams, RequiredAuthParams, ProviderId, ProviderUserId, AccountLink } from '../interfaces';
export default class AuthProvider {
    static requiredAuthParams: RequiredAuthParams;
    static providerId: ProviderId;
    static providerUserId: ProviderUserId;
    accountLinkStore: AccountLinkStore;
    checkParams: CheckParamsFunction;
    constructor(accountLinkStore: AccountLinkStore);
    get requiredAuthParams(): RequiredAuthParams;
    get providerId(): ProviderId;
    get providerUserId(): ProviderUserId;
    verifyAuthParams(authParams: AuthParams, accountLink: AccountLink): any;
    authenticate(authParams: AuthParams): Promise<any>;
}
