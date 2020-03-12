import '@babel/polyfill';
import AuthCore from './modules/AuthCore';
import SequelizeStore from './modules/SequelizeStore';
import AuthProviderManager from './modules/AuthProviderManager';
import KoaHelper from './modules/KoaHelper';

import AuthProvider from './core/AuthProvider';
import BasicProvider from './providers/BasicProvider';

import {
  sha512gen_salt,
  crypt,
} from './utils/crypt';

export * from './interfaces';

export {
  // modules
  AuthCore,
  SequelizeStore,
  AuthProviderManager,
  KoaHelper,

  // providers
  AuthProvider,
  BasicProvider,

  // utils
  sha512gen_salt,
  crypt,
};
