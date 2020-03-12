/* eslint-disable no-underscore-dangle */
import JwtSessionHelper from 'jwt-session-helper';
import ModuleBase from './ModuleBase';

export default class AuthCore extends ModuleBase {
  static $name = 'authCore';

  static $type = 'service';

  static $inject = [];

  static $funcDeps = {
    init: [],
    start: [],
  };

  constructor(secret, options = {}) {
    super();
    const {
      algorithm = 'HS256',
      issuer = 'localhost',
      expiresIn = '1y',
      acceptedIssuers,
    } = options;
    this.acceptedIssuers = acceptedIssuers;
    if (!this.acceptedIssuers) {
      this.acceptedIssuers = [issuer];
    }
    this.jwtSessionHelper = options.jwtSessionHelper || new JwtSessionHelper(secret, {
      defaults: {
        algorithm,
      },
      signDefaults: {
        issuer,
        expiresIn,
      },
      parsePayload: ({
        user, provider_id, provider_user_id, ...rest
      }) => ({
        user_id: user.id,
        user_name: user.name,
        auth_type: provider_id,
        auth_id: provider_user_id,
        privilege: user.privilege,
        subject: `user:${user.id}:${0}`,
        token_type: 'Bearer',
        ...rest,
      }),
      exposeInfo: (originalData, payload) => {
        const result = { ...payload };
        delete result.auth_type;
        delete result.auth_id;
        delete result.expiry_date;
        return result;
      },
    });
    this.Session = this.jwtSessionHelper.Session;
    this.options = options;
  }

  // =====================================================

  decodeToken = (token, handleError = () => {}) => {
    try {
      return this.jwtSessionHelper.decode(token);
    } catch (e) {
      handleError(e);
    }
    return null;
  };

  verifyToken = (token, handleError = () => {}) => {
    try {
      const result = this.jwtSessionHelper.verify(token);
      if (!this.acceptedIssuers.includes(result.iss)) {
        throw new Error(`Unaccepted issuer: ${result.iss}`);
      }
      return result;
    } catch (e) {
      handleError(e);
    }
    return null;
  };

  signToken = token => this.jwtSessionHelper.sign(token);

  verifyAuthorization(headers, handleError = e => console.warn('e :', e)) {
    let authorization = headers;
    if (typeof headers !== 'string') {
      ({ authorization } = headers);
    }
    if (!authorization || typeof authorization !== 'string') {
      return null;
    }

    const tokenStartPos = authorization.indexOf(' ');
    if (tokenStartPos < 0) {
      return null;
    }

    const token = authorization
    .substr(tokenStartPos + 1, authorization.length - tokenStartPos - 1);

    return token && this.verifyToken(token, handleError);
  }

  // =====================================================

  createSession(sessionData) {
    return this.jwtSessionHelper.createSession(sessionData, {
      mutatePayload: true,
    });
  }

  removeSession(token) {
    return Promise.resolve(0);
  }
}
