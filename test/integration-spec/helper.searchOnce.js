const utils = require('../integration-utils.js');
const setup = utils.setup;

const algoliasearchHelper = utils.isCIBrowser
  ? window.algoliasearchHelper
  : require('../../');

let test = require('tape');
const find = require('lodash/find');
const bind = require('lodash/bind');
const random = require('lodash/random');

if (!utils.shouldRun) {
  test = test.skip;
}
const indexName = `_travis-algoliasearch-helper-js-${process.env
  .TRAVIS_BUILD_NUMBER || 'DEV'}helper_searchonce${random(0, 5000)}`;

test('[INT][SEARCHONCE] Should be able to search once with custom parameters without changing main search state', t => {
  setup(indexName, (client, index) =>
    index
      .addObjects([
        { objectID: '1', facet: ['f1', 'f2'] },
        { objectID: '2', facet: ['f1', 'f3'] },
        { objectID: '3', facet: ['f2', 'f3'] },
      ])
      .then(() =>
        index.setSettings({
          attributesToIndex: ['facet'],
          attributesForFaceting: ['facet'],
        })
      )
      .then(content => index.waitTask(content.taskID))
      .then(() => client)
  )
    .then(client => {
      const helper = algoliasearchHelper(client, indexName);
      const state0 = helper.state;

      let calls = 1;
      helper.on('error', err => {
        t.fail(err);
        t.end();
      });

      helper.on('result', content => {
        if (calls === 3) {
          t.equal(content.hits.length, 3, 'results should contain two items');
          t.end();
        } else {
          t.fail('Should not trigger the result event until the third call');
        }
      });

      const state1 = state0
        .setFacets(['facet'])
        .addFacetRefinement('facet', 'f1');
      helper.searchOnce(state1).then(res => {
        t.equal(helper.state, state0, 'initial state must not be modified');
        t.deepEqual(res.state, state1);
        t.equal(res.content.hits.length, 2, 'results should contain two items');
        t.ok(find(res.content.hits, { objectID: '2' }));
        t.ok(find(res.content.hits, { objectID: '1' }));
        calls++;
        const state2 = state0
          .setFacets(['facet'])
          .addFacetRefinement('facet', 'f2');
        helper.searchOnce(state2, (err, c, s) => {
          t.equal(err, null);
          t.equal(helper.state, state0, 'initial state should not be modified');
          t.deepEqual(s, state2);
          t.equal(c.hits.length, 2, 'results should contain two items');
          t.ok(find(c.hits, { objectID: '1' }));
          t.ok(find(c.hits, { objectID: '3' }));
          calls++;
          helper.search();
        });
      });
    })
    .then(null, bind(t.error, t));
});
