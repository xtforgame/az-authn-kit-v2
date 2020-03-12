"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  AuthCore: true,
  SequelizeStore: true,
  AuthProviderManager: true,
  KoaHelper: true,
  AuthProvider: true,
  BasicProvider: true,
  sha512gen_salt: true,
  crypt: true
};
Object.defineProperty(exports, "AuthCore", {
  enumerable: true,
  get: function get() {
    return _AuthCore["default"];
  }
});
Object.defineProperty(exports, "SequelizeStore", {
  enumerable: true,
  get: function get() {
    return _SequelizeStore["default"];
  }
});
Object.defineProperty(exports, "AuthProviderManager", {
  enumerable: true,
  get: function get() {
    return _AuthProviderManager["default"];
  }
});
Object.defineProperty(exports, "KoaHelper", {
  enumerable: true,
  get: function get() {
    return _KoaHelper["default"];
  }
});
Object.defineProperty(exports, "AuthProvider", {
  enumerable: true,
  get: function get() {
    return _AuthProvider["default"];
  }
});
Object.defineProperty(exports, "BasicProvider", {
  enumerable: true,
  get: function get() {
    return _BasicProvider["default"];
  }
});
Object.defineProperty(exports, "sha512gen_salt", {
  enumerable: true,
  get: function get() {
    return _crypt.sha512gen_salt;
  }
});
Object.defineProperty(exports, "crypt", {
  enumerable: true,
  get: function get() {
    return _crypt.crypt;
  }
});

require("@babel/polyfill");

var _AuthCore = _interopRequireDefault(require("./modules/AuthCore"));

var _SequelizeStore = _interopRequireDefault(require("./modules/SequelizeStore"));

var _AuthProviderManager = _interopRequireDefault(require("./modules/AuthProviderManager"));

var _KoaHelper = _interopRequireDefault(require("./modules/KoaHelper"));

var _AuthProvider = _interopRequireDefault(require("./core/AuthProvider"));

var _BasicProvider = _interopRequireDefault(require("./providers/BasicProvider"));

var _crypt = require("./utils/crypt");

var _interfaces = require("./interfaces");

Object.keys(_interfaces).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _interfaces[key];
    }
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }