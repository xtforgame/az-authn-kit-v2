"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _azRestfulHelpers = require("az-restful-helpers");

var _AuthProvider2 = _interopRequireDefault(require("../core/AuthProvider"));

var _crypt = require("../utils/crypt");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var BasicProvider = function (_AuthProvider) {
  _inherits(BasicProvider, _AuthProvider);

  function BasicProvider() {
    _classCallCheck(this, BasicProvider);

    return _possibleConstructorReturn(this, _getPrototypeOf(BasicProvider).apply(this, arguments));
  }

  _createClass(BasicProvider, [{
    key: "verifyAuthParams",
    value: function verifyAuthParams(authParams, accountLink) {
      var password = authParams.password;
      var cryptedPassword = accountLink.provider_user_access_info && accountLink.provider_user_access_info.password;

      if (cryptedPassword && (0, _crypt.crypt)(password, cryptedPassword) === cryptedPassword) {
        return Promise.resolve(accountLink);
      }

      return _azRestfulHelpers.RestfulError.rejectWith(401, 'Wrong credential');
    }
  }, {
    key: "getAccountLinkParamsForCreate",
    value: function getAccountLinkParamsForCreate(alParams) {
      var result = this.checkParams(alParams, ['username', 'password']);

      if (result) {
        return Promise.reject(result);
      }

      return Promise.resolve({
        provider_id: this.providerId,
        provider_user_id: alParams.username,
        provider_user_access_info: {
          password: (0, _crypt.crypt)(alParams.password, (0, _crypt.sha512gen_salt)())
        }
      });
    }
  }]);

  return BasicProvider;
}(_AuthProvider2["default"]);

exports["default"] = BasicProvider;

_defineProperty(BasicProvider, "requiredAuthParams", ['username', 'password']);

_defineProperty(BasicProvider, "providerId", 'basic');

_defineProperty(BasicProvider, "providerUserIdName", 'username');