const test = require('tape');

test('hierarchical facets: two hierarchical facets', t => {
  const algoliasearch = require('algoliasearch');
  const sinon = require('sinon');

  const algoliasearchHelper = require('../../../');

  const appId = 'hierarchical-simple-appId';
  const apiKey = 'hierarchical-simple-apiKey';
  const indexName = 'hierarchical-simple-indexName';

  const client = algoliasearch(appId, apiKey);
  const helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [
      {
        name: 'beers',
        attributes: ['beers.lvl0'],
      },
      {
        name: 'fruits',
        attributes: ['fruits.lvl0'],
      },
    ],
  });

  helper.toggleRefine('beers', 'IPA');
  helper.toggleRefine('fruits', 'oranges');

  const algoliaResponse = {
    results: [
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 7,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        facets: {
          'beers.lvl0': { IPA: 2 },
          'fruits.lvl0': { oranges: 5 },
        },
      },
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 1,
        facets: {
          'beers.lvl0': { IPA: 2, Belgian: 3 },
        },
      },
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 1,
        facets: {
          'fruits.lvl0': { oranges: 5, apples: 4 },
        },
      },
    ],
  };

  const expectedHelperResponse = [
    {
      name: 'beers',
      count: null,
      isRefined: true,
      path: null,
      data: [
        {
          name: 'IPA',
          path: 'IPA',
          count: 2,
          isRefined: true,
          data: null,
        },
        {
          name: 'Belgian',
          path: 'Belgian',
          count: 3,
          isRefined: false,
          data: null,
        },
      ],
    },
    {
      name: 'fruits',
      path: null,
      count: null,
      isRefined: true,
      data: [
        {
          name: 'oranges',
          path: 'oranges',
          count: 5,
          isRefined: true,
          data: null,
        },
        {
          name: 'apples',
          path: 'apples',
          count: 4,
          isRefined: false,
          data: null,
        },
      ],
    },
  ];

  client.search = sinon.stub().resolves(algoliaResponse);

  helper.setQuery('a').search();
  helper.once('result', content => {
    t.deepEqual(content.hierarchicalFacets, expectedHelperResponse);
    t.end();
  });
});
