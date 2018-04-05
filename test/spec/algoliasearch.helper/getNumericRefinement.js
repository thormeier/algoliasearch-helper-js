const test = require('tape');
const algoliaSearchHelper = require('../../../index.js');

const fakeClient = {
  addAlgoliaAgent() {},
};

test('getNumericRefinement with single value addNumericRefinement', t => {
  const helper = algoliaSearchHelper(fakeClient, null);

  helper.addNumericRefinement('attribute', '=', 0);
  helper.addNumericRefinement('attribute', '=', 34);

  t.deepEqual(helper.getNumericRefinement('attribute', '='), [0, 34]);

  t.end();
});

test('getNumericRefinement with multiple values addNumericRefinement', t => {
  const helper = algoliaSearchHelper(fakeClient, null);

  helper.addNumericRefinement('attribute', '=', [0, 34]);

  t.deepEqual(helper.getNumericRefinement('attribute', '='), [[0, 34]]);

  t.end();
});
