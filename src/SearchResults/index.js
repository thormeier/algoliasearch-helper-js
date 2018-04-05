import forEach from 'lodash/forEach';
import compact from 'lodash/compact';
import indexOf from 'lodash/indexOf';
import findIndex from 'lodash/findIndex';
import get from 'lodash/get';
import sumBy from 'lodash/sumBy';
import find from 'lodash/find';
import includes from 'lodash/includes';
import map from 'lodash/map';
import orderBy from 'lodash/orderBy';
import defaults from 'lodash/defaults';
import merge from 'lodash/merge';
import isArray from 'lodash/isArray';
import isFunction from 'lodash/isFunction';
import partial from 'lodash/partial';
import partialRight from 'lodash/partialRight';
import formatSort from '../functions/formatSort';
import generateHierarchicalTree from './generate-hierarchical-tree';

/**
 * @typedef SearchResults.Facet
 * @type {object}
 * @property {string} name name of the attribute in the record
 * @property {object} data the faceting data: value, number of entries
 * @property {object} stats undefined unless facet_stats is retrieved from algolia
 */

/**
 * @typedef SearchResults.HierarchicalFacet
 * @type {object}
 * @property {string} name name of the current value given the hierarchical level, trimmed.
 * If root node, you get the facet name
 * @property {number} count number of objects matching this hierarchical value
 * @property {string} path the current hierarchical value full path
 * @property {boolean} isRefined `true` if the current value was refined, `false` otherwise
 * @property {HierarchicalFacet[]} data sub values for the current level
 */

/**
 * @typedef SearchResults.FacetValue
 * @type {object}
 * @property {string} name the facet value itself
 * @property {number} count times this facet appears in the results
 * @property {boolean} isRefined is the facet currently selected
 * @property {boolean} isExcluded is the facet currently excluded (only for conjunctive facets)
 */

/**
 * @typedef Refinement
 * @type {object}
 * @property {string} type the type of filter used:
 * `numeric`, `facet`, `exclude`, `disjunctive`, `hierarchical`
 * @property {string} attributeName name of the attribute used for filtering
 * @property {string} name the value of the filter
 * @property {number} numericValue the value as a number. Only for numeric filters.
 * @property {string} operator the operator used. Only for numeric filters.
 * @property {number} count the number of computed hits for this filter. Only on facets.
 * @property {boolean} exhaustive if the count is exhaustive
 */

function getIndices(obj) {
  const indices = {};

  forEach(obj, (val, idx) => {
    indices[val] = idx;
  });

  return indices;
}

function assignFacetStats(dest, facetStats, key) {
  if (facetStats && facetStats[key]) {
    dest.stats = facetStats[key]; // eslint-disable-line no-param-reassign
  }
}

function findMatchingHierarchicalFacetFromAttributeName(
  hierarchicalFacets,
  hierarchicalAttributeName
) {
  return find(hierarchicalFacets, hierarchicalFacet =>
    includes(hierarchicalFacet.attributes, hierarchicalAttributeName)
  );
}

