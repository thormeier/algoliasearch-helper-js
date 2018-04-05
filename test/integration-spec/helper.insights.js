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

const dataset = [{ objectID: '1', name: 'TestName' }];

const config = {};

test('[INT][INSIGHTS] search with clickAnalytics should have a queryID', t => {
  setup(indexName, dataset, config).then(client => {
    const helper = algoliasearchHelper(client, indexName, {
      clickAnalytics: true,
    });
    helper.on('result', content => {
      t.equal(typeof content.queryID, 'string');
      t.end();
    });

    helper.search();
  });
});

test('[INT][INSIGHTS] search without clickAnalytics should not have a queryID', t => {
  setup(indexName, dataset, config).then(client => {
    const helper = algoliasearchHelper(client, indexName, {});
    helper.on('result', content => {
      t.equal(content.queryID, undefined);
      t.end();
    });

    helper.search();
  });
});
