const test = require('tape');

test('hierarchical facets: throw on unknown facet', t => {
  const bind = require('lodash/bind');
  const algoliasearch = require('algoliasearch');

  const algoliasearchHelper = require('../../../');

  const appId = 'hierarchical-throw-appId';
  const apiKey = 'hierarchical-throw-apiKey';
  const indexName = 'hierarchical-throw-indexName';

  const client = algoliasearch(appId, apiKey);
  const helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: ['categories.lvl0'],
      },
    ],
  });

  t.throws(
    bind(helper.toggleRefine, helper, 'unknownFacet', 'beers'),
    'Refine on an unknown hierarchical facet throws'
  );

  t.end();
});
