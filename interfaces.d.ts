export declare type AccountLink = any;
export declare type User = any;
export declare type ProviderId = string;
export declare type ProviderUserId = string;
export declare type ParamsBase = {
    [s: string]: any;
};
export declare type AuthParams = ParamsBase;
export declare type AccountLinkParams = ParamsBase;
export declare type RequiredParamsBase = string[];
export declare type RequiredAuthParams = RequiredParamsBase;
export declare type RequiredAccountLinkParams = RequiredParamsBase;
export declare type OnCheckParamsFailFunction = (key: string, i: number, requiredParams: RequiredParamsBase) => null | Error;
export declare type CheckParamsFunction = (obj: ParamsBase, _requiredParams: RequiredParamsBase, onFail?: OnCheckParamsFailFunction) => null | Error;
export declare type FindAccountLinkFunc = (providerId: string, providerUserId: string) => Promise<AccountLink>;
export declare type CreateAccountLinkFunc = (alParams: AccountLinkParams, user: User) => Promise<AccountLink>;
