import { RestfulError } from 'az-restful-helpers';
import AuthProvider from '../core/AuthProvider';
import {
  CheckParamsFunction,

  AuthParams,
  RequiredAuthParams,

  AccountLinkParams,

  ProviderId,
  ProviderUserId,
  AccountLink,
} from '../interfaces';
import { sha512gen_salt, crypt } from '../utils/crypt';

export default class BasicProvider extends AuthProvider {
  static requiredAuthParams : RequiredAuthParams = ['username', 'password'];

  static providerId : ProviderId = 'basic';

  static providerUserIdName : ProviderUserId = 'username';

  verifyAuthParams(authParams : AuthParams, accountLink : AccountLink) : Promise<AccountLink> {
    const { password } = authParams;
    const cryptedPassword = accountLink.provider_user_access_info && accountLink.provider_user_access_info.password;
    if (cryptedPassword && crypt(password, cryptedPassword) === cryptedPassword) {
      return Promise.resolve(accountLink);
    }
    return RestfulError.rejectWith(401, 'Wrong credential');
  }

  getAccountLinkParamsForCreate(alParams : AccountLinkParams) : Promise<AccountLinkParams> {
    const result = this.checkParams(alParams, ['username', 'password']);
    if (result) {
      return Promise.reject(result);
    }
    return Promise.resolve({
      provider_id: this.providerId,
      provider_user_id: alParams.username,
      provider_user_access_info: {
        password: crypt(alParams.password, sha512gen_salt()),
      },
    });
  }
}
