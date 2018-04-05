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
    path.join(__dirname.replace('datasets', 'spec'), 'getFacetValues')
  );
  const algoliasearch = require('algoliasearch');

  const client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
  const helper = new HelperSaver(client, 'instant_search', {
    disjunctiveFacets: ['brand'],
    maxValuesPerFacet: 3,
  });

  const initialState = helper.getState();

  helper
    .searchOnce()
    .then(() => {
      helper.__saveLastToFile('noFilters.json');

      const otherState = initialState.addDisjunctiveFacetRefinement(
        'brand',
        'Apple'
      );
      return helper.searchOnce(otherState);
    })
    .then(() => {
      helper.__saveLastToFile('disjunctive.json');
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
