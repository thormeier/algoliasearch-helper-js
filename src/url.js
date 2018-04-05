/**
 * Module containing the functions to serialize and deserialize
 * {SearchParameters} in the query string format
 * @module algoliasearchHelper.url
 */

import shortener from './SearchParameters/shortener';

import SearchParameters from './SearchParameters';
import qs from 'qs';
import bind from 'lodash/bind';
import forEach from 'lodash/forEach';
import pick from 'lodash/pick';
import map from 'lodash/map';
import mapKeys from 'lodash/mapKeys';
import mapValues from 'lodash/mapValues';
import isString from 'lodash/isString';
import isPlainObject from 'lodash/isPlainObject';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import invert from 'lodash/invert';
import { encode } from 'qs/lib/utils';

function recursiveEncode(input) {
  if (isPlainObject(input)) {
    return mapValues(input, recursiveEncode);
  }
  if (isArray(input)) {
    return map(input, recursiveEncode);
  }
  if (isString(input)) {
    return encode(input);
  }
  return input;
}
/* eslint-disable no-param-reassign */

const refinementsParameters = ['dFR', 'fR', 'nR', 'hFR', 'tR'];
const stateKeys = shortener.ENCODED_PARAMETERS;
function sortQueryStringValues(prefixRegexp, invertedMapping, a, b) {
  if (prefixRegexp !== null) {
    a = a.replace(prefixRegexp, '');
    b = b.replace(prefixRegexp, '');
  }

  a = invertedMapping[a] || a;
  b = invertedMapping[b] || b;

  if (stateKeys.indexOf(a) !== -1 || stateKeys.indexOf(b) !== -1) {
    if (a === 'q') return -1;
    if (b === 'q') return 1;

    const isARefinements = refinementsParameters.indexOf(a) !== -1;
    const isBRefinements = refinementsParameters.indexOf(b) !== -1;
    if (isARefinements && !isBRefinements) {
      return 1;
    } else if (isBRefinements && !isARefinements) {
      return -1;
    }
  }

  return a.localeCompare(b);
}

/**
 * Read a query string and return an object containing the state
 * @param {string} queryString the query string that will be decoded
 * @param {object} [options] accepted options :
 *   - prefix : the prefix used for the saved attributes, you have to provide the
 *     same that was used for serialization
 *   - mapping : map short attributes to another value e.g. {q: 'query'}
 * @return {object} partial search parameters object (same properties than in the
 * SearchParameters but not exhaustive)
 */
export const getStateFromQueryString = function(queryString, options) {
  const prefixForParameters = (options && options.prefix) || '';
  const mapping = (options && options.mapping) || {};
  const invertedMapping = invert(mapping);

  const partialStateWithPrefix = qs.parse(queryString);
  const prefixRegexp = new RegExp(`^${prefixForParameters}`);
  const partialState = mapKeys(partialStateWithPrefix, (v, k) => {
    const hasPrefix = prefixForParameters && prefixRegexp.test(k);
    const unprefixedKey = hasPrefix ? k.replace(prefixRegexp, '') : k;
    const decodedKey = shortener.decode(
      invertedMapping[unprefixedKey] || unprefixedKey
    );
    return decodedKey || unprefixedKey;
  });

  const partialStateWithParsedNumbers = SearchParameters._parseNumbers(
    partialState
  );

  return pick(partialStateWithParsedNumbers, SearchParameters.PARAMETERS);
};

/**
 * Retrieve an object of all the properties that are not understandable as helper
 * parameters.
 * @param {string} queryString the query string to read
 * @param {object} [options] the options
 *   - prefixForParameters : prefix used for the helper configuration keys
 *   - mapping : map short attributes to another value e.g. {q: 'query'}
 * @return {object} the object containing the parsed configuration that doesn't
 * to the helper
 */
export const getUnrecognizedParametersInQueryString = function(
  queryString,
  options
) {
  const prefixForParameters = options && options.prefix;
  const mapping = (options && options.mapping) || {};
  const invertedMapping = invert(mapping);

  const foreignConfig = {};
  const config = qs.parse(queryString);
  if (prefixForParameters) {
    const prefixRegexp = new RegExp(`^${prefixForParameters}`);
    forEach(config, (v, key) => {
      if (!prefixRegexp.test(key)) foreignConfig[key] = v;
    });
  } else {
    forEach(config, (v, key) => {
      if (!shortener.decode(invertedMapping[key] || key))
        foreignConfig[key] = v;
    });
  }

  return foreignConfig;
};

/**
 * Generate a query string for the state passed according to the options
 * @param {SearchParameters} state state to serialize
 * @param {object} [options] May contain the following parameters :
 *  - prefix : prefix in front of the keys
 *  - mapping : map short attributes to another value e.g. {q: 'query'}
 *  - moreAttributes : more values to be added in the query string. Those values
 *    won't be prefixed.
 *  - safe : get safe urls for use in emails, chat apps or any application auto linking urls.
 *  All parameters and values will be encoded in a way that it's safe to share them.
 *  Default to false for legacy reasons ()
 * @return {string} the query string
 */
export const getQueryStringFromState = function(state, options) {
  const moreAttributes = options && options.moreAttributes;
  const prefixForParameters = (options && options.prefix) || '';
  const mapping = (options && options.mapping) || {};
  const safe = (options && options.safe) || false;
  const invertedMapping = invert(mapping);

  const stateForUrl = safe ? state : recursiveEncode(state);

  const encodedState = mapKeys(stateForUrl, (v, k) => {
    const shortK = shortener.encode(k);
    return prefixForParameters + (mapping[shortK] || shortK);
  });

  const prefixRegexp =
    prefixForParameters === '' ? null : new RegExp(`^${prefixForParameters}`);
  const sort = bind(sortQueryStringValues, null, prefixRegexp, invertedMapping);
  if (!isEmpty(moreAttributes)) {
    const stateQs = qs.stringify(encodedState, { encode: safe, sort });
    const moreQs = qs.stringify(moreAttributes, { encode: safe });
    if (!stateQs) return moreQs;
    return `${stateQs}&${moreQs}`;
  }

  return qs.stringify(encodedState, { encode: safe, sort });
};
