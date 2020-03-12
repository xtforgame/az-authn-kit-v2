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
} from '../../src/library';
import createTestData from '../test-data/createTestData';

const logFiles = {};

const write = (file, data) => {
  logFiles[file] = logFiles[file] || fs.createWriteStream(file, { flags: 'w' });
  logFiles[file].write(data);
};

function logger(...args) { // eslint-disable-line no-unused-vars
  write(path.resolve(__dirname, './SequelizeStore.spec.log'), `${args[0]}\n`);
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

describe('SequelizeStore', () => {
  describe('Basic', () => {
    const key = fs.readFileSync(path.join(__dirname, '../self-signed/privatekey.pem'), 'utf8');
    const Classes = [
      SequelizeStore,
      AuthCore,
    ];
    const digestOrder = [
      AuthCore,
      SequelizeStore,
    ];

    let authCore = null;
    beforeEach(() => {
      const azldi = new Azldi();

      azldi.register(Classes);

      Classes.forEach((Class) => {
        const classInfo = azldi.getClassInfo(Class.$name);
        // console.log('classInfo :', classInfo);
      });

      let digestIndex = 0;

      const results = azldi.digest({
        onCreate: (obj) => {
          digestIndex++;
        },
        appendArgs: {
          authCore: [key, {}],
          sequelizeStore: [{}],
        },
      });

      [, authCore] = results;

      return azldi.runAsync('init', []);
    });

    it('should be able to create', function () {
      this.timeout(9000);
      const token = authCore.signToken({
        userid: 1,
        username: 'rick',
        auth_type: 'basic',
        auth_id: '00000001',
        token_type: 'Bearer',
        privilege: 'admin',
        session_id: 0,
      });

      // console.log('token :', token);
      // console.log('authCore.verifyToken(token) :', authCore.verifyToken(token));
      authCore.verifyAuthorization({
        authorization: `Bearer ${token}`,
      });

      const user = {
        id: 1,
        username: 'rick',
        privilege: 'admin',
      };

      authCore.createSession({
        user,
        provider_id: 'basic',
        provider_user_id: '00000001',
      });

      return Promise.resolve();
    });
  });

  describe('RdbmsMgr', () => {
    const key = fs.readFileSync(path.join(__dirname, '../self-signed/privatekey.pem'), 'utf8');

    const Classes = [
      SequelizeStore,
      AuthCore,
    ];
    const digestOrder = [
      AuthCore,
      SequelizeStore,
    ];

    let sequelizeStore = null;
    let azldi = null;
    beforeEach(() => {
      azldi = new Azldi();

      azldi.register(Classes);

      Classes.forEach((Class) => {
        const classInfo = azldi.getClassInfo(Class.$name);
        // console.log('classInfo :', classInfo);
      });

      let digestIndex = 0;

      const results = azldi.digest({
        onCreate: (obj) => {
          digestIndex++;
        },
        appendArgs: {
          authCore: [key, {}],
          sequelizeStore: [{}],
        },
      });

      [sequelizeStore] = results;

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
        .then(() => azldi.runAsync('init', [], {
          appendArgs: {
            sequelizeStore: [azRdbmsMgr.resourceManager],
          },
        }))
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
