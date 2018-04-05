import forEach from 'lodash/forEach';
import filter from 'lodash/filter';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';
import indexOf from 'lodash/indexOf';

function filterState(state, filters) {
  const partialState = {};
  const attributeFilters = filter(filters, f => f.indexOf('attribute:') !== -1);
  const attributes = map(attributeFilters, aF => aF.split(':')[1]);

  if (indexOf(attributes, '*') === -1) {
    forEach(attributes, attr => {
      if (state.isConjunctiveFacet(attr) && state.isFacetRefined(attr)) {
        if (!partialState.facetsRefinements)
          partialState.facetsRefinements = {};
        partialState.facetsRefinements[attr] = state.facetsRefinements[attr];
      }

      if (
        state.isDisjunctiveFacet(attr) &&
        state.isDisjunctiveFacetRefined(attr)
      ) {
        if (!partialState.disjunctiveFacetsRefinements)
          partialState.disjunctiveFacetsRefinements = {};
        partialState.disjunctiveFacetsRefinements[attr] =
          state.disjunctiveFacetsRefinements[attr];
      }

      if (
        state.isHierarchicalFacet(attr) &&
        state.isHierarchicalFacetRefined(attr)
      ) {
        if (!partialState.hierarchicalFacetsRefinements)
          partialState.hierarchicalFacetsRefinements = {};
        partialState.hierarchicalFacetsRefinements[attr] =
          state.hierarchicalFacetsRefinements[attr];
      }

      const numericRefinements = state.getNumericRefinements(attr);
      if (!isEmpty(numericRefinements)) {
        if (!partialState.numericRefinements)
          partialState.numericRefinements = {};
        partialState.numericRefinements[attr] = state.numericRefinements[attr];
      }
    });
  } else {
    if (!isEmpty(state.numericRefinements)) {
      partialState.numericRefinements = state.numericRefinements;
    }
    if (!isEmpty(state.facetsRefinements))
      partialState.facetsRefinements = state.facetsRefinements;
    if (!isEmpty(state.disjunctiveFacetsRefinements)) {
      partialState.disjunctiveFacetsRefinements =
        state.disjunctiveFacetsRefinements;
    }
    if (!isEmpty(state.hierarchicalFacetsRefinements)) {
      partialState.hierarchicalFacetsRefinements =
        state.hierarchicalFacetsRefinements;
    }
  }

  const searchParameters = filter(filters, f => f.indexOf('attribute:') === -1);

  forEach(searchParameters, parameterKey => {
    partialState[parameterKey] = state[parameterKey];
  });

  return partialState;
}

export default filterState;
