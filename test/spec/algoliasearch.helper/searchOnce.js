const test = require('tape');
const sinon = require('sinon');
const algoliaSearch = require('algoliasearch');
const SearchParameters = require('../../../src/SearchParameters');

const algoliasearchHelper = require('../../../index');

test('searchOnce should call the algolia client according to the number of refinements and call callback with no error and with results when no error', t => {
  const testData = require('../search.testdata')();

  const client = algoliaSearch('dsf', 'dsfdf');
  const mock = sinon.mock(client);

  mock
    .expects('search')
    .once()
    .resolves(testData.response);

  const helper = algoliasearchHelper(client, 'test_hotels-node');

  const parameters = new SearchParameters({
    disjunctiveFacets: ['city'],
  })
    .setIndex('test_hotels-node')
    .addDisjunctiveFacetRefinement('city', 'Paris')
    .addDisjunctiveFacetRefinement('city', 'New York');

  helper.searchOnce(parameters, (err, data) => {
    t.equal(err, null, 'should be equal');

    // shame deepclone, to remove any associated methods coming from the results
    t.deepEqual(
      JSON.parse(JSON.stringify(data)),
      JSON.parse(JSON.stringify(testData.responseHelper)),
      'should be equal'
    );

    const cityValues = data.getFacetValues('city');
    const expectedCityValues = [
      { name: 'Paris', count: 3, isRefined: true },
      { name: 'New York', count: 1, isRefined: true },
      { name: 'San Francisco', count: 1, isRefined: false },
    ];

    t.deepEqual(
      cityValues,
      expectedCityValues,
      'Facet values for "city" should be correctly ordered using the default sort'
    );

    const cityValuesCustom = data.getFacetValues('city', {
      sortBy: ['count:asc', 'name:asc'],
    });
    const expectedCityValuesCustom = [
      { name: 'New York', count: 1, isRefined: true },
      { name: 'San Francisco', count: 1, isRefined: false },
      { name: 'Paris', count: 3, isRefined: true },
    ];

    t.deepEqual(
      cityValuesCustom,
      expectedCityValuesCustom,
      'Facet values for "city" should be correctly ordered using a custom sort'
    );

    const cityValuesFn = data.getFacetValues('city', {
      sortBy(a, b) {
        return a.count - b.count;
      },
    });
    const expectedCityValuesFn = [
      { name: 'New York', count: 1, isRefined: true },
      { name: 'San Francisco', count: 1, isRefined: false },
      { name: 'Paris', count: 3, isRefined: true },
    ];

    t.deepEqual(
      cityValuesFn,
      expectedCityValuesFn,
      'Facet values for "city" should be correctly ordered using a sort function'
    );

    const queries = mock.expectations.search[0].args[0][0];
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      t.equal(query.query, undefined);
      t.equal(query.params.query, '');
    }
    t.ok(mock.verify(), 'Mock constraints should be verified!');

    t.end();
  });
});

test('searchOnce should call the algolia client according to the number of refinements and call callback with error and no results when error', t => {
  const client = algoliaSearch('dsf', 'dsfdf');
  const mock = sinon.mock(client);

  const error = { message: 'error' };
  mock
    .expects('search')
    .once()
    .rejects(error);

  const helper = algoliasearchHelper(client, 'test_hotels-node');

  const parameters = new SearchParameters({
    disjunctiveFacets: ['city'],
  })
    .setIndex('test_hotels-node')
    .addDisjunctiveFacetRefinement('city', 'Paris')
    .addDisjunctiveFacetRefinement('city', 'New York');

  helper.searchOnce(parameters, (err, data) => {
    t.equal(err, error, 'should be equal');
    t.equal(data, null, 'should be equal');

    const queries = mock.expectations.search[0].args[0][0];
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      t.equal(query.query, undefined);
      t.equal(query.params.query, '');
    }
    t.ok(mock.verify(), 'Mock constraints should be verified!');

    t.end();
  });
});
