/* eslint-disable no-unused-vars, no-undef */
import chai from 'chai';

import path from 'path';
import fs from 'fs';

import { RestfulError } from 'az-restful-helpers';

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

import {
  AuthCore,
  AuthProviderManager,
  KoaHelper,
  BasicProvider,
} from 'library';
import createTestData from '../test-data/createTestData';

const logFiles = {};

const write = (file, data) => {
  logFiles[file] = logFiles[file] || fs.createWriteStream(file, { flags: 'w' });
  logFiles[file].write(data);
};

function logger(...args) { // eslint-disable-line no-unused-vars
  write(path.resolve(__dirname, './KoaHelper.spec.log'), `${args[0]}\n`);
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

class FakeCtx {
  constructor(props, reject) {
    Object.keys(props).forEach((key) => {
      this[key] = props[key];
    });
    this.reject = reject;
    this.headers = {};
  }

  throw(status, message) {
    // console.warn('status, message :', status, message);
    this.reject({ status, message });
  }

  set(obj) {
    this.headers = {
      ...this.headers,
      ...obj,
    };
  }
}

const { expect } = chai;

describe('KoaHelper', () => {
  describe('Basic', () => {
    const key = fs.readFileSync(path.join(__dirname, '../self-signed/privatekey.pem'), 'utf8');

    let authCore = null;
    let authProviderManager = null;
    let sequelizeStore = null;
    let koaHelper = null;
    beforeEach(() => {
      authCore = new AuthCore(key, {});
      sequelizeStore = new SequelizeStore({});
      authProviderManager = new AuthProviderManager(
        {
          basic: {
            provider: BasicProvider,
          },
        },
        {}
      );
      koaHelper = new KoaHelper(authCore, authProviderManager);

      return resetTestDbAndTestRole();
    });

    const createAzRdbmsMgr = () => {
      const azRdbmsMgr = new AzRdbmsMgr(sequelizeStore.getDefaultAsuModels(), {
        databaseLogger: logger,
      });
      return azRdbmsMgr.sync()
        .then(() => createTestData(azRdbmsMgr.resourceManager, false))
        .then(() => Promise.all([
          sequelizeStore.setResourceManager(azRdbmsMgr.resourceManager),
          authProviderManager.setAccountLinkStore(sequelizeStore.getAccountLinkStore()),
        ]))
        .then(() => azRdbmsMgr);
    };

    it('should be able to create', function () {
      this.timeout(9000);
      return createAzRdbmsMgr();
    });

    it('should be able to auth (success)', function () {
      this.timeout(9000);
      const authInfo = {
        username: 'admin',
        password: 'admin',
      };
      return createAzRdbmsMgr()
        .then(() => authProviderManager.getAuthProvider('basic'))
        .then(basicAuthProvider => basicAuthProvider.authenticate({
          ...authInfo,
        }))
        .then((accountLink) => {
        // console.log('accountLink :', accountLink);
          expect(accountLink).to.exist;
          expect(accountLink.id).to.be.equal('1');

          const ctx = new FakeCtx({
            request: {
              body: {
                auth_type: 'basic',
                ...authInfo,
              },
            },
          }, (e) => { throw e; });

          return koaHelper.authenticate(ctx, () => {})
            .then(() => ctx);
        })
        .then((ctx) => {
          expect(ctx).to.exist;
          expect(ctx.body).to.exist;
          expect(ctx.body.user_id).to.be.equal('1');
          expect(ctx.body.token).to.exist;
        });
    });

    it('should be able to auth (wrong user id)', function () {
      this.timeout(9000);
      const authInfo = {
        username: 'adminx',
        password: 'wrongpassword',
      };
      return createAzRdbmsMgr()
        .then(() => authProviderManager.getAuthProvider('basic'))
        .then(basicAuthProvider => basicAuthProvider.authenticate({
          ...authInfo,
        })
            .catch((e) => {
              expect(e).to.be.an.instanceof(RestfulError);
              expect(e.status).to.be.equal(401);
            }))
        .then(() => {
          const ctx = new FakeCtx({
            request: {
              body: {
                auth_type: 'basic',
                ...authInfo,
              },
            },
          }, (e) => { throw e; });

          return koaHelper.authenticate(ctx, () => {})
            .then(() => ctx);
        })
        .then((ctx) => {
          expect(ctx).to.exist;
          expect(ctx.body).to.exist;
          expect(ctx.body.error).to.exist;
          expect(ctx.body.error).to.be.equal('Wrong credential');
        });
    });

    it('middleware: requireAdminPrivilege', function () {
      this.timeout(9000);
      return createAzRdbmsMgr()
        .then(() => {
          const tokenInfo = authCore.createSession({
            user: {
              id: 'admin',
              name: 'admin',
              privilege: 'admin',
            },
            provider_id: 'basic',
            provider_user_id: 'admin',
          });

          return new Promise((resolve, reject) => {
          // console.log('tokenInfo :', tokenInfo);
            const ctx = new FakeCtx({
              request: {
                headers: {
                  authorization: `Bearer ${tokenInfo.token}`,
                },
              },
            }, reject);
            koaHelper.requireAdminPrivilege(ctx, () => {
              resolve(ctx);
            });
          });
        })
        .then((ctx) => {
          expect(ctx).to.exist;
          expect(ctx.local).to.exist;
          expect(ctx.local.userSession).to.exist;
          expect(ctx.local.userSession.user_id).to.be.equal('admin');
        });
    });
  });
});
