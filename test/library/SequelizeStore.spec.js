/*eslint-disable no-unused-vars, no-undef */
import chai from 'chai';

import path from 'path';
import fs from 'fs';
import {
  AuthCore,
  SequelizeStore,
} from '../../src/library';
import Azldi from 'azldi';

import Sequelize from 'sequelize';

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

import AsuOrm from 'az-sequelize-utils';
import createTestData from '../test-data/createTestData';

let logFiles = {};

let write = (file, data) => {
  let logFile = logFiles[file] = logFiles[file] || fs.createWriteStream(file, {flags : 'w'});
  logFile.write(data);
}

function databaseLogger(...args){ // eslint-disable-line no-unused-vars
  write(path.resolve(__dirname, './SequelizeStore.spec.log'), args[0] + '\n');
}

const secret = fs.readFileSync(path.join(__dirname, '../self-signed/privatekey.pem'), 'utf8');

class AzRdbmsMgr {
  constructor(asuModelDefs, { databaseLogger = (() => {}) }){
    this.asuModelDefs = asuModelDefs;
    this.databaseLogger = databaseLogger;
    this.sequelizeDb = new Sequelize(getConnectString(postgresUser), {
      dialect: 'postgres',
      logging: this.databaseLogger,
    });

    this.resourceManager = new AsuOrm(this.sequelizeDb, this.asuModelDefs);
  }

  sync(force = true){
    return this.resourceManager.sync({force});
  }
}

// =================

let expect = chai.expect;

describe('SequelizeStore', function(){
  describe('Basic', function(){
    const key = fs.readFileSync(path.join(__dirname, '../self-signed/privatekey.pem'), 'utf8');
    let Classes = [
      SequelizeStore,
      AuthCore,
    ];
    let digestOrder = [
      AuthCore,
      SequelizeStore,
    ];

    let authCore = null;
    beforeEach(function() {
      let azldi = new Azldi();

      azldi.register(Classes);

      Classes.forEach(Class => {
        let classInfo = azldi.getClassInfo(Class.$name);
        // console.log('classInfo :', classInfo);
      });

      let digestIndex = 0;

      let results = azldi.digest({
        onCreate: (obj) => {
          digestIndex++
        },
        appendArgs: {
          authCore: [key, {}],
          sequelizeStore: [{}],
        },
      });

      authCore = results[1];

      return azldi.runAsync('init', []);
    });

    it('should be able to create', function(){
      this.timeout(9000);
      let token = authCore.signToken({
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

      let user = {
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

  describe('RdbmsMgr', function(){
    const key = fs.readFileSync(path.join(__dirname, '../self-signed/privatekey.pem'), 'utf8');
    
    let Classes = [
      SequelizeStore,
      AuthCore,
    ];
    let digestOrder = [
      AuthCore,
      SequelizeStore,
    ];

    let sequelizeStore = null;
    let azldi = null;
    beforeEach(function() {
      azldi = new Azldi();

      azldi.register(Classes);

      Classes.forEach(Class => {
        let classInfo = azldi.getClassInfo(Class.$name);
        // console.log('classInfo :', classInfo);
      });

      let digestIndex = 0;

      let results = azldi.digest({
        onCreate: (obj) => {
          digestIndex++
        },
        appendArgs: {
          authCore: [key, {}],
          sequelizeStore: [{}],
        },
      });

      sequelizeStore = results[0];

      return resetTestDbAndTestRole();
    });

    it('should be able to create', function(){
      this.timeout(9000);
      let azRdbmsMgr = new AzRdbmsMgr(sequelizeStore.getDefaultAsuModels(), {
        databaseLogger,
      });
      let user = null;
      return azRdbmsMgr.sync()
      .then(() => {
        return createTestData(azRdbmsMgr.resourceManager, false);
      })
      .then(() => {
        return azldi.runAsync('init', [], {
          appendArgs: {
            sequelizeStore: [azRdbmsMgr.resourceManager],
          },
        });
      })
      .then(() => {
        return sequelizeStore.findUserWithAccountLink(1);
      })
      .then(_user => {
        user = _user
        let username = 'xx';
        return sequelizeStore.createAccountLink({
          provider_id: 'basic2',
          provider_user_id: username,
          provider_user_access_info: {
            password: 'xx',
          },
        }, user.id);
      })
      .then(accountLink => {
        // console.log('accountLink :', accountLink);
        let username = 'xx';
        return sequelizeStore.findAccountLink('basic2', username);
      })
      .then(accountLink => {
        // console.log('accountLink :', accountLink);
        return sequelizeStore.deleteAccountLinkFromUser(user.id, 'basic2', true);
      });
    });
  });
});
