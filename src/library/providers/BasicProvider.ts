import { RestfulError } from 'az-restful-helpers';
import AuthProvider from '../core/AuthProvider';
import {
  CheckParamsFunction,

  AuthParams,
  RequiredAuthParams,
  ProviderId,
  ProviderUserId,
  AccountLink,
} from '../interfaces';
import { crypt } from '../utils/crypt';

export default class BasicProvider extends AuthProvider {
  static requiredAuthParams : RequiredAuthParams = ['username', 'password'];

  static providerId : ProviderId = 'basic';

  static providerUserIdName : ProviderUserId = 'username';

  verifyAuthParams(authParams : AuthParams, accountLink : AccountLink) {
    const { password } = authParams;
    const cryptedPassword = accountLink.provider_user_access_info && accountLink.provider_user_access_info.password;
    if (cryptedPassword && crypt(password, cryptedPassword) === cryptedPassword) {
      return Promise.resolve(accountLink);
    }
    return RestfulError.rejectWith(401, 'Wrong credential');
  }
}
