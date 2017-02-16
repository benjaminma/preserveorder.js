# preserveorder.js

## Overview
Given an array of arrays of strings can we return an array of strings
with duplicates removed and a merge order that respects the original precedence?

## Examples
* [['a', 'b'], ['b', 'c']] -> ['a', 'b', 'c']
* [['b', 'c'], ['a', 'c'], ['a', 'b']] -> ['a', 'b', 'c']

## Test
    $ npm install
    $ node preserveorder.js
