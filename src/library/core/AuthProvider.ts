import { RestfulError } from 'az-restful-helpers';
import AccountLinkStore from './AccountLinkStore';
import {
  CheckParamsFunction,

  AuthParams,
  RequiredAuthParams,
  ProviderId,
  ProviderUserId,
  AccountLink,
} from '../interfaces';
import checkParams from '../utils/checkParams';

export default class AuthProvider {
  static requiredAuthParams : RequiredAuthParams = ['username', 'password'];

  static providerId : ProviderId = 'basic';

  static providerUserId : ProviderUserId = 'username';

  accountLinkStore : AccountLinkStore;
  checkParams : CheckParamsFunction;

  constructor(accountLinkStore : AccountLinkStore) {
    this.accountLinkStore = accountLinkStore;
    this.checkParams = checkParams;
  }

  get requiredAuthParams() : RequiredAuthParams {
    return (<any>this.constructor).requiredAuthParams;
  }

  get providerId() : ProviderId {
    return (<any>this.constructor).providerId;
  }

  get providerUserId() : ProviderUserId {
    return (<any>this.constructor).providerUserId;
  }

  verifyAuthParams(authParams : AuthParams, accountLink : AccountLink) {
    return RestfulError.rejectWith(501, 'this authentication method is not implemented');
  }

  authenticate(authParams : AuthParams) {
    const result = this.checkParams(authParams, this.requiredAuthParams);
    if (result) {
      return Promise.reject(result);
    }
    const { [this.providerUserId]: providerUserId } = authParams;
    return this.accountLinkStore.findAccountLink(this.providerId, providerUserId)
      .then((account) => {
        if (!account) {
          return RestfulError.rejectWith(401, 'Wrong credential');
        }
        return this.verifyAuthParams(authParams, account);
      });
  }
}
