import { traverse } from '../dist/index.js';

/** @type {{ [key: string]: any }} */
const obj = {
  hello: 'world',
  foo: {
    bar: {
      something: 42,
    },
  },
  other: {
    arrrgh: ['matety', 'I', 'am', 'a', 'pirate'],
    okThen: [
      {
        nested: 'obj',
        yes: true,
      },
      {
        otherProp: false,
        dookie: 177,
      },
    ],
  },
  imNull: null,
};

const last = (arr) => arr[arr.length - 1];

traverse(obj, {
  objectCallback: (obj, context, justKeepSwimming) => {
    console.log(last(context.path), 'object encountered');
    justKeepSwimming();
  },
  arrayCallback: (arr, context, justKeepSwimming) => {
    console.log(last(context.path), 'array encountered');
    // justKeepSwimming();
  },
  primitiveCallback: (primitive, context) => console.log('primitive encountered', last(context.path), primitive),
});
