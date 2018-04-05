const test = require('tape');
const algoliasearchHelper = require('../../../index');

const SearchParameters = algoliasearchHelper.SearchParameters;
const shortener = require('../../../src/SearchParameters/shortener');

const mapKeys = require('lodash/mapKeys');

const qs = require('qs');

const fakeClient = {
  addAlgoliaAgent() {},
};

test('setState should set the state of the helper and trigger a change event', t => {
  const state0 = { query: 'a query' };
  const state1 = { query: 'another query' };

  const helper = algoliasearchHelper(fakeClient, null, state0);

  t.deepEquals(
    helper.state,
    new SearchParameters(state0),
    '(setstate) initial state should be state0'
  );

  helper.on('change', newState => {
    t.deepEquals(
      helper.state,
      new SearchParameters(state1),
      '(setState) the state in the helper should be changed to state1'
    );
    t.deepEquals(
      newState,
      new SearchParameters(state1),
      '(setState) the state parameter of the event handler should be set to state1'
    );
    t.end();
  });

  helper.setState(state1);
});

test('getState should return the current state of the helper', t => {
  const initialState = { query: 'a query' };
  const helper = algoliasearchHelper(fakeClient, null, initialState);

  t.deepEquals(
    helper.getState(),
    new SearchParameters(initialState),
    '(getState) getState returned value should be equivalent to initialstate as a new SearchParameters'
  );
  t.deepEquals(
    helper.getState(),
    helper.state,
    '(getState) getState returned value should be equivalent to the internal state of the helper'
  );

  t.end();
});

test('getState should return an object according to the specified filters', t => {
  const initialState = {
    query: 'a query',
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB'],
    hierarchicalFacets: [
      {
        name: 'facetC',
        attributes: ['facetC'],
      },
    ],
    minWordSizefor1Typo: 1,
  };
  const index = 'indexNameInTheHelper';
  const helper = algoliasearchHelper(fakeClient, index, initialState);

  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.toggleRefine('facetC', 'menu');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  const stateFinalWithSpecificAttribute = {
    index,
    query: initialState.query,
    facetsRefinements: { facetA: ['a'] },
    disjunctiveFacetsRefinements: { facetB: ['d'] },
    numericRefinements: { numerical: { '=': [3] } },
  };

  const stateFinalWithoutSpecificAttributes = {
    index,
    query: initialState.query,
    facetsRefinements: { facetA: ['a'], facetWeDontCareAbout: ['v'] },
    disjunctiveFacetsRefinements: { facetB: ['d'] },
    hierarchicalFacetsRefinements: { facetC: ['menu'] },
    numericRefinements: { numerical2: { '<=': [3] }, numerical: { '=': [3] } },
  };

  const stateWithHierarchicalAttribute = {
    hierarchicalFacetsRefinements: { facetC: ['menu'] },
  };

  t.deepEquals(
    helper.getState([]),
    {},
    'if an empty array is passed then we should get an empty object'
  );
  t.deepEquals(
    helper.getState([
      'index',
      'query',
      'attribute:facetA',
      'attribute:facetB',
      'attribute:numerical',
    ]),
    stateFinalWithSpecificAttribute,
    '(getState) getState returned value should contain all the required elements'
  );

  t.deepEquals(
    helper.getState(['attribute:facetC']),
    stateWithHierarchicalAttribute,
    '(getState) getState returned value should contain the hierarchical facet'
  );

  t.deepEquals(
    helper.getState(['index', 'query', 'attribute:*']),
    stateFinalWithoutSpecificAttributes,
    '(getState) getState should return all the attributes if *'
  );

  t.end();
});

test('Get the state as a query string', t => {
  const initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB'],
  };
  const index = 'indexNameInTheHelper';
  const helper = algoliasearchHelper(fakeClient, index, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  // Here we add the number as strings (which is correct but not orthodox)
  // because the parser will return string values...
  helper.addNumericRefinement('numerical', '=', '3');
  helper.addNumericRefinement('numerical2', '<=', '3');

  const filters = ['query', 'attribute:*'];
  const stateWithoutConfig = helper.getState(filters);

  const decodedState = mapKeys(
    qs.parse(helper.getStateAsQueryString({ filters })),
    (v, k) => {
      const decodedKey = shortener.decode(k);
      return decodedKey || k;
    }
  );

  t.deepEquals(
    algoliasearchHelper.SearchParameters._parseNumbers(decodedState),
    stateWithoutConfig,
    'deserialized qs should be equal to the state'
  );

  t.end();
});

