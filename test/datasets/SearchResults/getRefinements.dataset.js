if (require.main === module) {
  /*
   * This file generates the tests files so that the tests can be repeated offline.
   * To regenerate the files, just run it again.
   */

  const path = require('path');

  const replayTools = require('../../replayTools.js');
  const Helper = require('../../../src/algoliasearch.helper.js');
  const HelperSaver = replayTools.toSaver(
    Helper,
    path.join(__dirname.replace('datasets', 'spec'), 'getRefinements')
  );
  const algoliasearch = require('algoliasearch');

  const client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
  const helper = new HelperSaver(client, 'instant_search', {
    facets: ['brand'],
    disjunctiveFacets: ['type', 'rating'],
    hierarchicalFacets: [
      {
        name: 'hierarchicalCategories',
        attributes: [
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
          'hierarchicalCategories.lvl3',
        ],
      },
    ],
  });

  const initialState = helper.getState();

  helper
    .searchOnce()
    .then(() => {
      helper.__saveLastToFile('noFilters.json');

      const otherState = initialState.addFacetRefinement('brand', 'Apple');
      return helper.searchOnce(otherState);
    })
    .then(() => {
      helper.__saveLastToFile('conjunctive-brand-apple.json');

      const otherState = initialState.addDisjunctiveFacetRefinement(
        'type',
        'Trend cases'
      );
      return helper.searchOnce(otherState);
    })
    .then(() => {
      helper.__saveLastToFile('disjunctive-type-trendcase.json');

      const otherState = initialState.addNumericRefinement('rating', '=', 3);
      return helper.searchOnce(otherState);
    })
    .then(() => {
      helper.__saveLastToFile('numeric-rating-3.json');

      const otherState = initialState.toggleHierarchicalFacetRefinement(
        'hierarchicalCategories',
        'Best Buy Gift Cards > Entertainment Gift Cards'
      );
      return helper.searchOnce(otherState);
    })
    .then(() => {
      helper.__saveLastToFile('hierarchical-cards.json');

      const otherState = initialState
        .addTagRefinement('foo')
        .addTagRefinement('bar');
      return helper.searchOnce(otherState);
    })
    .then(() => {
      helper.__saveLastToFile('dummy-tags.json');

      const otherState = initialState.addExcludeRefinement('brand', 'Apple');
      return helper.searchOnce(otherState);
    })
    .then(() => {
      helper.__saveLastToFile('exclude-apple.json');
    })
    .then(
      () => {
        console.log('Dataset sucessfully generated');
      },
      e => {
        console.error(e);
      }
    );
}
