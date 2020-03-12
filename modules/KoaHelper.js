"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _azRestfulHelpers = require("az-restful-helpers");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var KoaHelper = function () {
  function KoaHelper(authCore, authProviderManager) {
    var _this = this;

    _classCallCheck(this, KoaHelper);

    _defineProperty(this, "authCore", void 0);

    _defineProperty(this, "authProviderManager", void 0);

    _defineProperty(this, "requireAdminPrivilege", function (ctx, next) {
      _this._ensureUserSession(ctx);

      var userSession = ctx.local.userSession;

      if (!userSession) {
        _azRestfulHelpers.RestfulError.koaThrowWith(ctx, 401, 'Unauthenticated');
      }

      if (!_this.isAdmin(userSession)) {
        _azRestfulHelpers.RestfulError.koaThrowWith(ctx, 403, 'Admin privilege required');
      }

      return next();
    });

    _defineProperty(this, "getIdentity", function (ctx, next) {
      _this._ensureUserSession(ctx);

      return next();
    });

    _defineProperty(this, "authenticate", function (ctx, next) {
      var json = ctx.request.body;
      return _this.authProviderManager.getAuthProvider(json.auth_type).then(function (provider) {
        return provider.authenticate(json);
      }).then(function (account) {
        var provider_user_access_info = account.provider_user_access_info;
        delete account.provider_user_access_info;

        var _this$authCore$create = _this.authCore.createSession(account),
            sessionInfo = _this$authCore$create.info,
            jwtPayload = _this$authCore$create.payload;

        if (provider_user_access_info.access_token) {
          sessionInfo.access_token = provider_user_access_info.access_token;
        }

        ctx.local = ctx.local || {};
        ctx.local.authData = {
          account: account,
          jwtPayload: jwtPayload,
          sessionInfo: sessionInfo
        };
        return ctx.body = _objectSpread({}, sessionInfo, {
          jwtPayload: jwtPayload
        });
      })["catch"](function (error) {
        if (error.status === 401) {
          return _azRestfulHelpers.RestfulResponse.koaResponseWith(ctx, 200, {
            error: error.message
          });
        }

        if (error instanceof _azRestfulHelpers.RestfulError) {
          return error.koaThrow(ctx);
        }

        throw error;
      });
    });

    this.authCore = authCore;
    this.authProviderManager = authProviderManager;
  }

  _createClass(KoaHelper, [{
    key: "_ensureLocal",
    value: function _ensureLocal(ctx) {
      ctx.local = ctx.local || {};
    }
  }, {
    key: "_ensureUserSession",
    value: function _ensureUserSession(ctx) {
      this._ensureLocal(ctx);

      if (ctx.local.userSession) {
        return;
      }

      ctx.local.userSession = this.verifyUserSession(ctx.request);
    }
  }, {
    key: "verifyUserSession",
    value: function verifyUserSession(request) {
      return this.authCore.verifyAuthorization(request.headers);
    }
  }, {
    key: "isAdmin",
    value: function isAdmin(userSession) {
      return userSession && userSession.privilege === 'admin';
    }
  }, {
    key: "hasUserPrivilege",
    value: function hasUserPrivilege(userSession, userId) {
      return this.isAdmin(userSession) || userId === 'me' || userSession.userid === userId;
    }
  }]);

  return KoaHelper;
}();

exports["default"] = KoaHelper;