/*eslint-disable */
/**
 * Constructor for SearchResults
 * @class
 * @classdesc SearchResults contains the results of a query to Algolia using the
 * {@link AlgoliaSearchHelper}.
 * @param {SearchParameters} state state that led to the response
 * @param {array.<object>} results the results from algolia client
 * @example <caption>SearchResults of the first query in
 * <a href="http://demos.algolia.com/instant-search-demo">the instant search demo</a></caption>
{
   "hitsPerPage": 10,
   "processingTimeMS": 2,
   "facets": [
      {
         "name": "type",
         "data": {
            "HardGood": 6627,
            "BlackTie": 550,
            "Music": 665,
            "Software": 131,
            "Game": 456,
            "Movie": 1571
         },
         "exhaustive": false
      },
      {
         "exhaustive": false,
         "data": {
            "Free shipping": 5507
         },
         "name": "shipping"
      }
  ],
   "hits": [
      {
         "thumbnailImage": "http://img.bbystatic.com/BestBuy_US/images/products/1688/1688832_54x108_s.gif",
         "_highlightResult": {
            "shortDescription": {
               "matchLevel": "none",
               "value": "Safeguard your PC, Mac, Android and iOS devices with comprehensive Internet protection",
               "matchedWords": []
            },
            "category": {
               "matchLevel": "none",
               "value": "Computer Security Software",
               "matchedWords": []
            },
            "manufacturer": {
               "matchedWords": [],
               "value": "Webroot",
               "matchLevel": "none"
            },
            "name": {
               "value": "Webroot SecureAnywhere Internet Security (3-Device) (1-Year Subscription) - Mac/Windows",
               "matchedWords": [],
               "matchLevel": "none"
            }
         },
         "image": "http://img.bbystatic.com/BestBuy_US/images/products/1688/1688832_105x210_sc.jpg",
         "shipping": "Free shipping",
         "bestSellingRank": 4,
         "shortDescription": "Safeguard your PC, Mac, Android and iOS devices with comprehensive Internet protection",
         "url": "http://www.bestbuy.com/site/webroot-secureanywhere-internet-security-3-devi…d=1219060687969&skuId=1688832&cmp=RMX&ky=2d3GfEmNIzjA0vkzveHdZEBgpPCyMnLTJ",
         "name": "Webroot SecureAnywhere Internet Security (3-Device) (1-Year Subscription) - Mac/Windows",
         "category": "Computer Security Software",
         "salePrice_range": "1 - 50",
         "objectID": "1688832",
         "type": "Software",
         "customerReviewCount": 5980,
         "salePrice": 49.99,
         "manufacturer": "Webroot"
      },
      ....
  ],
   "nbHits": 10000,
   "disjunctiveFacets": [
      {
         "exhaustive": false,
         "data": {
            "5": 183,
            "12": 112,
            "7": 149,
            ...
         },
         "name": "customerReviewCount",
         "stats": {
            "max": 7461,
            "avg": 157.939,
            "min": 1
         }
      },
      {
         "data": {
            "Printer Ink": 142,
            "Wireless Speakers": 60,
            "Point & Shoot Cameras": 48,
            ...
         },
         "name": "category",
         "exhaustive": false
      },
      {
         "exhaustive": false,
         "data": {
            "> 5000": 2,
            "1 - 50": 6524,
            "501 - 2000": 566,
            "201 - 500": 1501,
            "101 - 200": 1360,
            "2001 - 5000": 47
         },
         "name": "salePrice_range"
      },
      {
         "data": {
            "Dynex™": 202,
            "Insignia™": 230,
            "PNY": 72,
            ...
         },
         "name": "manufacturer",
         "exhaustive": false
      }
  ],
   "query": "",
   "nbPages": 100,
   "page": 0,
   "index": "bestbuy"
}
 **/
