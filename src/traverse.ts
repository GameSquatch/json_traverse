export function traverse(obj: JsonPrimitive | JsonArray | JsonObject, traversalCallbacks?: TraverseCallbackOpts) {
  if (obj === undefined) {
    throw new Error("Can't pass nullish data to traverser");
  }

  let arrayCallback: undefined | TraversableCallback<JsonArray>;
  let objectCallback: undefined | TraversableCallback<JsonObject> | undefined;
  let primitiveCallback: undefined | ((encounteredData: JsonPrimitive, context: TraversalContext) => void);
  if (traversalCallbacks) {
    arrayCallback = traversalCallbacks.arrayCallback;
    objectCallback = traversalCallbacks.objectCallback;
    primitiveCallback = traversalCallbacks.primitiveCallback;
  }

  (function $traverse($obj, context) {
    if (Array.isArray($obj)) {
      /**
       * This is passed to the array callback when an array is encountered.
       * Calling it will continue traversal through the array.
       * Not calling it will halt traversal in that particular sub-tree since this algorithm
       * is depth-first.
       */
      const traverseArray = () => {
        $obj.forEach((item, i) => {
          context.path.push(`#${i}`);
          $traverse(item, context);
          context.path.pop();
        });
      };
      if (arrayCallback) {
        arrayCallback($obj, context, traverseArray);
      } else {
        traverseArray();
      }
    } else if ($obj !== null && typeof $obj === 'object' && Object.getPrototypeOf($obj) === Object.prototype) {
      /**
       * This is passed to the object callback when an object is encountered.
       * Calling it will continue traversal through the object.
       * Not calling it will halt traversal in that particular sub-tree since this algorithm
       * is depth-first.
       */
      const traverseObject = () => {
        Object.entries($obj).forEach(([key, item]) => {
          context.path.push(key);
          $traverse(item, context);
          context.path.pop();
        });
      };

      if (objectCallback) {
        objectCallback($obj, context, traverseObject);
      } else {
        traverseObject();
      }
    } else if ($obj === null || typeof $obj === 'number' || typeof $obj === 'boolean' || typeof $obj === 'string') {
      primitiveCallback?.($obj, context);
    } else {
      throw new Error(`Type of data not supported in JSON: [${typeof $obj}]`);
    }
  })(obj, { path: ['__root'] });
}

type JsonPrimitive = string | number | boolean | null;
type JsonArray = JsonPrimitive[] | JsonObject[];
type JsonObject = { [key: string]: JsonPrimitive | JsonArray | JsonObject };

type TraversableCallback<TEncountered> = (
  encounteredData: TEncountered,
  context: TraversalContext,
  justKeepSwimming: () => void
) => void;

interface TraverseCallbackOpts {
  arrayCallback?: TraversableCallback<JsonArray>;
  objectCallback?: TraversableCallback<JsonObject>;
  primitiveCallback?: (encounteredData: JsonPrimitive, context: TraversalContext) => void;
}

export interface TraversalContext {
  path: string[];
}
