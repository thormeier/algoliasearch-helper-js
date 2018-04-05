const test = require('tape');
const SearchResults = require('../../../src/SearchResults');

test('getFacetByName should return a given facet be it disjunctive or conjunctive', t => {
  const data = require('../search.testdata')();

  const result = new SearchResults(data.searchParams, data.response.results);

  const cityFacet = result.getFacetByName('city');

  t.equal(cityFacet.name, 'city', 'name');
  t.deepEqual(
    cityFacet.data,
    {
      'New York': 1,
      Paris: 3,
      'San Francisco': 1,
    },
    'values'
  );

  t.end();
});
