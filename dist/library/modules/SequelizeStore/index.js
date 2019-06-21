"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.AccountLinkStore = void 0;

var _azRestfulHelpers = require("az-restful-helpers");

var _ModuleBase2 = _interopRequireDefault(require("../ModuleBase"));

var _getAuthAsuModelDefs = _interopRequireDefault(require("./getAuthAsuModelDefs"));

var _normalizeModelsOption = _interopRequireDefault(require("./normalizeModelsOption"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AccountLinkStore = function AccountLinkStore(findAccountLink, createAccountLink) {
  _classCallCheck(this, AccountLinkStore);

  this.findAccountLink = findAccountLink;
  this.createAccountLink = createAccountLink;
};

exports.AccountLinkStore = AccountLinkStore;

var SequelizeStore = function (_ModuleBase) {
  _inherits(SequelizeStore, _ModuleBase);

  function SequelizeStore(options) {
    var _this;

    _classCallCheck(this, SequelizeStore);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SequelizeStore).call(this));

    _defineProperty(_assertThisInitialized(_this), "getDefaultAsuModels", function () {
      return (0, _getAuthAsuModelDefs["default"])(_this.modelsOption);
    });

    _defineProperty(_assertThisInitialized(_this), "createAccountLink", function (paramsForCreate, userId) {
      var AccountLink = _this.resourceManager.getSqlzModel('accountLink');

      return _this.resourceManager.db.transaction().then(function (t) {
        return AccountLink.create(_objectSpread({}, paramsForCreate, {
          user_id: userId
        }), {
          transaction: t
        }).then(function (v) {
          return t.commit().then(function () {
            return v;
          });
        })["catch"](function (e) {
          return t.rollback().then(function () {
            return Promise.reject(e);
          });
        });
      }).then(function (accountLink) {
        return _this._filterColumns('accountLink', accountLink);
      })["catch"](function (error) {
        if (error && error.name === 'SequelizeUniqueConstraintError') {
          return _azRestfulHelpers.RestfulError.rejectWith(409, 'This account link has been taken', error);
        }

        return _azRestfulHelpers.RestfulError.rejectWith(500, 'Internal Server Error', error);
      });
    });

    _defineProperty(_assertThisInitialized(_this), "findUserWithAccountLink", function (userId) {
      var User = _this.resourceManager.getSqlzModel('user');

      var AccountLink = _this.resourceManager.getSqlzModel('accountLink');

      return User.findOne({
        where: {
          id: userId
        },
        include: [{
          model: AccountLink,
          as: 'accountLinks'
        }]
      }).then(function (origonalResult) {
        var user = _this._filterColumns('user', origonalResult);

        if (!user) {
          return null;
        }

        var userFromDb = origonalResult.dataValues;
        user.accountLinks = userFromDb.accountLinks.map(function (accountLinkFromDb) {
          return _this._filterColumns('accountLink', accountLinkFromDb);
        });
        return user;
      });
    });

    _defineProperty(_assertThisInitialized(_this), "findAccountLink", function (provider_id, provider_user_id) {
      var AccountLink = _this.resourceManager.getSqlzModel('accountLink');

      var User = _this.resourceManager.getSqlzModel('user');

      return AccountLink.findOne({
        where: {
          provider_id: provider_id,
          provider_user_id: provider_user_id
        },
        include: [{
          model: User,
          as: 'user'
        }]
      }).then(function (origonalResult) {
        var accountLink = _this._filterColumns('accountLink', origonalResult, ['provider_user_access_info']);

        if (!accountLink) {
          return null;
        }

        var accountLinkFromDb = origonalResult.dataValues;
        accountLink.user = _this._filterColumns('user', accountLinkFromDb.user);
        return accountLink;
      });
    });

    _defineProperty(_assertThisInitialized(_this), "deleteAllAccountLinkFromUser", function (userId) {
      var AccountLink = _this.resourceManager.getSqlzModel('accountLink');

      return _this.findUserWithAccountLink(userId).then(function (user) {
        if (!user) {
          return _azRestfulHelpers.RestfulError.rejectWith(404, 'UserNotFound');
        }

        return AccountLink.destroy({
          where: {
            user_id: user.id
          }
        }).then(function (affectedRows) {
          return {
            affectedRows: affectedRows
          };
        });
      });
    });

    _defineProperty(_assertThisInitialized(_this), "deleteAccountLinkFromUser", function (userId, authType, isAdmin) {
      var AccountLink = _this.resourceManager.getSqlzModel('accountLink');

      return _this.findUserWithAccountLink(userId).then(function (user) {
        if (!user) {
          return _azRestfulHelpers.RestfulError.rejectWith(404, 'UserNotFound');
        }

        if (user.accountLinks.length === 1 && user.accountLinks[0].provider_id === authType && !isAdmin) {
          return _azRestfulHelpers.RestfulError.rejectWith(403, 'You cannot remove the only account link without the admin privilege.');
        }

        return AccountLink.destroy({
          where: {
            user_id: user.id,
            provider_id: authType
          }
        }).then(function (affectedRows) {
          return {
            affectedRows: affectedRows
          };
        });
      });
    });

    _this.options = options;
    _this.modelsOption = (0, _normalizeModelsOption["default"])(options.models);
    return _this;
  }

  _createClass(SequelizeStore, [{
    key: "onInit",
    value: function onInit(_, resourceManager) {
      this.resourceManager = resourceManager;
    }
  }, {
    key: "_filterColumns",
    value: function _filterColumns(modelName, origonalResult) {
      var passAnyway = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

      if (!origonalResult || !origonalResult.dataValues) {
        return null;
      }

      var dataFromDb = origonalResult.dataValues;
      var data = {};
      this.modelsOption[modelName].publicColumns.concat(passAnyway).forEach(function (columnName) {
        data[columnName] = dataFromDb[columnName];
      });
      return data;
    }
  }, {
    key: "getAccountLinkStore",
    value: function getAccountLinkStore() {
      return new AccountLinkStore(this.findAccountLink, this.createAccountLink);
    }
  }]);

  return SequelizeStore;
}(_ModuleBase2["default"]);

exports["default"] = SequelizeStore;

_defineProperty(SequelizeStore, "$name", 'sequelizeStore');

_defineProperty(SequelizeStore, "$type", 'service');

_defineProperty(SequelizeStore, "$funcDeps", {
  init: [],
  start: []
});