/**
 * Functions to manipulate refinement lists
 *
 * The RefinementList is not formally defined through a prototype but is based
 * on a specific structure.
 *
 * @module SearchParameters.refinementList
 *
 * @typedef {string[]} SearchParameters.refinementList.Refinements
 * @typedef {Object.<string, SearchParameters.refinementList.Refinements>} SearchParameters.refinementList.RefinementList
 */

import isUndefined from 'lodash/isUndefined';

import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import isEmpty from 'lodash/isEmpty';
import defaults from 'lodash/defaults';
import reduce from 'lodash/reduce';
import filter from 'lodash/filter';
import omit from 'lodash/omit';
import indexOf from 'lodash/indexOf';

const RefinementList = {
  /**
   * Adds a refinement to a RefinementList
   * @param {RefinementList} refinementList the initial list
   * @param {string} attribute the attribute to refine
   * @param {string} value the value of the refinement, if the value is not a string it will be converted
   * @return {RefinementList} a new and updated refinement list
   */
  addRefinement: function addRefinement(refinementList, attribute, value) {
    if (RefinementList.isRefined(refinementList, attribute, value)) {
      return refinementList;
    }

    const valueAsString = `${value}`;

    const facetRefinement = !refinementList[attribute]
      ? [valueAsString]
      : refinementList[attribute].concat(valueAsString);

    const mod = {};

    mod[attribute] = facetRefinement;

    return defaults({}, mod, refinementList);
  },
  /**
   * Removes refinement(s) for an attribute:
   *  - if the value is specified removes the refinement for the value on the attribute
   *  - if no value is specified removes all the refinements for this attribute
   * @param {RefinementList} refinementList the initial list
   * @param {string} attribute the attribute to refine
   * @param {string} [value] the value of the refinement
   * @return {RefinementList} a new and updated refinement lst
   */
  removeRefinement: function removeRefinement(
    refinementList,
    attribute,
    value
  ) {
    if (isUndefined(value)) {
      return RefinementList.clearRefinement(refinementList, attribute);
    }

    const valueAsString = `${value}`;

    return RefinementList.clearRefinement(
      refinementList,
      (v, f) => attribute === f && valueAsString === v
    );
  },
  /**
   * Toggles the refinement value for an attribute.
   * @param {RefinementList} refinementList the initial list
   * @param {string} attribute the attribute to refine
   * @param {string} value the value of the refinement
   * @return {RefinementList} a new and updated list
   */
  toggleRefinement: function toggleRefinement(
    refinementList,
    attribute,
    value
  ) {
    if (isUndefined(value))
      throw new Error('toggleRefinement should be used with a value');

    if (RefinementList.isRefined(refinementList, attribute, value)) {
      return RefinementList.removeRefinement(refinementList, attribute, value);
    }

    return RefinementList.addRefinement(refinementList, attribute, value);
  },
  /**
   * Clear all or parts of a RefinementList. Depending on the arguments, three
   * kinds of behavior can happen:
   *  - if no attribute is provided: clears the whole list
   *  - if an attribute is provided as a string: clears the list for the specific attribute
   *  - if an attribute is provided as a function: discards the elements for which the function returns true
   * @param {RefinementList} refinementList the initial list
   * @param {string} [attribute] the attribute or function to discard
   * @param {string} [refinementType] optional parameter to give more context to the attribute function
   * @return {RefinementList} a new and updated refinement list
   */
  clearRefinement: function clearRefinement(
    refinementList,
    attribute,
    refinementType
  ) {
    if (isUndefined(attribute)) {
      if (isEmpty(refinementList)) return refinementList;
      return {};
    } else if (isString(attribute)) {
      if (isEmpty(refinementList[attribute])) return refinementList;
      return omit(refinementList, attribute);
    } else if (isFunction(attribute)) {
      let hasChanged = false;

      const newRefinementList = reduce(
        refinementList,
        (memo, values, key) => {
          const facetList = filter(
            values,
            value => !attribute(value, key, refinementType)
          );

          if (!isEmpty(facetList)) {
            if (facetList.length !== values.length) hasChanged = true;
            memo[key] = facetList; // eslint-disable-line no-param-reassign
          } else hasChanged = true;

          return memo;
        },
        {}
      );

      if (hasChanged) return newRefinementList;
      return refinementList;
    }
    return refinementList;
  },
  /**
   * Test if the refinement value is used for the attribute. If no refinement value
   * is provided, test if the refinementList contains any refinement for the
   * given attribute.
   * @param {RefinementList} refinementList the list of refinement
   * @param {string} attribute name of the attribute
   * @param {string} [refinementValue] value of the filter/refinement
   * @return {boolean}
   */
  isRefined: function isRefined(refinementList, attribute, refinementValue) {
    const containsRefinements =
      Boolean(refinementList[attribute]) &&
      refinementList[attribute].length > 0;

    if (isUndefined(refinementValue) || !containsRefinements) {
      return containsRefinements;
    }

    const refinementValueAsString = `${refinementValue}`;

    return indexOf(refinementList[attribute], refinementValueAsString) !== -1;
  },
};

export default RefinementList;
