const test = require('tape');
const algoliasearchHelper = require('../../../index');

const fakeClient = {
  addAlgoliaAgent() {},
};

test('addExclude should add an exclusion', t => {
  const helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facet'],
  });

  helper._search = function() {};

  const facetName = 'facet';
  const facetValueToExclude = 'brand';

  t.notOk(helper.state.facetsExcludes[facetName], 'initialy empty');
  helper.addExclude(facetName, facetValueToExclude);
  t.ok(helper.state.facetsExcludes[facetName], 'not empty');
  t.ok(
    helper.state.facetsExcludes[facetName][0] === facetValueToExclude,
    'with the correct value'
  );

  t.end();
});

test('removeExclude should remove an exclusion', t => {
  const helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facet'],
  });

  helper._search = function() {};

  const facetName = 'facet';
  const facetValueToExclude = 'brand';

  helper.addExclude(facetName, facetValueToExclude);
  t.ok(
    helper.state.facetsExcludes[facetName].length === 1,
    'not empty at first'
  );
  helper.removeExclude(facetName, facetValueToExclude);
  t.ok(!helper.state.facetsExcludes[facetName], 'then empty');

  try {
    helper.removeExclude(facetName, facetValueToExclude);
  } catch (e) {
    t.fail('Removing unset exclusions should be ok...');
  }

  t.end();
});

test('isExcluded should allow to omit the value', t => {
  const facetName = 'foo';
  const facetValueToExclude = 'brand';
  const facetValueNotExcluded = 'bar';

  const helper = algoliasearchHelper(fakeClient, null, {
    facets: [facetName],
  });

  t.notOk(
    helper.isExcluded(facetName, facetValueToExclude),
    'before, the value to exclude is not excluded'
  );
  t.notOk(
    helper.isExcluded(facetName, facetValueNotExcluded),
    'before, the value to exclude is not excluded'
  );
  t.notOk(helper.isExcluded(facetName), 'before, no facet for the attribute');
  helper.addExclude(facetName, facetValueToExclude);
  t.ok(
    helper.isExcluded(facetName, facetValueToExclude),
    'after, the value to exclude is excluded'
  );
  t.notOk(
    helper.isExcluded(facetName, facetValueNotExcluded),
    'after, the value not to excluded is not excluded'
  );
  t.ok(
    helper.isExcluded(facetName),
    'after, the attribute contains exclusions'
  );

  t.end();
});

test('isExcluded should report exclusion correctly', t => {
  const helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facet'],
  });

  helper._search = function() {};

  const facetName = 'facet';
  const facetValueToExclude = 'brand';

  t.notOk(
    helper.isExcluded(facetName, facetValueToExclude),
    'value not excluded at first'
  );
  helper.addExclude(facetName, facetValueToExclude);
  t.ok(helper.isExcluded(facetName, facetValueToExclude), 'value is excluded');
  helper.removeExclude(facetName, facetValueToExclude);
  t.notOk(
    helper.isExcluded(facetName, facetValueToExclude),
    'value is not excluded anymore'
  );

  t.end();
});
