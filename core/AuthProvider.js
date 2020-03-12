"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _azRestfulHelpers = require("az-restful-helpers");

var _checkParams = _interopRequireDefault(require("../utils/checkParams"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AuthProvider = function () {
  function AuthProvider(accountLinkStore) {
    _classCallCheck(this, AuthProvider);

    _defineProperty(this, "accountLinkStore", void 0);

    _defineProperty(this, "checkParams", void 0);

    this.accountLinkStore = accountLinkStore;
    this.checkParams = _checkParams["default"];
  }

  _createClass(AuthProvider, [{
    key: "verifyAuthParams",
    value: function verifyAuthParams(authParams, accountLink) {
      return _azRestfulHelpers.RestfulError.rejectWith(501, 'this authentication method is not implemented');
    }
  }, {
    key: "authenticate",
    value: function authenticate(authParams) {
      var _this = this;

      var result = this.checkParams(authParams, this.requiredAuthParams);

      if (result) {
        return Promise.reject(result);
      }

      var providerUserId = authParams[this.providerUserId];
      return this.accountLinkStore.findAccountLink(this.providerId, providerUserId).then(function (account) {
        if (!account) {
          return _azRestfulHelpers.RestfulError.rejectWith(401, 'Wrong credential');
        }

        return _this.verifyAuthParams(authParams, account);
      });
    }
  }, {
    key: "getAccountLinkParamsForCreate",
    value: function getAccountLinkParamsForCreate(alParams) {
      return _azRestfulHelpers.RestfulError.rejectWith(501, 'this authentication method is not implemented');
    }
  }, {
    key: "createAccountLink",
    value: function createAccountLink(alParams, user) {
      var _this2 = this;

      var result = this.checkParams(alParams, this.requiredAuthParams);

      if (result) {
        return Promise.reject(result);
      }

      return this.getAccountLinkParamsForCreate(alParams).then(function (paramsForCreate) {
        return _this2.accountLinkStore.createAccountLink(paramsForCreate, user);
      });
    }
  }, {
    key: "requiredAuthParams",
    get: function get() {
      return this.constructor.requiredAuthParams;
    }
  }, {
    key: "providerId",
    get: function get() {
      return this.constructor.providerId;
    }
  }, {
    key: "providerUserId",
    get: function get() {
      return this.constructor.providerUserId;
    }
  }]);

  return AuthProvider;
}();

exports["default"] = AuthProvider;

_defineProperty(AuthProvider, "requiredAuthParams", ['username', 'password']);

_defineProperty(AuthProvider, "providerId", 'basic');

_defineProperty(AuthProvider, "providerUserId", 'username');