/* eslint-disable no-underscore-dangle */
import {
  RestfulResponse,
  RestfulError,
} from 'az-restful-helpers';

export default class KoaHelper {
  constructor(authCore, authProviderManager) {
    this.authCore = authCore;
    this.authProviderManager = authProviderManager;
  }

  _ensureLocal(ctx) {
    ctx.local = ctx.local || {};
  }

  _ensureUserSession(ctx) {
    this._ensureLocal(ctx);
    if (ctx.local.userSession) {
      return;
    }
    ctx.local.userSession = this.verifyUserSession(ctx.request);
  }

  verifyUserSession(request) {
    return this.authCore.verifyAuthorization(request.headers);
  }

  isAdmin(userSession) {
    return (userSession && userSession.privilege === 'admin');
  }

  hasUserPrivilege(userSession, userId) {
    return this.isAdmin(userSession) || userId === 'me' || (userSession.userid === userId);
  }

  // middlewares
  requireAdminPrivilege = (ctx, next) => {
    this._ensureUserSession(ctx);
    const { userSession } = ctx.local;
    if (!userSession) {
      RestfulError.koaThrowWith(ctx, 401, 'Unauthenticated');
    }

    if (!this.isAdmin(userSession)) {
      RestfulError.koaThrowWith(ctx, 403, 'Admin privilege required');
    }

    return next();
  };

  getIdentity = (ctx, next) => {
    this._ensureUserSession(ctx);
    return next();
  };

  // post sessions
  authenticate = (ctx, next) => {
    const json = ctx.request.body;
    return this.authProviderManager.getAuthProvider(json.auth_type)
      .then(provider => provider.authenticate(json))
      .then((account) => {
        const { provider_user_access_info } = account;
        delete account.provider_user_access_info; // eslint-disable-line no-param-reassign
        const { info: sessionInfo, payload: jwtPayload } = this.authCore.createSession(account);
        if (provider_user_access_info.access_token) {
          sessionInfo.access_token = provider_user_access_info.access_token;
        }

        ctx.local = ctx.local || {};
        ctx.local.authData = {
          account,
          jwtPayload,
          sessionInfo,
        };

        return (ctx.body = {
          ...sessionInfo,
          jwtPayload,
        });
      })
      .catch((error) => {
        if (error.status === 401) {
          return RestfulResponse.koaResponseWith(ctx, 200, { error: error.message });
        }
        if (error instanceof RestfulError) {
          return error.koaThrow(ctx);
        }
        throw error;
      });
  };
}
