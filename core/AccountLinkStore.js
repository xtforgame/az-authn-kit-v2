"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AccountLinkStore = function AccountLinkStore(findAccountLink, createAccountLink) {
  _classCallCheck(this, AccountLinkStore);

  _defineProperty(this, "findAccountLink", void 0);

  _defineProperty(this, "createAccountLink", void 0);

  this.findAccountLink = findAccountLink;
  this.createAccountLink = createAccountLink;
};

exports["default"] = AccountLinkStore;