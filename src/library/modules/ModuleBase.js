/* eslint-disable no-underscore-dangle */
export default class ModuleBase {
  static $name = 'base';

  static $type = 'service';

  static $funcDeps = {
    init: [],
    start: [],
  };

  init(...args) {
    return new Promise((resolve, reject) => {
      try {
        return resolve(this.onInit && this.onInit(...args));
      } catch (e) {
        return reject(e);
      }
    });
  }

  start(...args) {
    return new Promise((resolve, reject) => {
      try {
        return resolve(this.onStart && this.onStart(...args));
      } catch (e) {
        return reject(e);
      }
    });
  }
}
