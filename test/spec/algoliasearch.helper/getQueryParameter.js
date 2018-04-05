const test = require('tape');
const algoliaSearchHelper = require('../../../index.js');

const fakeClient = {
  addAlgoliaAgent() {},
};

test('getQueryParameter', t => {
  const bind = require('lodash/bind');

  const helper = algoliaSearchHelper(fakeClient, null, {
    facets: ['facet1'],
    minWordSizefor1Typo: 8,
    ignorePlurals: true,
  });

  t.deepEqual(helper.getQueryParameter('facets'), ['facet1']);
  t.equal(helper.getQueryParameter('minWordSizefor1Typo'), 8);
  t.equal(helper.getQueryParameter('ignorePlurals'), true);

  t.throws(bind(helper.getQueryParameter, helper, 'unknown'));

  t.end();
});
