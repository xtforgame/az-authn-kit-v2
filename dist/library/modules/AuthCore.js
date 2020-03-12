"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _jwtSessionHelper = _interopRequireDefault(require("jwt-session-helper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AuthCore = function () {
  function AuthCore(secret) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, AuthCore);

    _defineProperty(this, "acceptedIssuers", void 0);

    _defineProperty(this, "jwtSessionHelper", void 0);

    _defineProperty(this, "options", void 0);

    _defineProperty(this, "Session", void 0);

    _defineProperty(this, "decodeToken", function (token) {
      var handleError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (e) {};

      try {
        return _this.jwtSessionHelper.decode(token);
      } catch (e) {
        handleError(e);
      }

      return null;
    });

    _defineProperty(this, "verifyToken", function (token) {
      var handleError = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (e) {};

      try {
        var result = _this.jwtSessionHelper.verify(token);

        if (!_this.acceptedIssuers.includes(result.iss)) {
          throw new Error("Unaccepted issuer: ".concat(result.iss));
        }

        return result;
      } catch (e) {
        handleError(e);
      }

      return null;
    });

    _defineProperty(this, "signToken", function (token) {
      return _this.jwtSessionHelper.sign(token);
    });

    var _options$algorithm = options.algorithm,
        algorithm = _options$algorithm === void 0 ? 'HS256' : _options$algorithm,
        _options$issuer = options.issuer,
        issuer = _options$issuer === void 0 ? 'localhost' : _options$issuer,
        _options$expiresIn = options.expiresIn,
        expiresIn = _options$expiresIn === void 0 ? '1y' : _options$expiresIn,
        acceptedIssuers = options.acceptedIssuers;
    this.acceptedIssuers = [];

    if (acceptedIssuers) {
      this.acceptedIssuers = acceptedIssuers;
    } else {
      this.acceptedIssuers = [issuer];
    }

    this.jwtSessionHelper = options.jwtSessionHelper || new _jwtSessionHelper["default"](secret, {
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
    this.Session = this.jwtSessionHelper.Session;
    this.options = options;
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
      return this.jwtSessionHelper.createSession(sessionData, {
        mutatePayload: true
      });
    }
  }, {
    key: "removeSession",
    value: function removeSession(token) {
      return Promise.resolve(0);
    }
  }]);

  return AuthCore;
}();

exports["default"] = AuthCore;