const objectAssign = require('object-assign');
const shallowClone = require('shallow-clone');

export const merge = typeof Object.assign === 'function' ? Object.assign : objectAssign;      
export const error = (msg) => { throw new Error(`CausalityRedux: ${msg}`); };

const getKeysWOSymbols = (obj) => {
    if (!obj) return [];
    return Object.keys(obj);
};

const getKeysWSymbols = (obj) => {
    if (!obj) return [];
    return [...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)];
};

let getKeys = getKeysWOSymbols;
if (typeof Object.getOwnPropertySymbols === 'function')
    getKeys = getKeysWSymbols;
export { getKeys };  

export function shallowEqual(objA, objB) {
    if (objA === objB)
        return true;

    const keysA = getKeys(objA);
    const keysB = getKeys(objB);

    if (keysA.length !== keysB.length) 
        return false;

    const hasOwn = Object.prototype.hasOwnProperty;
    for (let i = 0; i < keysA.length; i++) {
        if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
            return false;
        }
    }

    return true;
}

export function shallowCopy(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    return shallowClone(obj);
}

const proxyObjects = {};

const addProxyObject = (partitionName, obj) =>
    proxyObjects[partitionName] = obj;
    
const proxyDefined = () =>
    typeof Proxy !== 'undefined';

export const handleAddKeysToProxyObject = (store, partitionName, currentState, newState) => {
    if (proxyDefined())
        return;
    getKeys(newState[partitionName]).forEach(key => {
        if (typeof currentState[partitionName][key] === 'undefined')
            defineProxyGetSet(proxyObjects[partitionName], store[partitionName], key);
    });
};

const getPartitionValue = (target, key) => {
    return shallowCopy(target.getState()[key]);
};

const setPartitionValue = (target, key, value) => {
    if (target.getState()[key] !== value)
        target.setState({ [key]: value }, true);
    return true;
};

const defineProxyGetSet = (obj, target, key) => {
    Object.defineProperty(
        obj,
        key, {
            get: function () {
                return getPartitionValue(target, key);
            },
            set: function (value) {
                setPartitionValue(target, key, value);
            }
        }
    );
};

const simulateProxy = (partitionName, target) => {
    const obj = {};
    getKeys(target.getState()).forEach(key => {
        defineProxyGetSet(obj, target, key);
    });
    addProxyObject(partitionName, obj);
    return obj;
};

const partitionProxyHandler = {
    get(target, key) {
        return getPartitionValue(target, key);
    },
    set(target, key, value) {
        return setPartitionValue(target, key, value);
    }
};

export const getPartitionProxy = (partitionName, target) => {
    if (proxyDefined())
        return new Proxy(target, partitionProxyHandler);
    return simulateProxy(partitionName, target);
};

//
// MDN code
//
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function(predicate) {
      const o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      const len = o.length >>> 0;
      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      const thisArg = arguments[1];

      // 5. Let k be 0.
      let k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        const kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    }
  });
}

if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function(predicate) {
      const o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      const len = o.length >>> 0;

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      const thisArg = arguments[1];

      // 5. Let k be 0.
      let k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        const kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return -1.
      return -1;
    }
  });
}


