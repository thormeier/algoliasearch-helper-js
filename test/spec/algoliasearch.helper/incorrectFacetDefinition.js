const test = require('tape');
const algoliasearchHelper = require('../../../index');

const _ = require('lodash');

const fakeClient = {
  addAlgoliaAgent() {},
};

test('Conjuctive facet should be declared to be refined', t => {
  const h = algoliasearchHelper(fakeClient, '', {});

  t.throws(
    _.bind(h.addRefine, h, 'undeclaredFacet', 'value'),
    'Adding a facet refinement should not be possible'
  );
  t.throws(
    _.bind(h.removeRefine, h, 'undeclaredFacet', 'value'),
    'Remove a facet refinement should not be possible'
  );
  t.throws(
    _.bind(h.isRefined, h, 'undeclaredFacet', 'value'),
    'Checking if a facet is refined should not be possible'
  );

  t.end();
});

test('Conjuctive facet should be declared to be excluded', t => {
  const h = algoliasearchHelper(fakeClient, '', {});

  t.throws(
    _.bind(h.addExclude, h, 'undeclaredFacet', 'value'),
    'Adding a facet refinement should not be possible'
  );
  t.throws(
    _.bind(h.removeExclude, h, 'undeclaredFacet', 'value'),
    'Remove a facet refinement should not be possible'
  );
  t.throws(
    _.bind(h.isExcluded, h, 'undeclaredFacet', 'value'),
    'Checking if a facet is refined should not be possible'
  );

  t.end();
});

test('Conjuctive facet should be declared to be refine', t => {
  const h = algoliasearchHelper(fakeClient, '', {});

  t.throws(
    _.bind(h.addDisjunctiveRefine, h, 'undeclaredFacet', 'value'),
    'Adding a facet refinement should not be possible'
  );
  t.throws(
    _.bind(h.removeDisjunctiveRefine, h, 'undeclaredFacet', 'value'),
    'Remove a facet refinement should not be possible'
  );
  t.throws(
    _.bind(h.isRefined, h, 'undeclaredFacet', 'value'),
    'Checking if a facet is refined should not be possible'
  );

  t.end();
});
