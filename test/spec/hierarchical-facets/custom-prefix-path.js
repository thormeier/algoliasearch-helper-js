const test = require('tape');

test('hierarchical facets: custom prefix path', t => {
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
        name: 'categories',
        attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2'],
        rootPath: 'beers',
        separator: ' | ',
      },
    ],
  });

  helper.toggleRefine('categories', 'beers | Belgian');

  const algoliaResponse = {
    results: [
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }, { objectID: 'two' }],
        nbHits: 2,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        facets: {
          'categories.lvl0': { beers: 3 },
          'categories.lvl1': { 'beers | IPA': 2, 'beers | Belgian': 1 },
          'categories.lvl2': {
            'beers | Belgian | Blond': 2,
            'beers | Belgian | Dark': 1,
          },
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
          'categories.lvl0': { beers: 3 },
          'categories.lvl1': { 'beers | IPA': 2, 'beers | Belgian': 1 },
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
          'categories.lvl1': { 'beers | IPA': 2, 'beers | Belgian': 1 },
        },
      },
    ],
  };

  const expectedHelperResponse = [
    {
      name: 'categories',
      count: null,
      isRefined: true,
      path: null,
      data: [
        {
          name: 'Belgian',
          path: 'beers | Belgian',
          count: 1,
          isRefined: true,
          data: [
            {
              name: 'Blond',
              path: 'beers | Belgian | Blond',
              count: 2,
              isRefined: false,
              data: null,
            },
            {
              name: 'Dark',
              path: 'beers | Belgian | Dark',
              count: 1,
              isRefined: false,
              data: null,
            },
          ],
        },
        {
          name: 'IPA',
          path: 'beers | IPA',
          count: 2,
          isRefined: false,
          data: null,
        },
      ],
    },
  ];

  client.search = sinon.stub().resolves(algoliaResponse);

  helper.setQuery('a').search();
  helper.once('result', content => {
    t.ok(client.search.calledOnce, 'client.search was called once');
    t.deepEqual(content.hierarchicalFacets, expectedHelperResponse);
    t.end();
  });
});
