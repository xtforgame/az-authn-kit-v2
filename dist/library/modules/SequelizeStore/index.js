'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.AccountLinkStore = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _ModuleBase2 = require('../ModuleBase');

var _ModuleBase3 = _interopRequireDefault(_ModuleBase2);

var _getAuthAsuModelDefs = require('./getAuthAsuModelDefs');

var _getAuthAsuModelDefs2 = _interopRequireDefault(_getAuthAsuModelDefs);

var _normalizeModelsOption = require('./normalizeModelsOption');

var _normalizeModelsOption2 = _interopRequireDefault(_normalizeModelsOption);

var _azRestfulHelpers = require('az-restful-helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AccountLinkStore = exports.AccountLinkStore = function AccountLinkStore(findAccountLink, createAccountLink) {
  _classCallCheck(this, AccountLinkStore);

  this.findAccountLink = findAccountLink;
  this.createAccountLink = createAccountLink;
};

var SequelizeStore = (_temp = _class = function (_ModuleBase) {
  _inherits(SequelizeStore, _ModuleBase);

  function SequelizeStore(authCore, options) {
    _classCallCheck(this, SequelizeStore);

    var _this = _possibleConstructorReturn(this, (SequelizeStore.__proto__ || Object.getPrototypeOf(SequelizeStore)).call(this));

    _this.getDefaultAsuModels = function () {
      return (0, _getAuthAsuModelDefs2.default)(_this.modelsOption);
    };

    _this.createAccountLink = function (paramsForCreate, userId) {
      var AccountLink = _this.resourceManager.getSqlzModel('accountLink');
      return _this.resourceManager.db.transaction().then(function (t) {
        return AccountLink.create(_extends({}, paramsForCreate, {
          user_id: userId
        }), {
          transaction: t
        }).then(function (v) {
          return t.commit().then(function () {
            return v;
          });
        }).catch(function (e) {
          return t.rollback().then(function () {
            return Promise.reject(e);
          });
        });
      }).then(function (accountLink) {
        return _this._filterColumns('accountLink', accountLink);
      }).catch(function (error) {
        if (error && error.name === 'SequelizeUniqueConstraintError') {
          return _azRestfulHelpers.RestfulError.rejectWith(409, 'This account link has been taken', error);
        }
        return _azRestfulHelpers.RestfulError.rejectWith(500, 'Internal Server Error', error);
      });
    };

    _this.findUserWithAccountLink = function (userId) {
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
    };

    _this.findAccountLink = function (provider_id, provider_user_id) {
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
    };

    _this.deleteAllAccountLinkFromUser = function (userId) {
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
          return { affectedRows: affectedRows };
        });
      });
    };

    _this.deleteAccountLinkFromUser = function (userId, authType, isAdmin) {
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
          return { affectedRows: affectedRows };
        });
      });
    };

    _this.authCore = authCore;
    _this.options = options;
    _this.modelsOption = (0, _normalizeModelsOption2.default)(options.models);
    return _this;
  }

  _createClass(SequelizeStore, [{
    key: 'onInit',
    value: function onInit(_, resourceManager) {
      this.resourceManager = resourceManager;
    }
  }, {
    key: '_filterColumns',
    value: function _filterColumns(modelName, origonalResult) {
      var passAnyway = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

      if (!origonalResult || !origonalResult.dataValues) {
        return null;
      }
      var dataFromDb = origonalResult.dataValues;

      var data = {};
      this.modelsOption[modelName].publicColumns.concat(passAnyway).map(function (columnName) {
        data[columnName] = dataFromDb[columnName];
      });
      return data;
    }
  }, {
    key: 'getAccountLinkStore',
    value: function getAccountLinkStore() {
      return new AccountLinkStore(this.findAccountLink, this.createAccountLink);
    }
  }]);

  return SequelizeStore;
}(_ModuleBase3.default), _class.$name = 'sequelizeStore', _class.$type = 'service', _class.$inject = ['authCore'], _class.$funcDeps = {
  init: [],
  start: []
}, _temp);
exports.default = SequelizeStore;