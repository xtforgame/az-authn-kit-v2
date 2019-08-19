"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AccountLinkStore = function AccountLinkStore(findAccountLink, createAccountLink) {
  _classCallCheck(this, AccountLinkStore);

  this.findAccountLink = findAccountLink;
  this.createAccountLink = createAccountLink;
};

exports["default"] = AccountLinkStore;