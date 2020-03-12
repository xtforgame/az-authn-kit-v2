/* eslint-disable no-unused-vars, no-undef */
import chai from 'chai';

import path from 'path';
import fs from 'fs';

import Sequelize from 'sequelize';

import AsuOrm from 'az-sequelize-utils';

import {
  SequelizeStore,
  AuthProviderManager,
  BasicProvider,
} from 'library';

import {
  postgresPort,
  postgresUser,
  postgresDbName,
  postgresPassword,
  postgresHost,
  getConnectString,
  resetTestDbAndTestRole,
} from '../test-utils/sequelize-helpers';

// =================
import createTestData from '../test-data/createTestData';

const logFiles = {};

const write = (file, data) => {
  logFiles[file] = logFiles[file] || fs.createWriteStream(file, { flags: 'w' });
  logFiles[file].write(data);
};

function logger(...args) { // eslint-disable-line no-unused-vars
  write(path.resolve(__dirname, './AuthProviderManager.spec.log'), `${args[0]}\n`);
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

describe('AuthProviderManager', () => {
  describe('Basic', () => {
    let authProviderManager = null;
    let sequelizeStore = null;
    beforeEach(() => {
      sequelizeStore = new SequelizeStore({});
      authProviderManager = new AuthProviderManager(
        {
          basic: {
            provider: BasicProvider,
          },
        },
        {}
      );

      return resetTestDbAndTestRole();
    });

    it('should be able to create', function () {
      this.timeout(9000);
      const azRdbmsMgr = new AzRdbmsMgr(sequelizeStore.getDefaultAsuModels(), {
        databaseLogger: logger,
      });
      return azRdbmsMgr.sync()
        .then(() => createTestData(azRdbmsMgr.resourceManager, false))
        .then(() => Promise.all([
          sequelizeStore.setResourceManager(azRdbmsMgr.resourceManager),
          authProviderManager.setAccountLinkStore(sequelizeStore.getAccountLinkStore()),
        ]))
        .then(() => authProviderManager.getAuthProvider('basic'))
        .then(basicAuthProvider => basicAuthProvider.authenticate({
          username: 'admin',
          password: 'admin',
        }));
    });
  });
});
