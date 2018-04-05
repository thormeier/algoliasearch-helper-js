const utils = require('../integration-utils.js');
const setup = utils.setupSimple;

const algoliasearchHelper = utils.isCIBrowser
  ? window.algoliasearchHelper
  : require('../../');

let test = require('tape');
const random = require('lodash/random');

if (!utils.shouldRun) {
  test = test.skip;
}
const indexName = `_travis-algoliasearch-helper-js-${process.env
  .TRAVIS_BUILD_NUMBER || 'DEV'}helper_searchonce${random(0, 5000)}`;

const dataset = [
  { objectID: '1', _geoloc: { lat: 1, lng: 1 } },
  { objectID: '2', _geoloc: { lat: 1, lng: 2 } },
  { objectID: '3', _geoloc: { lat: 2, lng: 1 } },
  { objectID: '4', _geoloc: { lat: 2, lng: 2 } },
];

const config = {};

test('[INT][GEO-SEARCH] search inside a single polygon with a string', t => {
  setup(indexName, dataset, config).then(client => {
    const helper = algoliasearchHelper(client, indexName, {});
    helper.on('result', content => {
      t.equal(content.hits.length, 1);
      t.equal(content.hits[0].objectID, '1');
      t.end();
    });

    helper
      .setQueryParameter('insidePolygon', '0,0,1.1,0,1.1,1.1,0,1.1')
      .search();
  });
});

test('[INT][GEO-SEARCH] search inside a single polygon with an array', t => {
  setup(indexName, dataset, config).then(client => {
    const helper = algoliasearchHelper(client, indexName, {});
    helper.on('result', content => {
      t.equal(content.hits.length, 1);
      t.equal(content.hits[0].objectID, '1');
      t.end();
    });

    helper
      .setQueryParameter('insidePolygon', [[0, 0, 1.1, 0, 1.1, 1.1, 0, 1.1]])
      .search();
  });
});

test('[INT][GEO-SEARCH] search inside two polygons with an array', t => {
  setup(indexName, dataset, config).then(client => {
    const helper = algoliasearchHelper(client, indexName, {});

    helper.on('result', content => {
      t.equal(content.hits.length, 2);
      const sortedHits = content.hits.sort((a, b) =>
        a.objectID.localeCompare(b.objectID)
      );
      t.equal(sortedHits[0].objectID, '1');
      t.equal(sortedHits[1].objectID, '4');
      t.end();
    });

    helper
      .setQueryParameter('insidePolygon', [
        [0, 0, 1.1, 0, 1.1, 1.1, 0, 1.1],
        [1.5, 1.5, 2.1, 1.5, 2.1, 2.1, 1.5, 2.1],
      ])
      .search();
  });
});
