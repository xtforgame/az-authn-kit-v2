"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _default = function _default(_ref) {
  var _ref$user = _ref.user,
      userPublicColumns = _ref$user.publicColumns,
      userColumns = _ref$user.columns,
      _ref$accountLink = _ref.accountLink,
      accountLinkPublicColumns = _ref$accountLink.publicColumns,
      accountLinkColumns = _ref$accountLink.columns;
  return {
    models: {
      user: {
        columns: userColumns,
        options: {
          name: {
            singular: 'user',
            plural: 'users'
          }
        }
      },
      accountLink: {
        columns: accountLinkColumns,
        options: {
          name: {
            singular: 'accountLink',
            plural: 'accountLinks'
          },
          indexes: [{
            name: 'provider_user_id_should_be_unique',
            unique: true,
            fields: ['user_id', 'provider_id', 'provider_user_id'],
            where: {
              deleted_at: null
            }
          }, {
            unique: true,
            fields: ['provider_id', 'provider_user_id'],
            where: {
              deleted_at: null
            }
          }]
        }
      }
    }
  };
};

exports["default"] = _default;