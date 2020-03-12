/* eslint-disable no-unused-vars, no-undef, func-names */
import chai from 'chai';

import path from 'path';
import fs from 'fs';
import { AuthCore } from 'library';

const { expect } = chai;

describe('AuthCore', () => {
  describe('Basic', () => {
    const key = fs.readFileSync(path.join(__dirname, '../self-signed/privatekey.pem'), 'utf8');

    let authCore = null;
    beforeEach(() => {
      authCore = new AuthCore(key, {});
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
