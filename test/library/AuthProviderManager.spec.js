/* eslint-disable no-unused-vars, no-undef */
import chai from 'chai';

import path from 'path';
import fs from 'fs';

import Azldi from 'azldi';

import Sequelize from 'sequelize';

import AsuOrm from 'az-sequelize-utils';
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

import {
  AuthCore,
  SequelizeStore,
  AuthProviderManager,
  BasicProvider,
} from '../../src/library';
import createTestData from '../test-data/createTestData';

const logFiles = {};

const write = (file, data) => {
  logFiles[file] = logFiles[file] || fs.createWriteStream(file, { flags: 'w' });
  logFiles[file].write(data);
};

function logger(...args) { // eslint-disable-line no-unused-vars
  write(path.resolve(__dirname, './AuthProviderManager.spec.log'), `${args[0]}\n`);
}

const secret = fs.readFileSync(path.join(__dirname, '../self-signed/privatekey.pem'), 'utf8');

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
    const key = fs.readFileSync(path.join(__dirname, '../self-signed/privatekey.pem'), 'utf8');
    // let AuthCore = AuthCore(key, {});
    // let SequelizeStore = SequelizeStore({});
    // let AuthProviderManager = AuthProviderManager({
    //   basic: {
    //     provider: BasicProvider,
    //   },
    // }, {});
    const Classes = [
      AuthProviderManager,
      SequelizeStore,
      AuthCore,
    ];
    const digestOrder = [
      AuthCore,
      SequelizeStore,
      AuthProviderManager,
    ];

    let azldi = null;
    let authProviderManager = null;
    let sequelizeStore = null;
    beforeEach(() => {
      azldi = new Azldi();

      azldi.register(Classes);

      Classes.forEach((/* Class */) => {
        // const classInfo = azldi.getClassInfo(Class.$name);
        // console.log('classInfo :', classInfo);
      });

      let digestIndex = 0;
      const results = azldi.digest({
        onCreate: (/* obj */) => {
          digestIndex++;
        },
        appendArgs: {
          authCore: [key, {}],
          sequelizeStore: [{}],
          authProviderManager: [
            {
              basic: {
                provider: BasicProvider,
              },
            },
            {},
          ],
        },
      });

      [authProviderManager, sequelizeStore] = results;

      return resetTestDbAndTestRole();
    });

    it('should be able to create', function () {
      this.timeout(9000);
      const azRdbmsMgr = new AzRdbmsMgr(sequelizeStore.getDefaultAsuModels(), {
        databaseLogger: logger,
      });
      return azRdbmsMgr.sync()
        .then(() => createTestData(azRdbmsMgr.resourceManager, false))
        .then(() => azldi.runAsync('init', [], {
          appendArgs: {
            sequelizeStore: [azRdbmsMgr.resourceManager],
          },
        }))
        .then(() => authProviderManager.getAuthProvider('basic'))
        .then(basicAuthProvider => basicAuthProvider.authenticate({
          username: 'admin',
          password: 'admin',
        }));
    });
  });
});