/* eslint-enable */
function SearchResults(state, results) {
  const mainSubResponse = results[0];

  this._rawResults = results;

  /**
   * query used to generate the results
   * @member {string}
   */
  this.query = mainSubResponse.query;
  /**
   * The query as parsed by the engine given all the rules.
   * @member {string}
   */
  this.parsedQuery = mainSubResponse.parsedQuery;
  /**
   * all the records that match the search parameters. Each record is
   * augmented with a new attribute `_highlightResult`
   * which is an object keyed by attribute and with the following properties:
   *  - `value` : the value of the facet highlighted (html)
   *  - `matchLevel`: full, partial or none depending on how the query terms match
   * @member {object[]}
   */
  this.hits = mainSubResponse.hits;
  /**
   * index where the results come from
   * @member {string}
   */
  this.index = mainSubResponse.index;
  /**
   * number of hits per page requested
   * @member {number}
   */
  this.hitsPerPage = mainSubResponse.hitsPerPage;
  /**
   * total number of hits of this query on the index
   * @member {number}
   */
  this.nbHits = mainSubResponse.nbHits;
  /**
   * total number of pages with respect to the number of hits per page and the total number of hits
   * @member {number}
   */
  this.nbPages = mainSubResponse.nbPages;
  /**
   * current page
   * @member {number}
   */
  this.page = mainSubResponse.page;
  /**
   * sum of the processing time of all the queries
   * @member {number}
   */
  this.processingTimeMS = sumBy(results, 'processingTimeMS');
  /**
   * The position if the position was guessed by IP.
   * @member {string}
   * @example "48.8637,2.3615",
   */
  this.aroundLatLng = mainSubResponse.aroundLatLng;
  /**
   * The radius computed by Algolia.
   * @member {string}
   * @example "126792922",
   */
  this.automaticRadius = mainSubResponse.automaticRadius;
  /**
   * String identifying the server used to serve this request.
   * @member {string}
   * @example "c7-use-2.algolia.net",
   */
  this.serverUsed = mainSubResponse.serverUsed;
  /**
   * Boolean that indicates if the computation of the counts did time out.
   * @deprecated
   * @member {boolean}
   */
  this.timeoutCounts = mainSubResponse.timeoutCounts;
  /**
   * Boolean that indicates if the computation of the hits did time out.
   * @deprecated
   * @member {boolean}
   */
  this.timeoutHits = mainSubResponse.timeoutHits;

  /**
   * True if the counts of the facets is exhaustive
   * @member {boolean}
   */
  this.exhaustiveFacetsCount = mainSubResponse.exhaustiveFacetsCount;

  /**
   * True if the number of hits is exhaustive
   * @member {boolean}
   */
  this.exhaustiveNbHits = mainSubResponse.exhaustiveNbHits;

  /**
   * Contains the userData if they are set by a [query rule](https://www.algolia.com/doc/guides/query-rules/query-rules-overview/).
   * @member {object[]}
   */
  this.userData = mainSubResponse.userData;

  /**
   * queryID is the unique identifier of the query used to generate the current search results.
   * This value is only available if the `clickAnalytics` search parameter is set to `true`.
   * @member {string}
   */
  this.queryID = mainSubResponse.queryID;

  /**
   * disjunctive facets results
   * @member {SearchResults.Facet[]}
   */
  this.disjunctiveFacets = [];
  /**
   * disjunctive facets results
   * @member {SearchResults.HierarchicalFacet[]}
   */
  this.hierarchicalFacets = map(state.hierarchicalFacets, () => []);
  /**
   * other facets results
   * @member {SearchResults.Facet[]}
   */
  this.facets = [];

  const disjunctiveFacets = state.getRefinedDisjunctiveFacets();

  const facetsIndices = getIndices(state.facets);
  const disjunctiveFacetsIndices = getIndices(state.disjunctiveFacets);
  let nextDisjunctiveResult = 1;

  // Since we send request only for disjunctive facets that have been refined,
  // we get the facets informations from the first, general, response.
  forEach(mainSubResponse.facets, (facetValueObject, facetKey) => {
    const hierarchicalFacet = findMatchingHierarchicalFacetFromAttributeName(
      state.hierarchicalFacets,
      facetKey
    );

    if (hierarchicalFacet) {
      // Place the hierarchicalFacet data at the correct index depending on
      // the attributes order that was defined at the helper initialization
      const facetIndex = hierarchicalFacet.attributes.indexOf(facetKey);
      const idxAttributeName = findIndex(state.hierarchicalFacets, {
        name: hierarchicalFacet.name,
      });
      this.hierarchicalFacets[idxAttributeName][facetIndex] = {
        attribute: facetKey,
        data: facetValueObject,
        exhaustive: mainSubResponse.exhaustiveFacetsCount,
      };
    } else {
      const isFacetDisjunctive =
        indexOf(state.disjunctiveFacets, facetKey) !== -1;
      const isFacetConjunctive = indexOf(state.facets, facetKey) !== -1;
      let position;

      if (isFacetDisjunctive) {
        position = disjunctiveFacetsIndices[facetKey];
        this.disjunctiveFacets[position] = {
          name: facetKey,
          data: facetValueObject,
          exhaustive: mainSubResponse.exhaustiveFacetsCount,
        };
        assignFacetStats(
          this.disjunctiveFacets[position],
          mainSubResponse.facets_stats,
          facetKey
        );
      }
      if (isFacetConjunctive) {
        position = facetsIndices[facetKey];
        this.facets[position] = {
          name: facetKey,
          data: facetValueObject,
          exhaustive: mainSubResponse.exhaustiveFacetsCount,
        };
        assignFacetStats(
          this.facets[position],
          mainSubResponse.facets_stats,
          facetKey
        );
      }
    }
  });

  // Make sure we do not keep holes within the hierarchical facets
  this.hierarchicalFacets = compact(this.hierarchicalFacets);

  // aggregate the refined disjunctive facets
  forEach(disjunctiveFacets, disjunctiveFacet => {
    const result = results[nextDisjunctiveResult];
    const hierarchicalFacet = state.getHierarchicalFacetByName(
      disjunctiveFacet
    );

    // There should be only item in facets.
    forEach(result.facets, (facetResults, dfacet) => {
      let position;

      if (hierarchicalFacet) {
        position = findIndex(state.hierarchicalFacets, {
          name: hierarchicalFacet.name,
        });
        const attributeIndex = findIndex(this.hierarchicalFacets[position], {
          attribute: dfacet,
        });

        // previous refinements and no results so not able to find it
        if (attributeIndex === -1) {
          return;
        }

        this.hierarchicalFacets[position][attributeIndex].data = merge(
          {},
          this.hierarchicalFacets[position][attributeIndex].data,
          facetResults
        );
      } else {
        position = disjunctiveFacetsIndices[dfacet];

        const dataFromMainRequest =
          (mainSubResponse.facets && mainSubResponse.facets[dfacet]) || {};

        this.disjunctiveFacets[position] = {
          name: dfacet,
          data: defaults({}, facetResults, dataFromMainRequest),
          exhaustive: result.exhaustiveFacetsCount,
        };
        assignFacetStats(
          this.disjunctiveFacets[position],
          result.facets_stats,
          dfacet
        );

        if (state.disjunctiveFacetsRefinements[dfacet]) {
          forEach(
            state.disjunctiveFacetsRefinements[dfacet],
            refinementValue => {
              // add the disjunctive refinements if it is no more retrieved
              if (
                !this.disjunctiveFacets[position].data[refinementValue] &&
                indexOf(
                  state.disjunctiveFacetsRefinements[dfacet],
                  refinementValue
                ) > -1
              ) {
                this.disjunctiveFacets[position].data[refinementValue] = 0;
              }
            }
          );
        }
      }
    });
    nextDisjunctiveResult++;
  });

  // if we have some root level values for hierarchical facets, merge them
  forEach(state.getRefinedHierarchicalFacets(), refinedFacet => {
    const hierarchicalFacet = state.getHierarchicalFacetByName(refinedFacet);
    const separator = state._getHierarchicalFacetSeparator(hierarchicalFacet);

    const currentRefinement = state.getHierarchicalRefinement(refinedFacet);
    // if we are already at a root refinement (or no refinement at all), there is no
    // root level values request
    if (
      currentRefinement.length === 0 ||
      currentRefinement[0].split(separator).length < 2
    ) {
      return;
    }

    const result = results[nextDisjunctiveResult];

    forEach(result.facets, (facetResults, dfacet) => {
      const position = findIndex(state.hierarchicalFacets, {
        name: hierarchicalFacet.name,
      });
      const attributeIndex = findIndex(this.hierarchicalFacets[position], {
        attribute: dfacet,
      });

      // previous refinements and no results so not able to find it
      if (attributeIndex === -1) {
        return;
      }

      // when we always get root levels, if the hits refinement is `beers > IPA` (count: 5),
      // then the disjunctive values will be `beers` (count: 100),
      // but we do not want to display
      //   | beers (100)
      //     > IPA (5)
      // We want
      //   | beers (5)
      //     > IPA (5)
      const defaultData = {};

      if (currentRefinement.length > 0) {
        const root = currentRefinement[0].split(separator)[0];
        defaultData[root] = this.hierarchicalFacets[position][
          attributeIndex
        ].data[root];
      }

      this.hierarchicalFacets[position][attributeIndex].data = defaults(
        defaultData,
        facetResults,
        this.hierarchicalFacets[position][attributeIndex].data
      );
    });

    nextDisjunctiveResult++;
  });

  // add the excludes
  forEach(state.facetsExcludes, (excludes, facetName) => {
    const position = facetsIndices[facetName];

    this.facets[position] = {
      name: facetName,
      data: mainSubResponse.facets[facetName],
      exhaustive: mainSubResponse.exhaustiveFacetsCount,
    };
    forEach(excludes, facetValue => {
      this.facets[position] = this.facets[position] || { name: facetName };
      this.facets[position].data = this.facets[position].data || {};
      this.facets[position].data[facetValue] = 0;
    });
  });

  this.hierarchicalFacets = map(
    this.hierarchicalFacets,
    generateHierarchicalTree(state)
  );

  this.facets = compact(this.facets);
  this.disjunctiveFacets = compact(this.disjunctiveFacets);

  this._state = state;
}

