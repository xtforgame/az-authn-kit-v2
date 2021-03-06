import {
  FindAccountLinkFunc,
  CreateAccountLinkFunc,
} from '../interfaces';

export default class AccountLinkStore {
  findAccountLink : FindAccountLinkFunc;
  createAccountLink : CreateAccountLinkFunc;

  constructor(findAccountLink : FindAccountLinkFunc, createAccountLink : CreateAccountLinkFunc) {
    this.findAccountLink = findAccountLink;
    this.createAccountLink = createAccountLink;
  }
}
