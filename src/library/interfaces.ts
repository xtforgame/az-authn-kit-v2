// =========

export type AccountLink = any;
export type User = any;

export type ProviderId = string;
export type ProviderUserId = string;

// ========

export type ParamsBase = { [s: string]: any };
export type AuthParams = ParamsBase;
export type AccountLinkParams = ParamsBase;

export type RequiredParamsBase = string[];
export type RequiredAuthParams = RequiredParamsBase;
export type RequiredAccountLinkParams = RequiredParamsBase;

export type OnCheckParamsFailFunction = (key: string, i: number, requiredParams: RequiredParamsBase) => null | Error;

export type CheckParamsFunction = (obj : ParamsBase, _requiredParams: RequiredParamsBase, onFail?: OnCheckParamsFailFunction) => null | Error;

export type FindAccountLinkFunc = (providerId : string, providerUserId : string) => Promise<AccountLink>;
export type CreateAccountLinkFunc = (alParams : AccountLinkParams, user : User) => Promise<AccountLink>;
