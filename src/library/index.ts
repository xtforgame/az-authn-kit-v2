import '@babel/polyfill';
import AccountLinkStore from './core/AccountLinkStore';
import AuthProvider from './core/AuthProvider';

import AuthCore from './modules/AuthCore';
import AuthProviderManager from './modules/AuthProviderManager';
import KoaHelper from './modules/KoaHelper';

import BasicProvider from './providers/BasicProvider';

import {
  sha512gen_salt,
  crypt,
} from './utils/crypt';

export * from './interfaces';

export {
  // core
  AccountLinkStore,
  AuthProvider,

  // modules
  AuthCore,
  AuthProviderManager,
  KoaHelper,

  // providers
  BasicProvider,

  // utils
  sha512gen_salt,
  crypt,
};
