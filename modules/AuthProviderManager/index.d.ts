import AccountLinkStore from '../../core/AccountLinkStore';
import AuthProvider from '../../core/AuthProvider';
export declare type SupportedProviders = {
    [s: string]: {
        provider: typeof AuthProvider;
    };
};
export declare type ProviderMap = {
    [s: string]: AuthProvider;
};
export declare type AuthProviderManagerOptions = {
    [s: string]: AuthProvider;
};
export default class AuthProviderManager {
    supportedProviders: SupportedProviders;
    providerMap: ProviderMap;
    options: AuthProviderManagerOptions;
    accountLinkStore: AccountLinkStore | null;
    constructor(supportedProviders: SupportedProviders, options: AuthProviderManagerOptions);
    setAccountLinkStore(accountLinkStore: AccountLinkStore): void;
    getAuthProvider(authType: any): Promise<AuthProvider>;
}
