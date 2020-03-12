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

var AuthProvider = function () {
  function AuthProvider(accountLinkStore) {
    _classCallCheck(this, AuthProvider);

    this.accountLinkStore = accountLinkStore;
    this.checkParams = _checkParams["default"];
  }

  _createClass(AuthProvider, [{
    key: "verifyAuthParams",
    value: function verifyAuthParams() {
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

      var providerUserId = authParams[this.providerUserIdName];
      return this.accountLinkStore.findAccountLink(this.providerId, providerUserId).then(function (account) {
        if (!account) {
          return _azRestfulHelpers.RestfulError.rejectWith(401, 'Wrong credential');
        }

        return _this.verifyAuthParams(authParams, account);
      });
    }
  }, {
    key: "getAlParamsForCreate",
    value: function getAlParamsForCreate() {
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

      return this.getAlParamsForCreate(alParams).then(function (paramsForCreate) {
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
    key: "providerUserIdName",
    get: function get() {
      return this.constructor.providerUserIdName;
    }
  }]);

  return AuthProvider;
}();

exports["default"] = AuthProvider;