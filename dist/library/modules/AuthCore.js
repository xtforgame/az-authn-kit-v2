"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _jwtSessionHelper = _interopRequireDefault(require("jwt-session-helper"));

var _ModuleBase2 = _interopRequireDefault(require("./ModuleBase"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AuthCore = function (_ModuleBase) {
  _inherits(AuthCore, _ModuleBase);

  function AuthCore(secret) {
    var _this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, AuthCore);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AuthCore).call(this));

    _defineProperty(_assertThisInitialized(_this), "decodeToken", function (token) {
      var handleError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

      try {
        return _this.jwtSessionHelper.decode(token);
      } catch (e) {
        handleError(e);
      }

      return null;
    });

    _defineProperty(_assertThisInitialized(_this), "verifyToken", function (token) {
      var handleError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

      try {
        return _this.jwtSessionHelper.verify(token);
      } catch (e) {
        handleError(e);
      }

      return null;
    });

    _defineProperty(_assertThisInitialized(_this), "signToken", function (token) {
      return _this.jwtSessionHelper.sign(token);
    });

    var _options$algorithm = options.algorithm,
        algorithm = _options$algorithm === void 0 ? 'HS256' : _options$algorithm,
        _options$issuer = options.issuer,
        issuer = _options$issuer === void 0 ? 'localhost' : _options$issuer,
        _options$expiresIn = options.expiresIn,
        expiresIn = _options$expiresIn === void 0 ? '1y' : _options$expiresIn;
    _this.jwtSessionHelper = options.jwtSessionHelper || new _jwtSessionHelper["default"](secret, {
      defaults: {
        algorithm: algorithm
      },
      signDefaults: {
        issuer: issuer,
        expiresIn: expiresIn
      },
      parsePayload: function parsePayload(_ref) {
        var user = _ref.user,
            provider_id = _ref.provider_id,
            provider_user_id = _ref.provider_user_id,
            rest = _objectWithoutProperties(_ref, ["user", "provider_id", "provider_user_id"]);

        return _objectSpread({
          user_id: user.id,
          user_name: user.name,
          auth_type: provider_id,
          auth_id: provider_user_id,
          privilege: user.privilege,
          subject: "user:".concat(user.id, ":", 0),
          token_type: 'Bearer'
        }, rest);
      },
      exposeInfo: function exposeInfo(originalData, payload) {
        var result = _objectSpread({}, payload);

        delete result.auth_type;
        delete result.auth_id;
        delete result.expiry_date;
        return result;
      }
    });
    _this.Session = _this.jwtSessionHelper.Session;
    _this.options = options;
    return _this;
  }

  _createClass(AuthCore, [{
    key: "verifyAuthorization",
    value: function verifyAuthorization(headers) {
      var handleError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (e) {
        return console.warn('e :', e);
      };
      var authorization = headers;

      if (typeof headers !== 'string') {
        authorization = headers.authorization;
      }

      if (!authorization || typeof authorization !== 'string') {
        return null;
      }

      var tokenStartPos = authorization.indexOf(' ');

      if (tokenStartPos < 0) {
        return null;
      }

      var token = authorization.substr(tokenStartPos + 1, authorization.length - tokenStartPos - 1);
      return token && this.verifyToken(token, handleError);
    }
  }, {
    key: "createSession",
    value: function createSession(sessionData) {
      return this.jwtSessionHelper.createSession(sessionData);
    }
  }, {
    key: "removeSession",
    value: function removeSession(token) {
      return Promise.resolve(0);
    }
  }]);

  return AuthCore;
}(_ModuleBase2["default"]);

exports["default"] = AuthCore;

_defineProperty(AuthCore, "$name", 'authCore');

_defineProperty(AuthCore, "$type", 'service');

_defineProperty(AuthCore, "$inject", []);

_defineProperty(AuthCore, "$funcDeps", {
  init: [],
  start: []
});