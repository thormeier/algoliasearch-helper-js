const utils = require('../integration-utils.js');
const setup = utils.setup;

const algoliasearchHelper = utils.isCIBrowser
  ? window.algoliasearchHelper
  : require('../../');

let test = require('tape');
const bind = require('lodash/bind');
const random = require('lodash/random');

if (!utils.shouldRun) {
  test = test.skip;
}
const indexName = `_travis-algoliasearch-helper-js-${process.env
  .TRAVIS_BUILD_NUMBER || 'DEV'}helper_searchonce${random(0, 5000)}`;

test('[INT][GETFACETVALUES] When the results are empty, getFacetValues should not crash', t => {
  setup(indexName, client => client)
    .then(client => {
      const helper = algoliasearchHelper(client, indexName, {
        facets: ['f'],
        disjunctiveFacets: ['df'],
        hierarchicalFacets: [
          {
            name: 'products',
            attributes: ['categories.lvl0', 'categories.lvl1'],
          },
        ],
      });
      helper.on('result', rs => {
        t.deepEqual(rs.getFacetValues('f'), [], '');
        t.deepEqual(rs.getFacetValues('df'), [], '');
        t.deepEqual(
          rs.getFacetValues('products'),
          {
            count: null,
            data: null,
            isRefined: true,
            name: 'products',
            path: null,
          },
          ''
        );
        t.end();
      });
      helper.search();
    })
    .then(null, bind(t.error, t));
});
