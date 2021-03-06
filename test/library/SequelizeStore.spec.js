/* eslint-disable no-unused-vars, no-undef */
import chai from 'chai';

import path from 'path';
import fs from 'fs';

import Sequelize from 'sequelize';

import AsuOrm from 'az-sequelize-utils';
import SequelizeStore from 'test-utils/SequelizeStore';
import {
  postgresPort,
  postgresUser,
  postgresDbName,
  postgresPassword,
  postgresHost,
  getConnectString,
  resetTestDbAndTestRole,
} from 'test-utils/sequelize-helpers';

// =================

import createTestData from 'test-data/createTestData';

const logFiles = {};

const write = (file, data) => {
  logFiles[file] = logFiles[file] || fs.createWriteStream(file, { flags: 'w' });
  logFiles[file].write(data);
};

function logger(...args) { // eslint-disable-line no-unused-vars
  write(path.resolve(__dirname, './SequelizeStore.spec.log'), `${args[0]}\n`);
}

class AzRdbmsMgr {
  constructor(asuModelDefs, { databaseLogger = (() => {}) }) {
    this.asuModelDefs = asuModelDefs;
    this.databaseLogger = databaseLogger;
    this.sequelizeDb = new Sequelize(getConnectString(postgresUser), {
      dialect: 'postgres',
      logging: this.databaseLogger,
    });

    this.resourceManager = new AsuOrm(this.sequelizeDb, this.asuModelDefs);
  }

  sync(force = true) {
    return this.resourceManager.sync({ force });
  }
}

// =================

const { expect } = chai;

describe('SequelizeStore', () => {
  describe('RdbmsMgr', () => {
    let sequelizeStore = null;
    beforeEach(() => {
      sequelizeStore = new SequelizeStore({});
      return resetTestDbAndTestRole();
    });

    it('should be able to create', function () {
      this.timeout(9000);
      const azRdbmsMgr = new AzRdbmsMgr(sequelizeStore.getDefaultAsuModels(), {
        databaseLogger: logger,
      });
      let user = null;
      return azRdbmsMgr.sync()
        .then(() => createTestData(azRdbmsMgr.resourceManager, false))
        .then(() => sequelizeStore.setResourceManager(azRdbmsMgr.resourceManager))
        .then(() => sequelizeStore.findUserWithAccountLink(1))
        .then((_user) => {
          user = _user;
          const username = 'xx';
          return sequelizeStore.createAccountLink({
            provider_id: 'basic2',
            provider_user_id: username,
            provider_user_access_info: {
              password: 'xx',
            },
          }, user.id);
        })
        .then((accountLink) => {
        // console.log('accountLink :', accountLink);
          const username = 'xx';
          return sequelizeStore.findAccountLink('basic2', username);
        })
        .then(accountLink => sequelizeStore.deleteAccountLinkFromUser(user.id, 'basic2', true));
    });
  });
});
