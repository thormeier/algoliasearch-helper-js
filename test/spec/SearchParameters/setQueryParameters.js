const test = require('tape');
const forOwn = require('lodash/forOwn');
const SearchParameters = require('../../../src/SearchParameters');

test('setQueryParameters should return the same instance if the options is falsey', t => {
  const originalSP = new SearchParameters({
    facets: ['a', 'b'],
    ignorePlurals: false,
    attributesToHighlight: '',
  });

  t.equal(originalSP, originalSP.setQueryParameters());
  t.equal(originalSP, originalSP.setQueryParameters(null));
  t.equal(originalSP, originalSP.setQueryParameters(undefined));

  t.end();
});

test('setQueryParameters should be able to mix an actual state with a new set of parameters', t => {
  const originalSP = new SearchParameters({
    facets: ['a', 'b'],
    ignorePlurals: false,
    attributesToHighlight: '',
  });

  const params = {
    facets: ['a', 'c'],
    attributesToHighlight: ['city', 'country'],
    replaceSynonymsInHighlight: true,
  };
  const newSP = originalSP.setQueryParameters(params);

  t.deepEquals(
    newSP.facets,
    params.facets,
    'Facets should be updated (existing parameter)'
  );
  t.deepEquals(
    newSP.attributesToHighlight,
    newSP.attributesToHighlight,
    'attributesToHighlight should be updated (existing parameter)'
  );
  t.equal(
    newSP.replaceSynonymsInHighlight,
    newSP.replaceSynonymsInHighlight,
    'replaceSynonymsInHighlight should be updated (new parameter)'
  );
  t.equal(
    newSP.ignorePlurals,
    originalSP.ignorePlurals,
    'ignorePlurals should be the same as the original'
  );

  t.end();
});

test('setQueryParameters should add unknown properties', t => {
  const state0 = new SearchParameters({
    facets: ['a', 'b'],
    ignorePlurals: false,
    attributesToHighlight: '',
  });

  const params = {
    unknow1: ['a', 'c'],
    facet: ['city', 'country'],
  };

  const state1 = state0.setQueryParameters(params);

  forOwn(params, (v, k) => {
    t.deepEquals(state1[k], v);
  });

  t.end();
});