/**
 * Get a facet object with its name
 * @deprecated
 * @param {string} name name of the faceted attribute
 * @return {SearchResults.Facet} the facet object
 */
SearchResults.prototype.getFacetByName = function(name) {
  const predicate = { name };

  return (
    find(this.facets, predicate) ||
    find(this.disjunctiveFacets, predicate) ||
    find(this.hierarchicalFacets, predicate)
  );
};

/**
 * Get the facet values of a specified attribute from a SearchResults object.
 * @private
 * @param {SearchResults} results the search results to search in
 * @param {string} attribute name of the faceted attribute to search for
 * @return {array|object} facet values. For the hierarchical facets it is an object.
 */
function extractNormalizedFacetValues(results, attribute) {
  const predicate = { name: attribute };
  if (results._state.isConjunctiveFacet(attribute)) {
    const facet = find(results.facets, predicate);
    if (!facet) return [];

    return map(facet.data, (v, k) => ({
      name: k,
      count: v,
      isRefined: results._state.isFacetRefined(attribute, k),
      isExcluded: results._state.isExcludeRefined(attribute, k),
    }));
  } else if (results._state.isDisjunctiveFacet(attribute)) {
    const disjunctiveFacet = find(results.disjunctiveFacets, predicate);
    if (!disjunctiveFacet) return [];

    return map(disjunctiveFacet.data, (v, k) => ({
      name: k,
      count: v,
      isRefined: results._state.isDisjunctiveFacetRefined(attribute, k),
    }));
  } else if (results._state.isHierarchicalFacet(attribute)) {
    return find(results.hierarchicalFacets, predicate);
  }
  return undefined;
}

