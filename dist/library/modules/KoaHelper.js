"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _azRestfulHelpers = require("az-restful-helpers");

var _ModuleBase2 = _interopRequireDefault(require("./ModuleBase"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var KoaHelper = function (_ModuleBase) {
  _inherits(KoaHelper, _ModuleBase);

  function KoaHelper(authCore, authProviderManager) {
    var _this;

    _classCallCheck(this, KoaHelper);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(KoaHelper).call(this));

    _defineProperty(_assertThisInitialized(_this), "requireAdminPrivilege", function (ctx, next) {
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

    _defineProperty(_assertThisInitialized(_this), "getIdentity", function (ctx, next) {
      _this._ensureUserSession(ctx);

      return next();
    });

    _defineProperty(_assertThisInitialized(_this), "authenticate", function (ctx, next) {
      var json = ctx.request.body;
      return _this.authProviderManager.getAuthProvider(json.auth_type).then(function (provider) {
        return provider.authenticate(json);
      }).then(function (account) {
        var provider_user_access_info = account.provider_user_access_info;
        delete account.provider_user_access_info;

        var _this$authCore$create = _this.authCore.createSession(account),
            info = _this$authCore$create.info;

        if (provider_user_access_info.access_token) {
          info.access_token = provider_user_access_info.access_token;
        }

        ctx.local = ctx.local || {};
        ctx.local.authData = {
          account: account,
          sessionInfo: info
        };
        return ctx.body = info;
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

    _this.authCore = authCore;
    _this.authProviderManager = authProviderManager;
    return _this;
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
}(_ModuleBase2["default"]);

exports["default"] = KoaHelper;

_defineProperty(KoaHelper, "$name", 'koaHelper');

_defineProperty(KoaHelper, "$type", 'service');

_defineProperty(KoaHelper, "$inject", ['authCore', 'authProviderManager']);

_defineProperty(KoaHelper, "$funcDeps", {
  init: [],
  start: []
});