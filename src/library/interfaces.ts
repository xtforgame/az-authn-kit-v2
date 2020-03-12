// =========

export type AccountLink = any;

export type ProviderId = string;
export type ProviderUserId = string;

// ========

export type AuthParams = { [s: string]: any };
export type AccountLinkParams = { [s: string]: any };

export type RequiredAuthParams = string[];

export type OnCheckParamsFailFunction = (key: string, i: number, requiredParams: RequiredAuthParams) => null | Error;

export type CheckParamsFunction = (obj : AuthParams, _requiredParams: RequiredAuthParams, onFail?: OnCheckParamsFailFunction) => null | Error;

export type FindAccountLinkFunc = (providerId : string, providerUserId : string) => Promise<AccountLink>;
