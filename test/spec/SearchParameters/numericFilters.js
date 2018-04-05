const test = require('tape');
const SearchParameters = require('../../../src/SearchParameters');

const attribute = 'attribute';
const operator = '=';

/* Ensure that we add and then remove the same value, and get a state equivalent to the initial one */
function testSameValue(t, value) {
  const state0 = new SearchParameters();
  const state1 = state0.addNumericRefinement(attribute, operator, value);
  t.ok(
    state1.isNumericRefined(attribute, operator, value),
    'Numeric value should be added'
  );
  const state2 = state1.removeNumericRefinement(attribute, operator, value);
  t.notOk(
    state2.isNumericRefined(attribute, operator, value),
    'Numeric value should not be refined anymore'
  );
  t.deepEqual(
    state2,
    state0,
    'The final state should be equivalent to the first one'
  );
}

test('Should be able to add remove strings', t => {
  testSameValue(t, '40');
  t.end();
});

test('Should be able to add remove numbers', t => {
  testSameValue(t, 40);
  t.end();
});

test('Should be able to add remove arrays', t => {
  testSameValue(t, [40, '30']);
  t.end();
});
