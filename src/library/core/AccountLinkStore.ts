import {
  FindAccountLinkFunc,
} from '../interfaces';

export default class AccountLinkStore {
  findAccountLink : FindAccountLinkFunc;

  constructor(findAccountLink : FindAccountLinkFunc) {
    this.findAccountLink = findAccountLink;
  }
}
