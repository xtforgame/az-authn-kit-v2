/* eslint-disable no-underscore-dangle */
// import Sequelize from 'sequelize';
import ModuleBase from '../ModuleBase';

import getAuthAsuModelDefs from './getAuthAsuModelDefs';
import normalizeModelsOption from './normalizeModelsOption';
import { RestfulError } from 'az-restful-helpers';

export class AccountLinkStore {
  constructor(findAccountLink, createAccountLink) {
    this.findAccountLink = findAccountLink;
    this.createAccountLink = createAccountLink;
  }
}

export default class SequelizeStore extends ModuleBase {
  static $name = 'sequelizeStore';
  static $type = 'service';
  static $inject = ['authCore'];
  static $funcDeps = {
    init: [],
    start: [],
  };

  constructor(authCore, options){
    super();
    this.authCore = authCore;
    this.options = options;
    this.modelsOption = normalizeModelsOption(options.models);
  }

  onInit(_, resourceManager){
    this.resourceManager = resourceManager;
  }

  _filterColumns(modelName, origonalResult, passAnyway = []){
    if(!origonalResult || !origonalResult.dataValues){
      return null;
    }
    let dataFromDb = origonalResult.dataValues;

    let data = {};
    this.modelsOption[modelName].publicColumns.concat(passAnyway).map(columnName => {
      data[columnName] = dataFromDb[columnName];
    });
    return data;
  }

  getDefaultAsuModels = () => {
    return getAuthAsuModelDefs(this.modelsOption);
  }

  createAccountLink = (paramsForCreate, userId) => {
    const AccountLink = this.resourceManager.getSqlzModel('accountLink');
    return this.resourceManager.db.transaction()
    .then(t =>
      AccountLink.create({
        ...paramsForCreate,
        user_id: userId,
      }, {
        transaction: t,
      })
      .then(v => {
        return t.commit()
        .then(() => v);
      })
      .catch((e) => {
        return t.rollback()
        .then(() => Promise.reject(e));
      })
    )
    .then(accountLink => {
      return this._filterColumns('accountLink', accountLink);
    })
    .catch((error) => {
      if (error && error.name === 'SequelizeUniqueConstraintError') {
        return RestfulError.rejectWith(409, 'This account link has been taken', error);
      }
      return RestfulError.rejectWith(500, 'Internal Server Error', error);
    });
  }

  findUserWithAccountLink = (userId) => {
    const User = this.resourceManager.getSqlzModel('user');
    const AccountLink = this.resourceManager.getSqlzModel('accountLink');
    return User.findOne({
      where: {
        id: userId,
      },
      include: [{
        model: AccountLink,
        as: 'accountLinks',
      }],
    })
      .then(origonalResult => {
        let user = this._filterColumns('user', origonalResult);
        if(!user){
          return null;
        }

        let userFromDb = origonalResult.dataValues;
        user.accountLinks = userFromDb.accountLinks.map(accountLinkFromDb => {
          return this._filterColumns('accountLink', accountLinkFromDb);
        });

        return user;
      });
  }

  findAccountLink = (provider_id, provider_user_id) => {
    const AccountLink = this.resourceManager.getSqlzModel('accountLink');
    const User = this.resourceManager.getSqlzModel('user');
  
    return AccountLink.findOne({
      where: {
        provider_id,
        provider_user_id,
      },
      include: [{
        model: User,
        as: 'user',
      }],
    })
    .then(origonalResult => {
      let accountLink = this._filterColumns('accountLink', origonalResult, ['provider_user_access_info']);
      if(!accountLink){
        return null;
      }

      let accountLinkFromDb = origonalResult.dataValues;
      accountLink.user = this._filterColumns('user', accountLinkFromDb.user);
      return accountLink;
    });
  }

  deleteAllAccountLinkFromUser = (userId) => {
    const AccountLink = this.resourceManager.getSqlzModel('accountLink');
    return this.findUserWithAccountLink(userId)
      .then((user) => {
        if (!user) {
          return RestfulError.rejectWith(404, 'UserNotFound');
        }
        return AccountLink.destroy({
          where: {
            user_id: user.id,
          },
        })
          .then(affectedRows => {
            return { affectedRows };
          });
      });
  }

  deleteAccountLinkFromUser = (userId, authType, isAdmin) => {
    const AccountLink = this.resourceManager.getSqlzModel('accountLink');
    return this.findUserWithAccountLink(userId)
      .then((user) => {
        if (!user) {
          return RestfulError.rejectWith(404, 'UserNotFound');
        }
        if (user.accountLinks.length === 1 &&
         user.accountLinks[0].provider_id === authType &&
         !isAdmin) {
          return RestfulError.rejectWith(403, 'You cannot remove the only account link without the admin privilege.');
        }

        /* only unlink
        return user.removeAccountLinks(user.accountLinks)
        .then((affectedRows) => {
          console.log('DELETE ROWS :', affectedRows);
          return affectedRows;
        })
        .then(() => {
          return {success: true};
        });
        */
        return AccountLink.destroy({
          where: {
            user_id: user.id,
            provider_id: authType,
          },
        })
          .then(affectedRows => {
            return { affectedRows };
          });
      });
  }  

  // =====================================================

  getAccountLinkStore() {
    return new AccountLinkStore(this.findAccountLink, this.createAccountLink);
  }
}
