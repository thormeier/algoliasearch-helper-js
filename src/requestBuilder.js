import forEach from 'lodash/forEach';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import merge from 'lodash/merge';
import isArray from 'lodash/isArray';

const requestBuilder = {
  /**
   * Get all the queries to send to the client, those queries can used directly
   * with the Algolia client.
   * @private
   * @return {object[]} The queries
   */
  _getQueries: function getQueries(index, state) {
    const queries = [];

    // One query for the hits
    queries.push({
      indexName: index,
      params: requestBuilder._getHitsSearchParams(state),
    });

    // One for each disjunctive facets
    forEach(state.getRefinedDisjunctiveFacets(), refinedFacet => {
      queries.push({
        indexName: index,
        params: requestBuilder._getDisjunctiveFacetSearchParams(
          state,
          refinedFacet
        ),
      });
    });

    // maybe more to get the root level of hierarchical facets when activated
    forEach(state.getRefinedHierarchicalFacets(), refinedFacet => {
      const hierarchicalFacet = state.getHierarchicalFacetByName(refinedFacet);

      const currentRefinement = state.getHierarchicalRefinement(refinedFacet);
      // if we are deeper than level 0 (starting from `beer > IPA`)
      // we want to get the root values
      const separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
      if (
        currentRefinement.length > 0 &&
        currentRefinement[0].split(separator).length > 1
      ) {
        queries.push({
          indexName: index,
          params: requestBuilder._getDisjunctiveFacetSearchParams(
            state,
            refinedFacet,
            true
          ),
        });
      }
    });

    return queries;
  },

  /**
   * Build search parameters used to fetch hits
   * @private
   * @return {object.<string, any>}
   */
  _getHitsSearchParams(state) {
    const facets = state.facets
      .concat(state.disjunctiveFacets)
      .concat(requestBuilder._getHitsHierarchicalFacetsAttributes(state));

    const facetFilters = requestBuilder._getFacetFilters(state);
    const numericFilters = requestBuilder._getNumericFilters(state);
    const tagFilters = requestBuilder._getTagFilters(state);
    const additionalParams = {
      facets,
      tagFilters,
    };

    if (facetFilters.length > 0) {
      additionalParams.facetFilters = facetFilters;
    }

    if (numericFilters.length > 0) {
      additionalParams.numericFilters = numericFilters;
    }

    return merge(state.getQueryParams(), additionalParams);
  },

  /**
   * Build search parameters used to fetch a disjunctive facet
   * @private
   * @param  {string} facet the associated facet name
   * @param  {boolean} hierarchicalRootLevel ?? FIXME
   * @return {object}
   */
  _getDisjunctiveFacetSearchParams(state, facet, hierarchicalRootLevel) {
    const facetFilters = requestBuilder._getFacetFilters(
      state,
      facet,
      hierarchicalRootLevel
    );
    const numericFilters = requestBuilder._getNumericFilters(state, facet);
    const tagFilters = requestBuilder._getTagFilters(state);
    const additionalParams = {
      hitsPerPage: 1,
      page: 0,
      attributesToRetrieve: [],
      attributesToHighlight: [],
      attributesToSnippet: [],
      tagFilters,
      analytics: false,
      clickAnalytics: false,
    };

    const hierarchicalFacet = state.getHierarchicalFacetByName(facet);

    if (hierarchicalFacet) {
      additionalParams.facets = requestBuilder._getDisjunctiveHierarchicalFacetAttribute(
        state,
        hierarchicalFacet,
        hierarchicalRootLevel
      );
    } else {
      additionalParams.facets = facet;
    }

    if (numericFilters.length > 0) {
      additionalParams.numericFilters = numericFilters;
    }

    if (facetFilters.length > 0) {
      additionalParams.facetFilters = facetFilters;
    }

    return merge(state.getQueryParams(), additionalParams);
  },

  /**
   * Return the numeric filters in an algolia request fashion
   * @private
   * @param {string} [facetName] the name of the attribute for which the filters should be excluded
   * @return {string[]} the numeric filters in the algolia format
   */
  _getNumericFilters(state, facetName) {
    if (state.numericFilters) {
      return state.numericFilters;
    }

    const numericFilters = [];

    forEach(state.numericRefinements, (operators, attribute) => {
      forEach(operators, (values, operator) => {
        if (facetName !== attribute) {
          forEach(values, value => {
            if (isArray(value)) {
              const vs = map(value, v => attribute + operator + v);
              numericFilters.push(vs);
            } else {
              numericFilters.push(attribute + operator + value);
            }
          });
        }
      });
    });

    return numericFilters;
  },

  /**
   * Return the tags filters depending
   * @private
   * @return {string}
   */
  _getTagFilters(state) {
    if (state.tagFilters) {
      return state.tagFilters;
    }

    return state.tagRefinements.join(',');
  },

  /**
   * Build facetFilters parameter based on current refinements. The array returned
   * contains strings representing the facet filters in the algolia format.
   * @private
   * @param  {string} [facet] if set, the current disjunctive facet
   * @return {array.<string>}
   */
  _getFacetFilters(state, facet, hierarchicalRootLevel) {
    const facetFilters = [];

    forEach(state.facetsRefinements, (facetValues, facetName) => {
      forEach(facetValues, facetValue => {
        facetFilters.push(`${facetName}:${facetValue}`);
      });
    });

    forEach(state.facetsExcludes, (facetValues, facetName) => {
      forEach(facetValues, facetValue => {
        facetFilters.push(`${facetName}:-${facetValue}`);
      });
    });

    forEach(state.disjunctiveFacetsRefinements, (facetValues, facetName) => {
      if (facetName === facet || !facetValues || facetValues.length === 0)
        return;
      const orFilters = [];

      forEach(facetValues, facetValue => {
        orFilters.push(`${facetName}:${facetValue}`);
      });

      facetFilters.push(orFilters);
    });

    forEach(state.hierarchicalFacetsRefinements, (facetValues, facetName) => {
      let facetValue = facetValues[0];

      if (facetValue === undefined) {
        return;
      }

      const hierarchicalFacet = state.getHierarchicalFacetByName(facetName);
      const separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
      const rootPath = state._getHierarchicalRootPath(hierarchicalFacet);
      let attributeToRefine;
      let attributesIndex;

      // we ask for parent facet values only when the `facet` is the current hierarchical facet
      if (facet === facetName) {
        // if we are at the root level already, no need to ask for facet values, we get them from
        // the hits query
        if (
          facetValue.indexOf(separator) === -1 ||
          (!rootPath && hierarchicalRootLevel === true) ||
          (rootPath &&
            rootPath.split(separator).length ===
              facetValue.split(separator).length)
        ) {
          return;
        }

        if (!rootPath) {
          attributesIndex = facetValue.split(separator).length - 2;
          facetValue = facetValue.slice(0, facetValue.lastIndexOf(separator));
        } else {
          attributesIndex = rootPath.split(separator).length - 1;
          facetValue = rootPath;
        }

        attributeToRefine = hierarchicalFacet.attributes[attributesIndex];
      } else {
        attributesIndex = facetValue.split(separator).length - 1;

        attributeToRefine = hierarchicalFacet.attributes[attributesIndex];
      }

      if (attributeToRefine) {
        facetFilters.push([`${attributeToRefine}:${facetValue}`]);
      }
    });

    return facetFilters;
  },

  _getHitsHierarchicalFacetsAttributes(state) {
    const out = [];

    return reduce(
      state.hierarchicalFacets,
      // ask for as much levels as there's hierarchical refinements
      (allAttributes, hierarchicalFacet) => {
        const hierarchicalRefinement = state.getHierarchicalRefinement(
          hierarchicalFacet.name
        )[0];

        // if no refinement, ask for root level
        if (!hierarchicalRefinement) {
          allAttributes.push(hierarchicalFacet.attributes[0]);
          return allAttributes;
        }

        const separator = state._getHierarchicalFacetSeparator(
          hierarchicalFacet
        );
        const level = hierarchicalRefinement.split(separator).length;
        const newAttributes = hierarchicalFacet.attributes.slice(0, level + 1);

        return allAttributes.concat(newAttributes);
      },
      out
    );
  },

  _getDisjunctiveHierarchicalFacetAttribute(
    state,
    hierarchicalFacet,
    rootLevel
  ) {
    const separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);
    if (rootLevel === true) {
      const rootPath = state._getHierarchicalRootPath(hierarchicalFacet);
      let attributeIndex = 0;

      if (rootPath) {
        attributeIndex = rootPath.split(separator).length;
      }
      return [hierarchicalFacet.attributes[attributeIndex]];
    }

    const hierarchicalRefinement =
      state.getHierarchicalRefinement(hierarchicalFacet.name)[0] || '';
    // if refinement is 'beers > IPA > Flying dog',
    // then we want `facets: ['beers > IPA']` as disjunctive facet (parent level values)

    const parentLevel = hierarchicalRefinement.split(separator).length - 1;
    return hierarchicalFacet.attributes.slice(0, parentLevel + 1);
  },

  getSearchForFacetQuery(facetName, query, maxFacetHits, state) {
    const stateForSearchForFacetValues = state.isDisjunctiveFacet(facetName)
      ? state.clearRefinements(facetName)
      : state;
    const searchForFacetSearchParameters = {
      facetQuery: query,
      facetName,
    };
    if (typeof maxFacetHits === 'number') {
      searchForFacetSearchParameters.maxFacetHits = maxFacetHits;
    }
    const queries = merge(
      requestBuilder._getHitsSearchParams(stateForSearchForFacetValues),
      searchForFacetSearchParameters
    );
    return queries;
  },
};

export default requestBuilder;
