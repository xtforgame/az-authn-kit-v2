import AuthProvider from '../core/AuthProvider';
import { AuthParams, RequiredAuthParams, ProviderId, ProviderUserId, AccountLink } from '../interfaces';
export default class BasicProvider extends AuthProvider {
    static requiredAuthParams: RequiredAuthParams;
    static providerId: ProviderId;
    static providerUserIdName: ProviderUserId;
    verifyAuthParams(authParams: AuthParams, accountLink: AccountLink): any;
}
