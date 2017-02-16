/**
 * preserveorder.js
 *
 *   To Run:
 *     $ npm install && node preserveorder.js
 */

// Q. Given an array of arrays of strings can we merge the strings into
//    an array without duplicates and preserving their original order?
//    (e.g. to build a list of unique CSV field headers...)

// Assumptions
// - Input is non-empty, dense array of strings (no empty, missing, non-array elements)
// - Each element array of strings length >0 (e.g. no [], only [a, b...])
// - Individual array of strings will not contain duplicates (e.g. no [a, b, b])
// - Input will have no conflicts in ordering (e.g. no [a, b] and [b, a], no orphans [c])

// Examples
// [['a', 'b'], ['b', 'c']] -> ['a', 'b', 'c']
// [['1', '9'], ['1', '3'], ['3', '6']] -> ['1', '3', '6', '9']

// Approach
// - For each array, collect rules about ordering
// - Merge/flatten rules for simpler lookup table
// - Get all unique strings from input
// - Sort unique strings according to lookup table

var _ = require('lodash');
var test = require('tape');

var input1 = [['a', 'b'], ['b', 'c']];
var input2 = [['a', 'b'], ['b', 'c'], ['a', 'c']];
var input3 = [['a', 'b'], ['b', 'c'], ['b', 'd'], ['c', 'd']];
var input4 = [['1', '9'], ['3', '6'], ['1', '3'], ['6', '9']];
var input5 = [
  ['a',      'c', 'd', 'e', 'f', 'g'],
  ['a', 'b',      'd', 'e', 'f', 'g'],
  ['a', 'b', 'c',      'e', 'f', 'g'],
  ['a', 'b', 'c', 'd',      'f', 'g'],
  ['a', 'b', 'c', 'd', 'e',      'g'],
];

/**
 * Update rules table for all elements that key has higher order precedence over
 * e.g. {'a': {'b': 1, 'c': 1, 'd': 1...} -> 'a' should come before 'b', 'c', 'd'
 */
var updateRules = function (arr, rules) {
  if (arr.length <= 1) {
    // Too few elements to create a rule
    return;
  }
  var i, j;
  var l = arr.length;
  for (i = 0; i < l - 1; i++) {
    var curr = arr[i];
    if (!rules[curr]) {
      rules[curr] = {};
    }
    // Mark all elements after itself
    for (j = i+1; j < l; j++) {
      var temp = arr[j];
      rules[curr][temp] = 1;
    }
  }
};

/**
 * Return lookup table of all combined rules for input
 */
var getMasterRules = function (input) {
  var rules = {};
  input.forEach(function (arr) {
    updateRules(arr, rules);
  });

  // Merge into lookup table
  Object.keys(rules).forEach(function (rule) {
    Object.keys(rules[rule]).forEach(function (key) {
      rules[rule] = _.merge(rules[rule], rules[key] || {});
    });
  });

  return rules;
};

/**
 * Returns merged array of non-duplicate strings from input in respective order
 */
var preserveOrder = function (input) {
  var rules = getMasterRules(input);

  // Get unique elements
  // NOTE: This can be refactored into getMasterRules
  //       since it already has to visit each element
  var uniq = {};
  input.forEach(function (arr) {
    arr.forEach(function (elem) {
      uniq[elem] = 1;
    });
  });

  // Rules lookup for order precedence
  var sorted = Object.keys(uniq);
  sorted.sort(function sortByRules(a, b) {
    if (rules[a] && rules[a][b]) return -1;
    if (rules[b] && rules[b][a]) return 1;
    return 0;
  });
  return sorted;
};

test('updateRules input1[0]', function (t) {
  t.plan(1);
  var rules = {};
  updateRules(input1[0], rules);
  t.deepEqual(rules, {a: {b: 1}});
});

test('updateRules input2[0..2]', function (t) {
  t.plan(1);
  var rules = {};
  updateRules(input2[0], rules);
  updateRules(input2[1], rules);
  updateRules(input2[2], rules);
  t.deepEqual(rules, {a: {b: 1, c: 1}, b: {c: 1}});
});

test('getMasterRules input2 basic', function (t) {
  t.plan(1);
  var rules = getMasterRules(input2);
  t.deepEqual(rules, {a: {b: 1, c: 1}, b: {c: 1}});
});

test('getMasterRules input3 flatten', function (t) {
  t.plan(1);
  var rules = getMasterRules(input3);
  t.deepEqual(rules, {a: {b: 1, c: 1, d: 1}, b: {c: 1, d: 1}, c: {d: 1}});
});

test('preserveOrder input1', function (t) {
  t.plan(1);
  var arr = preserveOrder(input1);
  t.deepEqual(arr, ['a', 'b', 'c']);
});

test('preserveOrder input4', function (t) {
  t.plan(1);
  var arr = preserveOrder(input4);
  t.deepEqual(arr, ['1', '3', '6', '9']);
});

test('preserveOrder input5', function (t) {
  t.plan(1);
  var arr = preserveOrder(input5);
  t.deepEqual(arr, ['a', 'b', 'c', 'd', 'e', 'f', 'g']);
});