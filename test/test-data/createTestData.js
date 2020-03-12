import Sequelize from 'sequelize';
import { sha512gen_salt, crypt } from '../../src/library/utils/crypt';

const getAccountLinks = username => ([{
  provider_id: 'basic',
  provider_user_id: username,
  provider_user_access_info: {
    password: crypt(username, sha512gen_salt()),
  },
}]);

function createTestUser(resourceManager) {
  const userModel = resourceManager.getSqlzModel('user');
  return userModel.findAll({
    attributes: [[Sequelize.fn('COUNT', Sequelize.col('name')), 'usercount']],
  })
    .then((users) => {
      if (users[0].dataValues.usercount == 0) { // eslint-disable-line eqeqeq
        return userModel.create({
          name: 'admin',
          privilege: 'admin',
          accountLinks: getAccountLinks('admin'),
        })
          .then(() => userModel.create({
            name: 'world',
            privilege: 'world',
            accountLinks: getAccountLinks('world'),
          }))
          .then(() => userModel.create({
            name: 'user01',
            privilege: 'user',
            accountLinks: getAccountLinks('user01'),
          }))
          .then(() => userModel.create({
            name: 'user02',
            privilege: 'user',
            accountLinks: getAccountLinks('user02'),
          }))
          .then(() => userModel.create({
            name: 'user03',
            privilege: 'user',
            accountLinks: getAccountLinks('user03'),
          }));
      }
      return Promise.resolve(null);
    });
}

export default function createTestData(resourceManager, ignore = false) {
  if (ignore) {
    return Promise.resolve(true);
  }
  return createTestUser(resourceManager);
}