test('Set the state with a query parameter with index', t => {
  const initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB'],
  };
  const index = 'indexNameInTheHelper';
  const helper = algoliasearchHelper(fakeClient, index, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  const filters = ['index', 'query', 'attribute:*'];

  const newHelper = algoliasearchHelper(fakeClient, null, initialState);
  newHelper.setStateFromQueryString(helper.getStateAsQueryString({ filters }));

  t.deepEquals(
    newHelper.state,
    helper.state,
    'Should be able to recreate a helper from a query string'
  );
  t.equal(newHelper.getIndex(), helper.getIndex(), 'Index should be equal');
  t.end();
});

test('Set the state with a query parameter without index', t => {
  const initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB'],
  };
  const helper = algoliasearchHelper(fakeClient, null, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  const filters = ['query', 'attribute:*'];

  const newHelper = algoliasearchHelper(fakeClient, null, initialState);
  newHelper.setStateFromQueryString(helper.getStateAsQueryString({ filters }));

  t.deepEquals(
    newHelper.state,
    helper.state,
    'Should be able to recreate a helper from a query string'
  );
  t.equal(newHelper.getIndex(), helper.getIndex(), 'Index should be equal');
  t.end();
});

test('Set the state with a query parameter with unknown querystring attributes', t => {
  const initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB'],
  };
  const helper = algoliasearchHelper(fakeClient, null, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  const filters = ['query', 'attribute:*'];

  const newHelper = algoliasearchHelper(fakeClient, null, initialState);
  const queryString = `${helper.getStateAsQueryString({
    filters,
  })}&foo=bar&toto=tata`;
  newHelper.setStateFromQueryString(queryString);

  t.deepEquals(
    newHelper.state,
    helper.state,
    'Should be able to recreate a helper from a query string'
  );
  t.equal(newHelper.getIndex(), helper.getIndex(), 'Index should be equal');
  t.end();
});

test('Serialize with prefix', t => {
  const initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB'],
  };
  const index = 'indexNameInTheHelper';
  const helper = algoliasearchHelper(fakeClient, index, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  // Here we add the number as strings (which is correct but not orthodox)
  // because the parser will return string values...
  helper.addNumericRefinement('numerical', '=', '3');
  helper.addNumericRefinement('numerical2', '<=', '3');

  const filters = ['query', 'attribute:*', 'index'];
  const prefix = 'toto_';

  const qString = helper.getStateAsQueryString({ filters, prefix });

  t.deepEquals(
    qString,
    'toto_q=a%20query&toto_idx=indexNameInTheHelper&toto_dFR[facetB][0]=d&toto_fR[facetA][0]=a&toto_fR[facetWeDontCareAbout][0]=v&toto_nR[numerical][=][0]=3&toto_nR[numerical2][<=][0]=3',
    'serialized qs with prefix should be correct'
  );

  t.end();
});

test('Serialize without any state to serialize, only more attributes', t => {
  const initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB'],
  };

  const index = 'indexNameInTheHelper';
  const helper = algoliasearchHelper(fakeClient, index, initialState);

  const filters = ['attribute:*'];

  const qString = helper.getStateAsQueryString({
    filters,
    moreAttributes: {
      toto: 'tata',
      foo: 'bar',
    },
  });

  t.deepEquals(
    qString,
    'toto=tata&foo=bar',
    'serialized qs without helper parameters and more attributes should be equal'
  );

  t.end();
});

test('Serialize with prefix, this should have no impact on user provided paramaters', t => {
  const initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB'],
  };
  const index = 'indexNameInTheHelper';
  const helper = algoliasearchHelper(fakeClient, index, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  // Here we add the number as strings (which is correct but not orthodox)
  // because the parser will return string values...
  helper.addNumericRefinement('numerical', '=', '3');
  helper.addNumericRefinement('numerical2', '<=', '3');

  const filters = ['query', 'attribute:*'];
  const prefix = 'toto_';

  const qString = helper.getStateAsQueryString({
    filters,
    prefix,
    moreAttributes: {
      toto: 'tata',
      foo: 'bar',
    },
  });

  t.deepEquals(
    qString,
    'toto_q=a%20query&toto_dFR[facetB][0]=d&toto_fR[facetA][0]=a&toto_fR[facetWeDontCareAbout][0]=v&toto_nR[numerical][=][0]=3&toto_nR[numerical2][<=][0]=3&toto=tata&foo=bar',
    'serialized qs with prefix and more attributes should be equal'
  );

  t.end();
});

