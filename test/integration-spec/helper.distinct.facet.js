const utils = require('../integration-utils.js');
const setup = utils.setup;

const algoliasearchHelper = utils.isCIBrowser
  ? window.algoliasearchHelper
  : require('../../');

let test = require('tape');
const bind = require('lodash/bind');
const random = require('lodash/random');

if (!utils.shouldRun) {
  test = test.skip;
}

test('[INT][FILTERS] Using distinct should let me retrieve all facet without distinct', t => {
  const indexName = `_travis-algoliasearch-helper-js-${process.env
    .TRAVIS_BUILD_NUMBER || 'DEV'}helper_distinct.facet${random(0, 5000)}`;

  setup(indexName, (client, index) =>
    index
      .addObjects([
        { type: 'shoes', name: 'Adidas Stan Smith', colors: ['blue', 'red'] },
        {
          type: 'shoes',
          name: 'Converse Chuck Taylor',
          colors: ['blue', 'green'],
        },
        { type: 'shoes', name: 'Nike Air Jordan', colors: ['gold', 'red'] },
      ])
      .then(() =>
        index.setSettings({
          attributesToIndex: ['type', 'colors', 'name'],
          attributeForDistinct: 'type',
          attributesForFaceting: ['type', 'colors'],
        })
      )
      .then(content => index.waitTask(content.taskID))
      .then(() => client)
  )
    .then(client => {
      const helper = algoliasearchHelper(client, indexName, {
        facets: ['colors'],
      });

      let calls = 0;
      helper.on('error', err => {
        t.fail(err);
        t.end();
      });
      helper.on('result', content => {
        calls++;

        if (calls === 1) {
          t.equal(content.hits.length, 1);
          t.deepEqual(content.facets[0].data, {
            blue: 2,
            red: 2,
            gold: 1,
            green: 1,
          });
          client.deleteIndex(indexName);
          if (!process.browser) {
            client.destroy();
          }
          t.end();
        }
      });

      helper.setQueryParameter('distinct', true).search();
    })
    .then(null, bind(t.error, t));
});
