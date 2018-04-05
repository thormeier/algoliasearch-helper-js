const test = require('tape');

const RefinementList = require('../../../../src/SearchParameters/RefinementList.js');
const clear = RefinementList.clearRefinement;

test('When removing all refinements of a state without any', t => {
  const initialRefinementList = {};
  t.equal(
    clear(initialRefinementList),
    initialRefinementList,
    'it should return the same ref'
  );
  t.end();
});

test('When removing refinements of a specific attribute, and there are no refinements for this attribute', t => {
  const initialRefinementList = {
    attribute: ['test'],
  };

  t.equal(
    clear(initialRefinementList, 'notThisAttribute'),
    initialRefinementList,
    'it should return the same ref'
  );
  t.end();
});

test('When removing numericRefinements using a function, and there are no changes', t => {
  const initialRefinementList = {
    attribute: ['test'],
  };

  function clearNothing() {
    return false;
  }
  function clearUndefinedAttribute(value, attribute) {
    return attribute === 'category';
  }
  function clearUndefinedValue(value) {
    return value === 'toast';
  }

  t.equal(
    clear(initialRefinementList, clearNothing, 'facet'),
    initialRefinementList,
    'it should return the same ref - nothing'
  );
  t.equal(
    clear(initialRefinementList, clearUndefinedAttribute, 'facet'),
    initialRefinementList,
    'it should return the same ref - undefined attribute'
  );
  t.equal(
    clear(initialRefinementList, clearUndefinedValue, 'facet'),
    initialRefinementList,
    'it should return the same ref - undefined value'
  );

  t.end();
});
