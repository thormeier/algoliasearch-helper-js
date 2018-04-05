const test = require('tape');
const sinon = require('sinon');
const algoliaSearch = require('algoliasearch');

const algoliasearchHelper = require('../../index');

test('Search should call the algolia client according to the number of refinements', t => {
  const testData = require('./search.testdata.js')();

  const client = algoliaSearch('dsf', 'dsfdf');
  const mock = sinon.mock(client);

  mock
    .expects('search')
    .once()
    .resolves(testData.response);

  const helper = algoliasearchHelper(client, 'test_hotels-node', {
    disjunctiveFacets: ['city'],
  });

  helper.addDisjunctiveRefine('city', 'Paris', true);
  helper.addDisjunctiveRefine('city', 'New York', true);

  helper.on('result', data => {
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

  helper.search('');
});

test('no mutating methods should trigger a search', t => {
  const client = algoliaSearch('dsf', 'dsfdf');
  sinon.mock(client);

  const helper = algoliasearchHelper(client, 'Index', {
    disjunctiveFacets: ['city'],
    facets: ['tower'],
  });

  const stubbedSearch = sinon.stub(helper, '_search');

  helper.setQuery('');
  helper.clearRefinements();
  helper.addDisjunctiveRefine('city', 'Paris');
  helper.removeDisjunctiveRefine('city', 'Paris');
  helper.addExclude('tower', 'Empire State Building');
  helper.removeExclude('tower', 'Empire State Building');
  helper.addRefine('tower', 'Empire State Building');
  helper.removeRefine('tower', 'Empire State Building');

  t.equal(stubbedSearch.callCount, 0, 'should not have triggered calls');

  helper.search();

  t.equal(stubbedSearch.callCount, 1, 'should have triggered a single search');

  t.end();
});
