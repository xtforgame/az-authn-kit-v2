"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _azRestfulHelpers = require("az-restful-helpers");

var _AccountLinkStore = _interopRequireDefault(require("../../core/AccountLinkStore"));

var _getAuthAsuModelDefs = _interopRequireDefault(require("./getAuthAsuModelDefs"));

var _normalizeModelsOption = _interopRequireDefault(require("./normalizeModelsOption"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var SequelizeStore = function () {
  function SequelizeStore(options) {
    var _this = this;

    _classCallCheck(this, SequelizeStore);

    _defineProperty(this, "getDefaultAsuModels", function () {
      return (0, _getAuthAsuModelDefs["default"])(_this.modelsOption);
    });

    _defineProperty(this, "createAccountLink", function (paramsForCreate, userId) {
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

    _defineProperty(this, "findUserWithAccountLink", function (userId) {
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

    _defineProperty(this, "findAccountLink", function (provider_id, provider_user_id) {
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

    _defineProperty(this, "deleteAllAccountLinkFromUser", function (userId) {
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

    _defineProperty(this, "deleteAccountLinkFromUser", function (userId, authType, isAdmin) {
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

    this.options = options;
    this.modelsOption = (0, _normalizeModelsOption["default"])(options.models);
  }

  _createClass(SequelizeStore, [{
    key: "setResourceManager",
    value: function setResourceManager(resourceManager) {
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
      return new _AccountLinkStore["default"](this.findAccountLink, this.createAccountLink);
    }
  }]);

  return SequelizeStore;
}();

exports["default"] = SequelizeStore;