const utils = require('../integration-utils.js');
const setup = utils.setupSimple;

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
  .TRAVIS_BUILD_NUMBER || 'DEV'}helper_sffv${random(0, 5000)}`;

const dataset = [
  { objectID: '1', f: 'ba', f2: ['b'] },
  { objectID: '2', f: 'ba', f2: ['c', 'x'] },
  { objectID: '3', f: 'ba', f2: ['d'] },
  { objectID: '4', f: 'bb', f2: ['b'] },
  { objectID: '5', f: 'bb', f2: ['c', 'y'] },
];

const config = {
  attributesForFaceting: ['searchable(f)', 'searchable(f2)'],
};

test('[INT][SEARCHFORCETVALUES] Should be able to search for facet values - conjunctive', t => {
  setup(indexName, dataset, config)
    .then(client => {
      const helper = algoliasearchHelper(client, indexName, {
        facets: ['f', 'f2'],
      });

      helper
        .searchForFacetValues('f', 'a')
        .then(content => {
          t.ok(content, 'should get some content');
          t.equal(content.facetHits.length, 0, 'should get 0 results');

          return helper.searchForFacetValues('f', 'b');
        })
        .then(content => {
          t.ok(content, 'should get some content');

          t.deepEqual(content.facetHits, [
            {
              value: 'ba',
              highlighted: '<em>b</em>a',
              count: 3,
              isRefined: false,
            },
            {
              value: 'bb',
              highlighted: '<em>b</em>b',
              count: 2,
              isRefined: false,
            },
          ]);

          helper.addFacetRefinement('f2', 'c');
          return helper.searchForFacetValues('f', 'b');
        })
        .then(content => {
          t.ok(content, 'should get some content');

          t.deepEqual(content.facetHits, [
            {
              value: 'ba',
              highlighted: '<em>b</em>a',
              count: 1,
              isRefined: false,
            },
            {
              value: 'bb',
              highlighted: '<em>b</em>b',
              count: 1,
              isRefined: false,
            },
          ]);

          helper.clearRefinements().addFacetRefinement('f2', 'c');
          return helper.searchForFacetValues('f2', '');
        })
        .then(content => {
          t.ok(content, 'should get some content');

          t.deepEqual(content.facetHits, [
            { value: 'c', highlighted: 'c', count: 2, isRefined: true },
            { value: 'x', highlighted: 'x', count: 1, isRefined: false },
            { value: 'y', highlighted: 'y', count: 1, isRefined: false },
          ]);

          t.end();
        })
        .catch(err => {
          setTimeout(() => {
            throw err;
          }, 1);
        });
    })
    .then(null, bind(t.error, t));
});

test('[INT][SEARCHFORCETVALUES] Should be able to search for facet values - disjunctive', t => {
  setup(indexName, dataset, config)
    .then(client => {
      const helper = algoliasearchHelper(client, indexName, {
        disjunctiveFacets: ['f', 'f2'],
      });

      helper
        .searchForFacetValues('f', 'a')
        .then(content => {
          t.ok(content, 'should get some content');
          t.equal(content.facetHits.length, 0, 'should get 0 results');

          return helper.searchForFacetValues('f', 'b');
        })
        .then(content => {
          t.ok(content, 'should get some content');

          t.deepEqual(content.facetHits, [
            {
              value: 'ba',
              highlighted: '<em>b</em>a',
              count: 3,
              isRefined: false,
            },
            {
              value: 'bb',
              highlighted: '<em>b</em>b',
              count: 2,
              isRefined: false,
            },
          ]);

          helper.addDisjunctiveFacetRefinement('f2', 'd');
          return helper.searchForFacetValues('f', 'b');
        })
        .then(content => {
          t.ok(content, 'should get some content');

          t.deepEqual(content.facetHits, [
            {
              value: 'ba',
              highlighted: '<em>b</em>a',
              count: 1,
              isRefined: false,
            },
          ]);

          helper.clearRefinements().addDisjunctiveFacetRefinement('f2', 'c');
          return helper.searchForFacetValues('f2', '');
        })
        .then(content => {
          t.ok(content, 'should get some content');

          t.deepEqual(content.facetHits, [
            { value: 'b', highlighted: 'b', count: 2, isRefined: false },
            { value: 'c', highlighted: 'c', count: 2, isRefined: true },
            { value: 'd', highlighted: 'd', count: 1, isRefined: false },
            { value: 'x', highlighted: 'x', count: 1, isRefined: false },
            { value: 'y', highlighted: 'y', count: 1, isRefined: false },
          ]);

          t.end();
        })
        .catch(err => {
          setTimeout(() => {
            throw err;
          }, 1);
        });
    })
    .then(null, bind(t.error, t));
});

test('[INT][SEARCHFORCETVALUES] Should be able to limit the number of returned items', t => {
  setup(indexName, dataset, config)
    .then(client => {
      const helper = algoliasearchHelper(client, indexName, {
        facets: ['f', 'f2'],
      });

      helper
        .searchForFacetValues('f', 'b', 1)
        .then(content => {
          t.ok(content.facetHits.length, 'should get one value');

          t.deepEqual(content.facetHits, [
            {
              value: 'ba',
              highlighted: '<em>b</em>a',
              count: 3,
              isRefined: false,
            },
          ]);

          t.end();
        })
        .catch(err => {
          setTimeout(() => {
            throw err;
          }, 1);
        });
    })
    .then(null, bind(t.error, t));
});
