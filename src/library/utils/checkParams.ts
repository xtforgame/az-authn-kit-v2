import { RestfulError } from 'az-restful-helpers';
import {
  ParamsBase,
  RequiredParamsBase,
  CheckParamsFunction,
  OnCheckParamsFailFunction,
} from '../interfaces';

export function defaultOnFailToCheckReqParams(key) {
  return new RestfulError(400, `"${key}" is empty`);
}

export default function checkParams(obj : ParamsBase, _requiredParams: RequiredParamsBase, onFail : OnCheckParamsFailFunction = defaultOnFailToCheckReqParams) : null | Error {
  const requiredParams = _requiredParams || [];
  for (let i = 0; i < requiredParams.length; i++) {
    // if(!(requiredParams[i] in obj)){
    if (obj[requiredParams[i]] == null) {
      return onFail(requiredParams[i], i, requiredParams);
    }
  }
  return null;
}
