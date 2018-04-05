import map from 'lodash/map';
import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

export default function valToNumber(v) {
  if (isNumber(v)) {
    return v;
  } else if (isString(v)) {
    return parseFloat(v);
  } else if (isArray(v)) {
    return map(v, valToNumber);
  }

  throw new Error(
    'The value should be a number, a parseable string or an array of those.'
  );
}