/**
 * Sort nodes of a hierarchical facet results
 * @private
 * @param {HierarchicalFacet} node node to upon which we want to apply the sort
 */
function recSort(sortFn, node) {
  if (!node.data || node.data.length === 0) {
    return node;
  }
  const children = map(node.data, partial(recSort, sortFn));
  const sortedChildren = sortFn(children);
  const newNode = merge({}, node, { data: sortedChildren });
  return newNode;
}

SearchResults.DEFAULT_SORT = ['isRefined:desc', 'count:desc', 'name:asc'];

function vanillaSortFn(order, data) {
  return data.sort(order);
}

/**
 * Get a the list of values for a given facet attribute. Those values are sorted
 * refinement first, descending count (bigger value on top), and name ascending
 * (alphabetical order). The sort formula can overridden using either string based
 * predicates or a function.
 *
 * This method will return all the values returned by the Algolia engine plus all
 * the values already refined. This means that it can happen that the
 * `maxValuesPerFacet` [configuration](https://www.algolia.com/doc/rest-api/search#param-maxValuesPerFacet)
 * might not be respected if you have facet values that are already refined.
 * @param {string} attribute attribute name
 * @param {object} opts configuration options.
 * @param {Array.<string> | function} opts.sortBy
 * When using strings, it consists of
 * the name of the [FacetValue](#SearchResults.FacetValue) or the
 * [HierarchicalFacet](#SearchResults.HierarchicalFacet) attributes with the
 * order (`asc` or `desc`). For example to order the value by count, the
 * argument would be `['count:asc']`.
 *
 * If only the attribute name is specified, the ordering defaults to the one
 * specified in the default value for this attribute.
 *
 * When not specified, the order is
 * ascending.  This parameter can also be a function which takes two facet
 * values and should return a number, 0 if equal, 1 if the first argument is
 * bigger or -1 otherwise.
 *
 * The default value for this attribute `['isRefined:desc', 'count:desc', 'name:asc']`
 * @return {FacetValue[]|HierarchicalFacet} depending on the type of facet of
 * the attribute requested (hierarchical, disjunctive or conjunctive)
 * @example
 * helper.on('results', function(content){
 *   //get values ordered only by name ascending using the string predicate
 *   content.getFacetValues('city', {sortBy: ['name:asc']});
 *   //get values  ordered only by count ascending using a function
 *   content.getFacetValues('city', {
 *     // this is equivalent to ['count:asc']
 *     sortBy: function(a, b) {
 *       if (a.count === b.count) return 0;
 *       if (a.count > b.count)   return 1;
 *       if (b.count > a.count)   return -1;
 *     }
 *   });
 * });
 */
