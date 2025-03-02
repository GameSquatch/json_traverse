# JSON Traverse

This is a package I will be using as a dependency to another project, so support may be limited.

## Features

The goal of this package was to provide a function that would traverse a JSON-like JavaScript object recursively, and call provided callback functions as it found Objects, Arrays, and primitive values (string, number, boolean, and `null`);

There currently is no support for JS objects containing other types, like `BigInt`, `Date`, etc.

The idea was that a JSON file that was parsed into a JS runtime could be traversed by this function.

## Install

```sh
npm install json_traverse
```

## v2.0.1

This version adds traversal "continue predicates". When you define your callback functions, they are given a third parameter for continuing traversal into the structure. This function now accepts an optional argument that allows you to conditionally travel through the object, giving you more flexibility on how to travel through. Here is an example:

```js
const testObject = {
  fields: {
    field1: '23',
    field2: 23,
    field3: false,
    field4: ['a', 'b', 'c'],
  },
};

traverse(testObject, {
  objectCallback: (obj, context, next) => {
    next((fieldName, fieldValue) => fieldName === 'field4' || typeof fieldValue === 'number');
  },
  arrayCallback: (arr, context, next) => next((item, index) => index > 1),
});
```

This will only trigger callbacks for `field4`, `field2`, and the 3<sup>rd</sup> item inside of the `field4` array ('c'). Keep in mind that this predicate will apply to the entire sub-tree at the moment it is defined. So in this example, if `field4` were an object instead of an array, the predicate would apply to its fields as well. You may also notice that the predicate for objects is slightly different for the one for arrays.

## v2.0

Some important changes come in version 2.0.

First, you can now (or _must_) control when to continue traversing the sub-tree of the encountered object or array. This allows you to perform pre- and post-actions relative to traversing into the depth of that sub-tree.

For example, if you encounter an object, and you want to track that you are in an object within the context, after traversal is complete, you can remove that indicator from the context, so it doesn't stick around as traversal continues above and horizontally.

```js
traverse(testObject, {
  objectCallback: (obj, context, next) => {
    const key = context.path[context.path.length - 1];
    console.log(`Found an object with the key ${key}`);
    const saveParent = context.parent;
    context.parent = key;
    next(); // traverses through this object's properties
    context.parent = saveParent;
  },
});
```

Second, as you may have noticed in the last code snippet, callback functions have now been typed as optional. If a callback is not provided, traversal will continue by default. The named parameters have also been expanded from `Cb` to the full word `Callback`.

## v1.0

## Usage

```js
import { traverse } from 'json_traverse';

const testObject = {
  fieldOne: 'string value',
  fieldTwo: 42,
  fieldThree: true,
  fieldFour: null,
  nestedObject: {
    nestedOne: ['1', '2', '3'],
    nestedTwo: [
      {
        arrayObjectField: 'hello',
        alpha: ['a', 'b', 'c', 'd'],
      },
      {
        another: 'one',
        xyz: 700_000,
      },
    ],
    nestedThree: {
      it: 'goes',
      on: 'and on',
    },
  },
};

traverse(testObject, {
  objectCb: (obj, context) => {
    // The key for any given found element can be obtained from the last item in the path
    const key = context.path[context.path.length - 1];
    console.log(`Found an object with the key ${key}`);
  },
  arrayCb: (arr, context) => console.log(`Found an array with ${arr.length} items.`),
  primitiveCb: (primitive, context) => console.log(`Found a primitive with the value ${primitive}`),
});
/*
PRINTS:
Found an object with the key __root
Found a primitive with the value string value
Found a primitive with the value 42
Found a primitive with the value true
Found a primitive with the value null
...
*/
```

The context contains the path to the element that was found in the form of a list of keys. If the element was an array element, the key will be the `#` symbol followed by its index. For example, the first object in the above array, `nestedTwo`, would have a path of:

```js
['__root', 'nestedObject', 'nestedTwo', '#0'];
```

You may also add any value you like to the context and it will be passed throughout the traversal until you explicitly remove it.
