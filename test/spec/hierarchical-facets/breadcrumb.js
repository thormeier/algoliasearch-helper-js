const test = require('tape');

test('hierarchical facets: using getHierarchicalFacetBreadcrumb()', t => {
  const algoliasearch = require('algoliasearch');

  const algoliasearchHelper = require('../../../');

  const appId = 'hierarchical-simple-appId';
  const apiKey = 'hierarchical-simple-apiKey';
  const indexName = 'hierarchical-simple-indexName';

  const client = algoliasearch(appId, apiKey);
  const helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: [
          'categories.lvl0',
          'categories.lvl1',
          'categories.lvl2',
          'categories.lvl3',
        ],
      },
    ],
  });

  helper.toggleRefine('categories', 'beers > IPA > Flying dog');

  t.deepEqual(
    helper.getHierarchicalFacetBreadcrumb('categories'),
    ['beers', 'IPA', 'Flying dog'],
    'we get the hierarchical facet `categories` breadcrumb as an array'
  );

  t.end();
});

test('hierarchical facets: using getHierarchicalFacetBreadcrumb before the first refinement', t => {
  const algoliasearch = require('algoliasearch');

  const algoliasearchHelper = require('../../../');

  const appId = 'hierarchical-simple-appId';
  const apiKey = 'hierarchical-simple-apiKey';
  const indexName = 'hierarchical-simple-indexName';

  const client = algoliasearch(appId, apiKey);
  const helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: [
          'categories.lvl0',
          'categories.lvl1',
          'categories.lvl2',
          'categories.lvl3',
        ],
      },
    ],
  });

  t.deepEqual(
    helper.getHierarchicalFacetBreadcrumb('categories'),
    [],
    'we get an empty array'
  );

  t.end();
});

test('hierarchical facets: using getHierarchicalFacetBreadcrumb on an undefined facet', t => {
  const algoliasearch = require('algoliasearch');

  const algoliasearchHelper = require('../../../');

  const appId = 'hierarchical-simple-appId';
  const apiKey = 'hierarchical-simple-apiKey';
  const indexName = 'hierarchical-simple-indexName';

  const client = algoliasearch(appId, apiKey);
  const helper = algoliasearchHelper(client, indexName, {});

  t.throws(
    helper.getHierarchicalFacetBreadcrumb.bind('categories'),
    'we get an exception if the facet is not defined'
  );

  t.end();
});
