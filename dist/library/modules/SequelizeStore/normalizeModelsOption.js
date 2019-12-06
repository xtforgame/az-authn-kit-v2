"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _sequelize = _interopRequireDefault(require("sequelize"));

var _azSequelizeUtils = _interopRequireDefault(require("az-sequelize-utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var _default = function _default() {
  var modelsOption = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _modelsOption$user = modelsOption.user;
  _modelsOption$user = _modelsOption$user === void 0 ? {} : _modelsOption$user;
  var _modelsOption$user$pu = _modelsOption$user.publicColumns,
      userPublicColumns = _modelsOption$user$pu === void 0 ? [] : _modelsOption$user$pu,
      _modelsOption$user$co = _modelsOption$user.columns,
      userColumns = _modelsOption$user$co === void 0 ? {} : _modelsOption$user$co,
      _modelsOption$account = modelsOption.accountLink;
  _modelsOption$account = _modelsOption$account === void 0 ? {} : _modelsOption$account;
  var _modelsOption$account2 = _modelsOption$account.publicColumns,
      accountLinkPublicColumns = _modelsOption$account2 === void 0 ? [] : _modelsOption$account2,
      _modelsOption$account3 = _modelsOption$account.columns,
      accountLinkColumns = _modelsOption$account3 === void 0 ? {} : _modelsOption$account3;
  return {
    user: {
      publicColumns: Array.from(new Set(['id', 'name', 'privilege', 'labels'].concat(_toConsumableArray(userPublicColumns)))),
      columns: _objectSpread({
        id: {
          type: _sequelize["default"].BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey'
        },
        name: {
          type: _sequelize["default"].STRING,
          comment: 'Username'
        },
        privilege: _sequelize["default"].STRING,
        labels: {
          type: _sequelize["default"].JSONB,
          defaultValue: {}
        },
        accountLinks: {
          type: _azSequelizeUtils["default"].HAS_MANY('accountLink', {
            foreignKey: 'user_id'
          })
        }
      }, userColumns)
    },
    accountLink: {
      publicColumns: Array.from(new Set(['id', 'provider_id', 'provider_user_id'].concat(_toConsumableArray(accountLinkPublicColumns)))),
      columns: _objectSpread({
        id: {
          type: _sequelize["default"].BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: 'PrimaryKey'
        },
        provider_id: {
          type: _sequelize["default"].STRING
        },
        provider_user_id: {
          type: _sequelize["default"].STRING
        },
        provider_user_access_info: {
          type: _sequelize["default"].JSONB
        },
        user: {
          type: _azSequelizeUtils["default"].BELONGS_TO('user', {
            foreignKey: 'user_id'
          })
        }
      }, accountLinkColumns)
    }
  };
};

exports["default"] = _default;