/* eslint-disable no-unused-vars, no-undef, func-names */
import chai from 'chai';

import path from 'path';
import fs from 'fs';
import Azldi from 'azldi';
import {
  AuthCore,
} from '../../src/library';

const { expect } = chai;

describe('AuthCore', () => {
  describe('Basic', () => {
    const key = fs.readFileSync(path.join(__dirname, '../self-signed/privatekey.pem'), 'utf8');
    const Classes = [
      AuthCore,
    ];
    const digestOrder = [
      AuthCore,
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
        },
      });

      [authCore] = results;

      return true;
    });

    it('should be able to create', function () {
      this.timeout(9000);
      const token = authCore.signToken({
        user_id: 1,
        user_name: 'rick',
        auth_type: 'basic',
        auth_id: '00000001',
        token_type: 'Bearer',
        privilege: 'admin',
        session_id: 0,
      });

      // console.log('info :', info);
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
});