SearchResults.prototype.getFacetValues = function(attribute, opts) {
  const facetValues = extractNormalizedFacetValues(this, attribute);
  if (!facetValues) throw new Error(`${attribute} is not a retrieved facet.`);

  const options = defaults({}, opts, { sortBy: SearchResults.DEFAULT_SORT });

  if (isArray(options.sortBy)) {
    const order = formatSort(options.sortBy, SearchResults.DEFAULT_SORT);
    if (isArray(facetValues)) {
      return orderBy(facetValues, order[0], order[1]);
    }
    // If facetValues is not an array, it's an object thus a hierarchical facet object
    return recSort(partialRight(orderBy, order[0], order[1]), facetValues);
  } else if (isFunction(options.sortBy)) {
    if (isArray(facetValues)) {
      return facetValues.sort(options.sortBy);
    }
    // If facetValues is not an array, it's an object thus a hierarchical facet object
    return recSort(partial(vanillaSortFn, options.sortBy), facetValues);
  }
  throw new Error(
    'options.sortBy is optional but if defined it must be ' +
      'either an array of string (predicates) or a sorting function'
  );
};

/**
 * Returns the facet stats if attribute is defined and the facet contains some.
 * Otherwise returns undefined.
 * @param {string} attribute name of the faceted attribute
 * @return {object} The stats of the facet
 */
SearchResults.prototype.getFacetStats = function(attribute) {
  if (this._state.isConjunctiveFacet(attribute)) {
    return getFacetStatsIfAvailable(this.facets, attribute);
  } else if (this._state.isDisjunctiveFacet(attribute)) {
    return getFacetStatsIfAvailable(this.disjunctiveFacets, attribute);
  }

  throw new Error(
    `${attribute} is not present in \`facets\` or \`disjunctiveFacets\``
  );
};

function getFacetStatsIfAvailable(facetList, facetName) {
  const data = find(facetList, { name: facetName });
  return data && data.stats;
}

/**
 * Returns all refinements for all filters + tags. It also provides
 * additional information: count and exhausistivity for each filter.
 *
 * See the [refinement type](#Refinement) for an exhaustive view of the available
 * data.
 *
 * @return {Array.<Refinement>} all the refinements
 */
SearchResults.prototype.getRefinements = function() {
  const state = this._state;
  const res = [];

  forEach(state.facetsRefinements, (refinements, attributeName) => {
    forEach(refinements, name => {
      res.push(getRefinement(state, 'facet', attributeName, name, this.facets));
    });
  });

  forEach(state.facetsExcludes, (refinements, attributeName) => {
    forEach(refinements, name => {
      res.push(
        getRefinement(state, 'exclude', attributeName, name, this.facets)
      );
    });
  });

  forEach(state.disjunctiveFacetsRefinements, (refinements, attributeName) => {
    forEach(refinements, name => {
      res.push(
        getRefinement(
          state,
          'disjunctive',
          attributeName,
          name,
          this.disjunctiveFacets
        )
      );
    });
  });

  forEach(state.hierarchicalFacetsRefinements, (refinements, attributeName) => {
    forEach(refinements, name => {
      res.push(
        getHierarchicalRefinement(
          state,
          attributeName,
          name,
          this.hierarchicalFacets
        )
      );
    });
  });

  forEach(state.numericRefinements, (operators, attributeName) => {
    forEach(operators, (values, operator) => {
      forEach(values, value => {
        res.push({
          type: 'numeric',
          attributeName,
          name: value,
          numericValue: value,
          operator,
        });
      });
    });
  });

  forEach(state.tagRefinements, name => {
    res.push({ type: 'tag', attributeName: '_tags', name });
  });

  return res;
};

function getRefinement(state, type, attributeName, name, resultsFacets) {
  const facet = find(resultsFacets, { name: attributeName });
  const count = get(facet, `data[${name}]`);
  const exhaustive = get(facet, 'exhaustive');
  return {
    type,
    attributeName,
    name,
    count: count || 0,
    exhaustive: exhaustive || false,
  };
}

function getHierarchicalRefinement(state, attributeName, name, resultsFacets) {
  let facet = find(resultsFacets, { name: attributeName });
  const facetDeclaration = state.getHierarchicalFacetByName(attributeName);
  const splitted = name.split(facetDeclaration.separator);
  const configuredName = splitted[splitted.length - 1];
  for (let i = 0; facet !== undefined && i < splitted.length; ++i) {
    facet = find(facet.data, { name: splitted[i] });
  }
  const count = get(facet, 'count');
  const exhaustive = get(facet, 'exhaustive');
  return {
    type: 'hierarchical',
    attributeName,
    name: configuredName,
    count: count || 0,
    exhaustive: exhaustive || false,
  };
}

export default SearchResults;
