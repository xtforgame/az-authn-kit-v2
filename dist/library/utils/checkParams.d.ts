import { AuthParams, RequiredAuthParams, OnCheckParamsFailFunction } from '../interfaces';
export declare function defaultOnFailToCheckReqParams(key: any): any;
export default function checkParams(obj: AuthParams, _requiredParams: RequiredAuthParams, onFail?: OnCheckParamsFailFunction): null | Error;
