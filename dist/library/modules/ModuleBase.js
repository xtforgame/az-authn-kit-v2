"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ModuleBase = function () {
  function ModuleBase() {
    _classCallCheck(this, ModuleBase);
  }

  _createClass(ModuleBase, [{
    key: "init",
    value: function init() {
      var _this = this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return new Promise(function (resolve, reject) {
        try {
          return resolve(_this.onInit && _this.onInit.apply(_this, args));
        } catch (e) {
          return reject(e);
        }
      });
    }
  }, {
    key: "start",
    value: function start() {
      var _this2 = this;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return new Promise(function (resolve, reject) {
        try {
          return resolve(_this2.onStart && _this2.onStart.apply(_this2, args));
        } catch (e) {
          return reject(e);
        }
      });
    }
  }]);

  return ModuleBase;
}();

exports["default"] = ModuleBase;

_defineProperty(ModuleBase, "$name", 'base');

_defineProperty(ModuleBase, "$type", 'service');

_defineProperty(ModuleBase, "$funcDeps", {
  init: [],
  start: []
});