test('Should be able to deserialize qs with namespaced attributes', t => {
  const initialState = {
    facets: ['facetA', 'facetWeDontCareAbout'],
    disjunctiveFacets: ['facetB'],
  };
  const index = 'indexNameInTheHelper';
  const helper = algoliasearchHelper(fakeClient, index, initialState);

  helper.setQuery('a query');
  helper.toggleRefine('facetA', 'a&b=13');
  helper.toggleRefine('facetWeDontCareAbout', 'v');
  helper.toggleRefine('facetB', 'd');
  helper.addNumericRefinement('numerical', '=', 3);
  helper.addNumericRefinement('numerical2', '<=', 3);

  const filters = ['index', 'query', 'attribute:*'];

  const newHelper = algoliasearchHelper(fakeClient, null, initialState);
  const queryString = helper.getStateAsQueryString({
    filters,
    prefix: 'calimerou_',
  });
  newHelper.setStateFromQueryString(queryString, { prefix: 'calimerou_' });

  t.deepEquals(
    newHelper.state,
    helper.state,
    'Should be able to recreate a helper from a query string (with prefix)'
  );
  t.equal(
    newHelper.getIndex(),
    helper.getIndex(),
    'Index should be equal even with the prefix'
  );
  t.end();
});

test('getStateFromQueryString should parse page as number and be consistent with the state', t => {
  const index = 'indexNameInTheHelper';
  const helper = algoliasearchHelper(fakeClient, index, {});

  helper.setCurrentPage(10);

  const filters = ['page'];

  const queryString = helper.getStateAsQueryString({ filters });

  const partialStateFromQueryString = algoliasearchHelper.url.getStateFromQueryString(
    queryString
  );

  t.deepEquals(
    partialStateFromQueryString.page,
    helper.state.page,
    'Page should be consistent through query string serialization/deserialization'
  );
  t.end();
});

test('getStateFromQueryString should use its options', t => {
  const partialStateFromQueryString = algoliasearchHelper.url.getStateFromQueryString(
    'is_notexistingparam=val&is_MyQuery=test&is_p=3&extra_param=val',
    {
      prefix: 'is_',
      mapping: {
        q: 'MyQuery',
      },
    }
  );

  t.deepEquals(
    partialStateFromQueryString,
    {
      query: 'test',
      page: 3,
    },
    'Partial state should have used both the prefix and the mapping'
  );
  t.end();
});

test('should be able to get configuration that is not from algolia', t => {
  const index = 'indexNameInTheHelper';
  const helper = algoliasearchHelper(fakeClient, index, {});

  helper.setCurrentPage(10);

  const filters = ['page', 'index'];

  const moar = {
    foo: 'bar',
    baz: 'toto',
    mi: '0',
  };

  const qsWithoutPrefix = helper.getStateAsQueryString({
    filters,
    moreAttributes: moar,
  });
  const qsWithPrefix = helper.getStateAsQueryString({
    filters,
    moreAttributes: moar,
    prefix: 'wtf_',
  });
  const qsWithPrefixAndMapping = helper.getStateAsQueryString({
    filters,
    moreAttributes: moar,
    prefix: 'wtf_',
    mapping: {
      p: 'mypage',
    },
  });
  const config1 = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(
    qsWithoutPrefix
  );
  const config2 = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(
    qsWithPrefix,
    { prefix: 'wtf_' }
  );
  const config3 = algoliasearchHelper.url.getUnrecognizedParametersInQueryString(
    qsWithPrefixAndMapping,
    { prefix: 'wtf_', mapping: { p: 'mypage' } }
  );

  t.deepEquals(config1, moar);
  t.deepEquals(config2, moar);
  t.deepEquals(config3, moar);
  t.end();
});

test('setState should set a default hierarchicalFacetRefinement when a rootPath is defined', t => {
  const searchParameters = {
    hierarchicalFacets: [
      {
        name: 'hierarchicalCategories.lvl0',
        attributes: [
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ],
        separator: ' > ',
        rootPath: 'Cameras & Camcorders',
        showParentLevel: true,
      },
    ],
  };

  const helper = algoliasearchHelper(fakeClient, null, searchParameters);
  const initialHelperState = Object.assign({}, helper.getState());

  t.deepEquals(initialHelperState.hierarchicalFacetsRefinements, {
    'hierarchicalCategories.lvl0': ['Cameras & Camcorders'],
  });

  // reset state
  helper.setState(
    helper.state.removeHierarchicalFacet('hierarchicalCategories.lvl0')
  );
  t.deepEquals(helper.getState().hierarchicalFacetsRefinements, {});

  // re-add `hierarchicalFacets`
  helper.setState(Object.assign({}, helper.state, searchParameters));
  const finalHelperState = Object.assign({}, helper.getState());

  t.deepEquals(initialHelperState, finalHelperState);
  t.deepEquals(finalHelperState.hierarchicalFacetsRefinements, {
    'hierarchicalCategories.lvl0': ['Cameras & Camcorders'],
  });

  t.end();
});
