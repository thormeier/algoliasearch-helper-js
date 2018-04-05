const test = require('tape');
const algoliasearchHelper = require('../../../index');

const fakeClient = {
  addAlgoliaAgent() {},
};

test('setChange should change the current state', t => {
  const helper = algoliasearchHelper(fakeClient, null, null);
  let changed = false;

  helper.on('change', () => {
    changed = true;
  });

  t.equal(helper.getCurrentPage(), 0, 'Initially page is 0');
  t.notOk(changed, 'No changes called yet');
  helper.setQueryParameter('page', 22);
  t.equal(helper.getCurrentPage(), 22, 'After setting the page is 22');
  t.ok(changed, 'Change event should have been triggered');

  t.end();
});

test('setChange should not change the current state: no real modification', t => {
  const helper = algoliasearchHelper(fakeClient, null, null);
  let changed = false;
  const initialState = helper.state;

  helper.on('change', () => {
    changed = true;
  });

  t.equal(helper.getCurrentPage(), 0, 'Initially page is 0');
  t.notOk(changed, 'No changes called yet');
  helper.setQueryParameter('page', 0);
  t.equal(helper.getCurrentPage(), 0, 'After setting the page is 0');
  t.notOk(changed, 'Change event should not have been triggered');
  t.equal(
    helper.state,
    initialState,
    'The state instance should remain the same'
  );

  t.end();
});
