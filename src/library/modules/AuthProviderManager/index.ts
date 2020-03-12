/* eslint-disable no-underscore-dangle */
import { RestfulError } from 'az-restful-helpers';
import AccountLinkStore from '../../core/AccountLinkStore';
import AuthProvider from '../../core/AuthProvider';
import {
  CheckParamsFunction,

  AuthParams,
  RequiredAuthParams,
  ProviderId,
  ProviderUserId,
  AccountLink,
} from '../../interfaces';

export type SupportedProviders = {
  [s : string]: {
    provider: typeof AuthProvider,
  },
};

export type ProviderMap = {
  [s : string]: AuthProvider,
};

export type AuthProviderManagerOptions = { [s : string]: AuthProvider };

export default class AuthProviderManager {
  supportedProviders : SupportedProviders;
  providerMap : ProviderMap;
  options : AuthProviderManagerOptions;
  accountLinkStore : AccountLinkStore | null;

  constructor(supportedProviders : SupportedProviders, options : AuthProviderManagerOptions) {
    this.supportedProviders = supportedProviders;
    this.providerMap = {};
    this.options = options;
    this.accountLinkStore = null;
  }

  setAccountLinkStore(accountLinkStore : AccountLinkStore) {
    this.accountLinkStore = accountLinkStore;
    this.providerMap = {};
    Object.keys(this.supportedProviders).forEach((key) => {
      const supportedProvider = this.supportedProviders[key];
      const Provider = supportedProvider.provider;
      this.providerMap[key] = new Provider(this.accountLinkStore!);
    });
  }

  getAuthProvider(authType) : Promise<AuthProvider> {
    return new Promise<AuthProvider>((resolve, reject) => {
      if (!authType) {
        return reject(new RestfulError(400, '"auth_type" is empty'));
      }

      const authProvider = this.providerMap[authType];
      if (!authProvider) {
        return reject(new RestfulError(400, `Unknown auth_type: ${authType}`));
      }

      return resolve(authProvider);
    });
  }
}
