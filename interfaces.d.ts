export declare type AccountLink = any;
export declare type ProviderId = string;
export declare type ProviderUserId = string;
export declare type AuthParams = {
    [s: string]: any;
};
export declare type AccountLinkParams = {
    [s: string]: any;
};
export declare type RequiredAuthParams = string[];
export declare type OnCheckParamsFailFunction = (key: string, i: number, requiredParams: RequiredAuthParams) => null | Error;
export declare type CheckParamsFunction = (obj: AuthParams, _requiredParams: RequiredAuthParams, onFail?: OnCheckParamsFailFunction) => null | Error;
export declare type FindAccountLinkFunc = (providerId: string, providerUserId: string) => Promise<AccountLink>;
