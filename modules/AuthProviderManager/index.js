"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _azRestfulHelpers = require("az-restful-helpers");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AuthProviderManager = function () {
  function AuthProviderManager(supportedProviders, options) {
    _classCallCheck(this, AuthProviderManager);

    _defineProperty(this, "supportedProviders", void 0);

    _defineProperty(this, "providerMap", void 0);

    _defineProperty(this, "options", void 0);

    _defineProperty(this, "accountLinkStore", void 0);

    this.supportedProviders = supportedProviders;
    this.providerMap = {};
    this.options = options;
    this.accountLinkStore = null;
  }

  _createClass(AuthProviderManager, [{
    key: "setAccountLinkStore",
    value: function setAccountLinkStore(accountLinkStore) {
      var _this = this;

      this.accountLinkStore = accountLinkStore;
      this.providerMap = {};
      Object.keys(this.supportedProviders).forEach(function (key) {
        var supportedProvider = _this.supportedProviders[key];
        var Provider = supportedProvider.provider;
        _this.providerMap[key] = new Provider(_this.accountLinkStore);
      });
    }
  }, {
    key: "getAuthProvider",
    value: function getAuthProvider(authType) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (!authType) {
          return reject(new _azRestfulHelpers.RestfulError(400, '"auth_type" is empty'));
        }

        var authProvider = _this2.providerMap[authType];

        if (!authProvider) {
          return reject(new _azRestfulHelpers.RestfulError(400, "Unknown auth_type: ".concat(authType)));
        }

        return resolve(authProvider);
      });
    }
  }]);

  return AuthProviderManager;
}();

exports["default"] = AuthProviderManager;