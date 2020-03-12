import { ParamsBase, RequiredParamsBase, OnCheckParamsFailFunction } from '../interfaces';
export declare function defaultOnFailToCheckReqParams(key: any): any;
export default function checkParams(obj: ParamsBase, _requiredParams: RequiredParamsBase, onFail?: OnCheckParamsFailFunction): null | Error;
