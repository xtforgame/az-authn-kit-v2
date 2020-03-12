/* eslint-disable no-underscore-dangle */
// import Sequelize from 'sequelize';
import { RestfulError } from 'az-restful-helpers';

import { AccountLinkStore } from 'library';
import getAuthAsuModelDefs from './getAuthAsuModelDefs';
import normalizeModelsOption from './normalizeModelsOption';

export default class SequelizeStore {
  constructor(options) {
    this.options = options;
    this.modelsOption = normalizeModelsOption(options.models);
  }

  setResourceManager(resourceManager) {
    this.resourceManager = resourceManager;
  }

  _filterColumns(modelName, origonalResult, passAnyway = []) {
    if (!origonalResult || !origonalResult.dataValues) {
      return null;
    }
    const dataFromDb = origonalResult.dataValues;

    const data = {};
    this.modelsOption[modelName].publicColumns.concat(passAnyway).forEach((columnName) => {
      data[columnName] = dataFromDb[columnName];
    });
    return data;
  }

  getDefaultAsuModels = () => getAuthAsuModelDefs(this.modelsOption)

  createAccountLink = (paramsForCreate, userId) => {
    const AccountLink = this.resourceManager.getSqlzModel('accountLink');
    return this.resourceManager.db.transaction()
    .then(t => AccountLink.create({
      ...paramsForCreate,
      user_id: userId,
    }, {
      transaction: t,
    })
      .then(v => t.commit()
        .then(() => v))
      .catch(e => t.rollback()
        .then(() => Promise.reject(e))))
    .then(accountLink => this._filterColumns('accountLink', accountLink))
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
      .then((origonalResult) => {
        const user = this._filterColumns('user', origonalResult);
        if (!user) {
          return null;
        }

        const userFromDb = origonalResult.dataValues;
        user.accountLinks = userFromDb.accountLinks.map(accountLinkFromDb => this._filterColumns('accountLink', accountLinkFromDb));

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
    .then((origonalResult) => {
      const accountLink = this._filterColumns('accountLink', origonalResult, ['provider_user_access_info']);
      if (!accountLink) {
        return null;
      }

      const accountLinkFromDb = origonalResult.dataValues;
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
          .then(affectedRows => ({ affectedRows }));
      });
  }

  deleteAccountLinkFromUser = (userId, authType, isAdmin) => {
    const AccountLink = this.resourceManager.getSqlzModel('accountLink');
    return this.findUserWithAccountLink(userId)
      .then((user) => {
        if (!user) {
          return RestfulError.rejectWith(404, 'UserNotFound');
        }
        if (user.accountLinks.length === 1
         && user.accountLinks[0].provider_id === authType
         && !isAdmin) {
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
          .then(affectedRows => ({ affectedRows }));
      });
  }

  // =====================================================

  getAccountLinkStore() {
    return new AccountLinkStore(this.findAccountLink, this.createAccountLink);
  }
}
