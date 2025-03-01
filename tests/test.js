import { expect } from 'chai';
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

describe('traverse()', function () {
  it('should stop at the root object', function () {
    traverse(obj, {
      objectCallback: (obj, context, justKeepSwimming) => {
        expect(context.path.length).to.equal(1);
        expect(context.path[0]).to.equal('__root');
      },
    });
  });

  it('encounters 12 leaf nodes', function () {
    let leafCount = 0;
    traverse(obj, {
      primitiveCallback: (data, context) => {
        leafCount += 1;
      },
    });
    expect(leafCount).to.equal(12);
  });

  it('encounters 6 objects', function () {
    let objCount = 0;
    traverse(obj, {
      objectCallback: (data, context, next) => {
        objCount += 1;
        next();
      },
    });
    expect(objCount).to.equal(6);
  });

  it('encounters 2 arrays', function () {
    let arrCount = 0;
    traverse(obj, {
      arrayCallback: (data, context, next) => {
        arrCount += 1;
        next();
      },
    });
    expect(arrCount).to.equal(2);
  });

  it('finds a max depth of 4', function () {
    let maxDepth = 1;
    traverse(obj, {
      objectCallback: (data, context, next) => {
        context.level ??= 0;
        context.level += 1;
        maxDepth = Math.max(context.level, maxDepth);
        next();
        context.level -= 1;
      },
      arrayCallback: (data, context, next) => {
        context.level += 1;
        maxDepth = Math.max(context.level, maxDepth);
        next();
        context.level -= 1;
      },
    });

    expect(maxDepth).to.equal(4);
  });
});
