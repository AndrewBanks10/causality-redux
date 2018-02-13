/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};exports.





















shallowEqual = shallowEqual;exports.





















shallowCopy = shallowCopy;function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}var objectAssign = __webpack_require__(9);var shallowClone = __webpack_require__(10);var merge = exports.merge = typeof Object.assign === 'function' ? Object.assign : objectAssign;var error = exports.error = function error(msg) {throw new Error('CausalityRedux: ' + msg);};var getKeysWOSymbols = function getKeysWOSymbols(obj) {if (!obj) return [];return Object.keys(obj);};var getKeysWSymbols = function getKeysWSymbols(obj) {if (!obj) return [];return [].concat(_toConsumableArray(Object.keys(obj)), _toConsumableArray(Object.getOwnPropertySymbols(obj)));};var getKeys = getKeysWOSymbols;if (typeof Object.getOwnPropertySymbols === 'function') {exports.getKeys = getKeys = getKeysWSymbols;}exports.getKeys = getKeys;function shallowEqual(objA, objB) {if (objA === objB) {return true;}var keysA = getKeys(objA);var keysB = getKeys(objB);if (keysA.length !== keysB.length) {return false;}var hasOwn = Object.prototype.hasOwnProperty;for (var i = 0; i < keysA.length; i++) {if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {return false;}}return true;}function shallowCopy(obj) {
  if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
    return obj;
  }
  return shallowClone(obj);
}

var proxyObjects = {};

var addProxyObject = function addProxyObject(partitionName, obj) {return (
    proxyObjects[partitionName] = obj);};

var proxyDefined = function proxyDefined() {return (
    typeof Proxy !== 'undefined');};

var handleAddKeysToProxyObject = exports.handleAddKeysToProxyObject = function handleAddKeysToProxyObject(store, partitionName, currentState, newState) {
  if (proxyDefined()) {
    return;
  }
  getKeys(newState[partitionName]).forEach(function (key) {
    if (typeof currentState[partitionName][key] === 'undefined') {
      defineProxyGetSet(proxyObjects[partitionName], store[partitionName], key);
    }
  });
};

var getPartitionValue = function getPartitionValue(target, key) {
  return shallowCopy(target.getState()[key]);
};

var setPartitionValue = function setPartitionValue(target, key, value) {
  if (target.getState()[key] !== value) {
    target.setState(_defineProperty({}, key, value), true);
  }
  return true;
};

var defineProxyGetSet = function defineProxyGetSet(obj, target, key) {
  Object.defineProperty(
  obj,
  key, {
    get: function get() {
      return getPartitionValue(target, key);
    },
    set: function set(value) {
      setPartitionValue(target, key, value);
    } });


};

var simulateProxy = function simulateProxy(partitionName, target, defaultState) {
  var obj = {};
  getKeys(defaultState).forEach(function (key) {
    defineProxyGetSet(obj, target, key);
  });
  addProxyObject(partitionName, obj);
  return obj;
};

var partitionProxyHandler = {
  get: function get(target, key) {
    return getPartitionValue(target, key);
  },
  set: function set(target, key, value) {
    return setPartitionValue(target, key, value);
  } };


var getPartitionProxy = exports.getPartitionProxy = function getPartitionProxy(partitionName, target, defaultState) {
  if (proxyDefined()) {
    return new Proxy(target, partitionProxyHandler);
  }
  return simulateProxy(partitionName, target, defaultState);
};

//
// MDN code
//
/* eslint-disable */
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    value: function value(predicate) {
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;
      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return kValue.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return kValue;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return undefined.
      return undefined;
    } });

}

if (!Array.prototype.findIndex) {
  Object.defineProperty(Array.prototype, 'findIndex', {
    value: function value(predicate) {
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0;

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      var thisArg = arguments[1];

      // 5. Let k be 0.
      var k = 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        var kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k++;
      }

      // 7. Return -1.
      return -1;
    } });

}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * is-extendable <https://github.com/jonschlinkert/is-extendable>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */



module.exports = function isExtendable(val) {
  return typeof val !== 'undefined' && val !== null
    && (typeof val === 'object' || typeof val === 'function');
};


/***/ }),
/* 2 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;}; /** @preserve © 2017 Andrew Banks ALL RIGHTS RESERVED */
/* eslint valid-typeof:0 */
var _redux = __webpack_require__(12);
var _util = __webpack_require__(0);
var _combineReducers = __webpack_require__(5);var _combineReducers2 = _interopRequireDefault(_combineReducers);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}

var invalidUIServiceFunctionKeys = [
'setState',
'getState',
'subscribe',
'partitionState'];


var stateEntryValidKeys = [
'partitionName',
'defaultState',
'controllerFunctions',
'uiServiceFunctions'];


var stateEntryRequiredKeys = [
'partitionName',
'defaultState'];


var undefinedString = 'undefined';

var _defaultState = {};

var internalActionType = '@@causality-redux/INIT';
var internalReduxActionType = '@@causality-redux/Redux/INIT';

var setStateChangerName = 'setState';

var _store = null;
var _reduxStore = null;
var _partitionsThatChanged = {};
var _listeners = [];
var _subscriberId = 0;
var _partitionDefinitions = [];
var _reduxReducers = {};
var _onStateChangeListeners = [];
var _onGlobalStateChangeListeners = [];
var _onListenerListeners = [];
var _onAddParitionListeners = [];
var _startState = null;
var _subscribers = [];
var uniqueKeys = {};
var _storeVersionKey = '@@@@@storeVersionKey@@@@@';
var _globalDataKey = '@@@@@globalDataKey@@@@@';
var _storeHistoryKey = '@@@@@history@@@@@';
var _uniqueKeyTemplate = '@@@@@causalityredux';
var _causalityreduxAction = '@@@@@causalityreduxAction@@@@@';

var createReduxStore = void 0;
if ((typeof _redux.createStore === 'undefined' ? 'undefined' : _typeof(_redux.createStore)) !== undefinedString) {
  createReduxStore = _redux.createStore;
}

/* eslint-disable */
if ((typeof createReduxStore === 'undefined' ? 'undefined' : _typeof(createReduxStore)) === undefinedString) {
  if ((typeof Redux === 'undefined' ? 'undefined' : _typeof(Redux)) !== undefinedString) {
    createReduxStore = Redux.createStore;
  } else
  (0, _util.error)('Redux is undefined.');
}
/* eslint-enable */

var objectType = function objectType(obj) {return Object.prototype.toString.call(obj).slice(8, -1);};

var isObjectType = function isObjectType(obj) {return objectType(obj) === 'Object';};

var findPartition = function findPartition(partitionName) {
  var partition = CausalityRedux.partitionDefinitions.find(function (e) {return (
      partitionName === e.partitionName);});

  return partition;
};

var discloseToListeners = function discloseToListeners(obj) {
  _onListenerListeners.forEach(function (e) {
    e(obj);
  });
};

var discloseStateChange = function discloseStateChange(obj) {
  _onStateChangeListeners.forEach(function (e) {
    e(obj);
  });
};

// Called when a state change occurs on a partition.
var indicateStateChange = function indicateStateChange(partitionName, type, operation, prevState, nextState, changerName, reducerName, theirArgs, storeVersion) {
  if (_onStateChangeListeners.length > 0) {
    if (changerName === setStateChangerName) {
      operation = setStateChangerName;
    }
    var obj = _defineProperty({
      partitionName: partitionName.toString(),
      type: type,
      operation: (typeof operation === 'undefined' ? 'undefined' : _typeof(operation)) === undefinedString ? 'User defined' : operation,
      prevState: prevState,
      nextState: nextState,
      changerName: changerName,
      reducerName: reducerName,
      args: theirArgs },
    _storeVersionKey, storeVersion);

    discloseStateChange(obj);
  }
};

//
// Any state change regardless of the partition is disclosed with this.
//
var indicateGlobalStateChange = function indicateGlobalStateChange(newState, isCopyState) {
  if (_onGlobalStateChangeListeners.length > 0) {
    _onGlobalStateChangeListeners.forEach(function (e) {
      e({ newState: newState, isCopyState: isCopyState });
    });
  }
};

var indicateListener = function indicateListener(partitionName, nextState, listenerName) {
  if (_onListenerListeners.length > 0) {
    var obj = {
      partitionName: partitionName.toString(),
      nextState: nextState,
      listenerName: listenerName };

    discloseToListeners(obj);
  }
};

var internalDispatch = function internalDispatch(action) {
  action[_causalityreduxAction] = true;
  // redux dispatch
  _store.dispatch(action);
};

// Can only subscribe as a listener on a partition.
var internalSubscriber = function internalSubscriber(listener, partitionName, stateEntries, listenerName) {
  var arr = [].concat(_toConsumableArray(stateEntries));
  var obj = { id: _subscriberId++, listener: listener, partitionName: partitionName, stateEntries: arr, listenerName: listenerName };
  _listeners.push(obj);
  return obj.id;
};

var internalUnsubscriber = function internalUnsubscriber(id) {
  _listeners = _listeners.filter(function (item) {return item.id !== id;});
};

//
// This is called in the store partition to subscribe to changes to the partition.
//
var internalPartitionSubscriber = function internalPartitionSubscriber(partitionName) {
  return (
    // If stateEntries == [] or undefined, listen to all keys in the partition.
    function (listener) {var stateEntries = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];var listenerName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
      if (typeof listener !== 'function') {
        (0, _util.error)('subscribe: first argument must be a function.');
      }
      if (!Array.isArray(stateEntries)) {
        stateEntries = [stateEntries];
      }

      var partition = findPartition(partitionName);
      stateEntries.forEach(function (se) {
        if (_typeof(partition.defaultState[se]) === undefinedString) {
          (0, _util.error)(se + ' is not a valid key in the state partition ' + partitionName + '.');
        }
      });

      var id = internalSubscriber(listener, partitionName, stateEntries, listenerName);
      // Return an unsubscriber function
      return function (id) {
        return function () {
          internalUnsubscriber(id);
        };
      }(id);
    });

};

// getState for the partiton
var internalPartitionGetState = function internalPartitionGetState(store, partitionName) {
  return function () {
    return store.getState()[partitionName];
  };
};

var executeSetState = function executeSetState(partitionName, theArg, noCheckCompare) {
  if (!isObjectType(theArg)) {
    (0, _util.error)('The Argument to setState must be an object.');
  }
  var actionObj = _defineProperty({
    theirArgs: [theArg],
    isSetState: true,
    noCheckCompare: noCheckCompare,
    arguments: [],
    type: setStateChangerName,
    changerName: setStateChangerName,
    partitionName: partitionName },
  _causalityreduxAction, true);

  internalDispatch(actionObj);
};

// Copies stateToCopy to the entire redux store.
var copyState = function copyState(stateToCopy) {
  if (!isObjectType(stateToCopy)) {
    (0, _util.error)('The Argument to copyState must be an object.');
  }
  internalDispatch({ stateToCopy: stateToCopy, type: '' });
};

// setState for the partiton
var internalPartitionSetState = function internalPartitionSetState(partitionName) {
  return function (theObjectArg, noCheckCompare) {
    executeSetState(partitionName, theObjectArg, noCheckCompare);
  };
};

//
// Each partition has access to the ui service functions and its own subscribe, getState and setState functions
// with a partitionState proxy.
//
var setupPartition = function setupPartition(store, stateEntry) {
  var partitionName = stateEntry.partitionName;
  store[partitionName] = {};
  var partitionStoreObject = store[partitionName];
  // Put all of the uiServiceFunctions in the store.
  if (_typeof(stateEntry.uiServiceFunctions) !== undefinedString) {
    (0, _util.getKeys)(stateEntry.uiServiceFunctions).forEach(function (o) {
      partitionStoreObject[o] = stateEntry.uiServiceFunctions[o];
    });
  }

  partitionStoreObject.subscribe = internalPartitionSubscriber(partitionName);
  partitionStoreObject.getState = internalPartitionGetState(store, partitionName);
  partitionStoreObject.setState = internalPartitionSetState(partitionName);
  partitionStoreObject.partitionState = (0, _util.getPartitionProxy)(partitionName, store[partitionName], stateEntry.defaultState);
};

function validatePartition(stateEntry) {
  if (process.env.NODE_ENV !== 'production') {
    // Handle deprecation
    if (stateEntry.changerDefinitions) {
      (0, _util.error)('changerDefinitions is deprecated. Use uiServiceFunctions and define your functions there.');
    }
    if (stateEntry.changers) {
      (0, _util.error)('changers is deprecated. Use uiServiceFunctions and define your functions there.');
    }
    if (stateEntry.reducers) {
      (0, _util.error)('reducers is deprecated. Use uiServiceFunctions and define your functions there.');
    }
    if (stateEntry.controllerFunctions) {
      console.warn(stateEntry.partitionName + ' partition, controllerFunctions is deprecated. Use uiServiceFunctions instead.');
    }

    // Verify uiServiceFunctions
    if (_typeof(stateEntry.uiServiceFunctions) !== undefinedString) {
      if (!isObjectType(stateEntry.uiServiceFunctions)) {
        (0, _util.error)('uiServiceFunctions must be an object in ' + stateEntry.partitionName + '.');
      }
      (0, _util.getKeys)(stateEntry.uiServiceFunctions).forEach(function (o) {
        invalidUIServiceFunctionKeys.forEach(function (key) {
          if (key === o) {
            (0, _util.error)('Illegal uiServiceFunction key=' + key + '.');
          }
        });
        if (typeof stateEntry.uiServiceFunctions[o] !== 'function') {
          (0, _util.error)('uiServiceFunction ' + o + ' must be a function in ' + stateEntry.partitionName + '.');
        }
      });
    }
    // Verify required keys.
    stateEntryRequiredKeys.forEach(function (entry) {
      if (_typeof(stateEntry[entry]) === undefinedString) {
        (0, _util.error)(entry + ' is a required entry in ' + stateEntry.partitionName + '.');
      }
    });

    // Verify that they do not use forbidden keys.
    (0, _util.getKeys)(stateEntry).forEach(function (o) {
      var isvalid = stateEntryValidKeys.some(function (entry) {return (
          o === entry);});

      if (!isvalid) {
        (0, _util.error)(o + ' is not a valid entry in ' + stateEntry.partitionName + '.');
      }
    });
  }
}

function addPartitionInternal(partitionDefinition) {
  // Backward compability.
  if (_typeof(partitionDefinition.controllerFunctions) !== undefinedString) {
    if (_typeof(partitionDefinition.uiServiceFunctions) === undefinedString) {
      partitionDefinition.uiServiceFunctions = partitionDefinition.controllerFunctions;
    }
  }
  validatePartition(partitionDefinition);
  setupPartition(_store, partitionDefinition);
  _partitionDefinitions.push(partitionDefinition);
}

//
// Do not call this in hot reloadedable code.
// The listener would be called for each time the module is loaded.
//
function setOptions() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (options.onStateChange) {
    if (typeof options.onStateChange !== 'function') {
      (0, _util.error)('options.onStateChange must be a function.');
    }
    _onStateChangeListeners.push(options.onStateChange);
  }

  if (options.onGlobalStateChange) {
    if (typeof options.onGlobalStateChange !== 'function') {
      (0, _util.error)('options.onGlobalStateChange must be a function.');
    }
    _onGlobalStateChangeListeners.push(options.onGlobalStateChange);
  }

  if (options.onListener) {
    if (typeof options.onListener !== 'function') {
      (0, _util.error)('options.onListener must be a function.');
    }
    _onListenerListeners.push(options.onListener);
  }

  if (options.onAddPartition) {
    if (typeof options.onAddPartition !== 'function') {
      (0, _util.error)('options.onListener must be a function.');
    }
    _onAddParitionListeners.push(options.onAddPartition);
  }
}

//
// This is the general reducer for redux.
//
var generalReducer = function generalReducer() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaultState;var action = arguments[1];
  //
  // The _startState is needed for the base case of listeners to determine whether a change occurred to some value in the partition.
  // We can't just use _defaultState because of possible hydration.
  //
  if (!_startState) {
    _startState = (0, _util.shallowCopy)(state);
  }

  // Change to the entire redux store.
  if (action.stateToCopy) {
    indicateGlobalStateChange(action.stateToCopy, true);
    return action.stateToCopy;
  }

  //
  // Redux assumes a change occurred if a new state object is returned from this reducer.
  // Essentially, this means a new pointer.
  // So, set up a new one in case something changes.
  //
  var newState = (0, _util.shallowCopy)(state);

  // This handles correcting the redux store for partitions defined after the redux store is created.
  if (action.type === internalActionType) {
    if (_typeof(newState[action.partitionName]) === undefinedString) {
      newState[action.partitionName] = (0, _util.shallowCopy)(action.defaultState);
    } else {
      // This is for a pre-hydrated state.
      (0, _util.getKeys)(action.defaultState).forEach(function (key) {
        if (_typeof(newState[action.partitionName][key]) === undefinedString) {
          newState[action.partitionName][key] = action.defaultState[key];
        }
      });
    }
    if (_typeof(_startState[action.partitionName]) === undefinedString) {
      _startState[action.partitionName] = (0, _util.shallowCopy)(action.defaultState);
    } else {
      // This is for a pre-hydrated state.
      (0, _util.getKeys)(action.defaultState).forEach(function (key) {
        if (_typeof(_startState[action.partitionName][key]) === undefinedString) {
          _startState[action.partitionName][key] = action.defaultState[key];
        }
      });
    }
    if (_typeof(newState[_storeVersionKey]) === undefinedString) {
      newState[_storeVersionKey] = 0;
    }
    return newState;
  }
  // This handles a redux hydration.
  if (action.type === internalReduxActionType) {
    return (0, _util.merge)({}, state, action.defaultState);
  }

  // Set state.
  if (action.isSetState) {
    newState[action.partitionName] = (0, _util.merge)({}, state[action.partitionName], action.theirArgs[0]);
  } else {
    return state; // This is for the redux init.
  }

  //
  // Check to see if anything is different. If not, just return the original state.
  // This is shallow equal. It determines equality only on the keys of state.
  // So, if a state entry at a key is a basic type, then equality is performed.
  // If the entry is an object, only pointer equality is checked. Lower objects may be different
  // and an array that had an element pushed directly in the redux store object  will not regester as a change.
  // A noCheckCompare on setState is allowed to proceed unchecked.
  //
  if (!action.noCheckCompare && (0, _util.shallowEqual)(newState[action.partitionName], state[action.partitionName])) {
    return state;
  }

  // This only applies to ancient browsers.
  (0, _util.handleAddKeysToProxyObject)(_store, action.partitionName, state, newState);

  _partitionsThatChanged[action.partitionName] = true;

  if (_typeof(newState[_storeVersionKey]) === undefinedString) {
    newState[_storeVersionKey] = 0;
  }
  ++newState[_storeVersionKey];

  // For all listeners on this partition, disclose a state change.
  indicateStateChange(action.partitionName, action.type, action.operation, state[action.partitionName], newState[action.partitionName], action.changerName, action.reducerName, action.theirArgs, newState[_storeVersionKey]);

  // For any global listener disclose a state change.
  indicateGlobalStateChange(newState, false);
  return newState;
};

// Initialize partitions.
function init(partitionDefinitions, preloadedState, enhancer) {var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  if ((typeof partitionDefinitions === 'undefined' ? 'undefined' : _typeof(partitionDefinitions)) === undefinedString) {
    (0, _util.error)('Missing first parameter partitionDefinitions.');
  }
  setOptions(options);

  //
  // One listener for redux
  //
  var generalListener = function generalListener() {
    var state = _store.getState();
    // Determine what listeners to call. First, only partitions that have changed will be examined.
    (0, _util.getKeys)(_partitionsThatChanged).forEach(function (o) {
      _listeners.forEach(function (item) {
        if (o === item.partitionName) {
          var partitionState = state[o];
          // This listener wants to be called for any changes on the partition.
          if (item.stateEntries.length === 0) {
            indicateListener(o, partitionState, item.listenerName);
            item.listener(partitionState);
            // This listener wants to be called only when specific entries in the partition are changed.
          } else {
            var areEqual = true;
            // Determine whether entries in the partition changed.
            if (_typeof(item.prevState) === undefinedString) {
              item.stateEntries.forEach(function (se) {
                areEqual = areEqual && partitionState[se] === _startState[o][se];
              });
            } else {
              item.stateEntries.forEach(function (entry) {
                areEqual = areEqual && partitionState[entry] === item.prevState[entry];
              });
            }
            //
            // There are changed entries. Build an object that contains all those entries that this listener wants.
            // This object will be sent in as an argument to the listener.
            //
            if (!areEqual) {
              var nextState = {};
              item.stateEntries.forEach(function (entry) {
                nextState[entry] = partitionState[entry];
              });

              // Set prevstate so that we know if partition values for this listener
              // changed on the next partition change.
              item.prevState = nextState;

              indicateListener(o, nextState, item.listenerName);
              item.listener(nextState);
            }
          }
        }
      });
    });
    _partitionsThatChanged = {};
  };

  partitionDefinitions.forEach(function (entry) {
    _defaultState[entry.partitionName] = (0, _util.shallowCopy)(entry.defaultState);
  });

  // handle initial hydration of the redux store.
  var newObj = {};
  if ((typeof preloadedState === 'undefined' ? 'undefined' : _typeof(preloadedState)) !== undefinedString) {
    var stateKeys = [].concat(_toConsumableArray((0, _util.getKeys)(_defaultState)), _toConsumableArray((0, _util.getKeys)(preloadedState)));
    stateKeys.forEach(function (key) {
      newObj[key] = (0, _util.merge)({}, _defaultState[key], preloadedState[key]);
    });
  } else {
    newObj = undefined;
  }

  if (!_reduxStore) {
    _reduxStore = createReduxStore(generalReducer, newObj, enhancer);
  } else {
    if (newObj) {
      _startState = newObj;
      var action = {
        type: internalReduxActionType,
        defaultState: newObj };

      _store = _reduxStore;
      internalDispatch(action);
    }
  }

  // Oop the redux stope.
  _store = Object.create(_reduxStore);
  _store.subscribe(generalListener);

  partitionDefinitions.forEach(function (entry) {
    addPartitionInternal(entry);
  });
}

// creates the causality-redux store.
function createStore() {var partitionDefinitions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];var preloadedState = arguments[1];var enhancer = arguments[2];var options = arguments[3];
  if (!Array.isArray(partitionDefinitions)) {
    partitionDefinitions = [partitionDefinitions];
  }
  // This allows createStore to be called more than once for hot re-loading or other reasons.
  if (_store !== null) {
    addPartitions(partitionDefinitions);
    setOptions(options);
    return _store;
  }

  partitionDefinitions = partitionDefinitions.filter(function (entry) {return (
      _typeof(findPartition(entry.partitionName)) === undefinedString);});

  var p = _partitionDefinitions.concat(partitionDefinitions);
  _partitionDefinitions = [];
  init(p, preloadedState, enhancer, options);
  // Add the subscribers that had subscribed before the store was created.
  _subscribers.forEach(function (e) {
    if (_typeof(_store[e.partitionName]) === undefinedString) {
      (0, _util.error)(e.partitionName + ' is an invalid partition.');
    }
    _store[e.partitionName].subscribe(e.listener, e.arrKeys, e.listenerName);
  });
  _subscribers = [];
  return _store;
}

// Add partitions. This allows partitions to be added before and after createStore.
// It also does not allow the same partition name to be included twice.
function addPartitions(partitionDefinitions) {
  if (!Array.isArray(partitionDefinitions)) {
    partitionDefinitions = [partitionDefinitions];
  }

  partitionDefinitions.forEach(function (entry) {
    if (entry.partitionName === _storeVersionKey) {
      (0, _util.error)('Invalid partition name.');
    }
  });

  // This is hot hot reloading.
  // We want to include new definitions in defaultState and new controller function definitions.
  var existingPartitionDefinitions = partitionDefinitions.filter(function (entry) {return (
      _typeof(findPartition(entry.partitionName)) !== undefinedString);});


  // Do not allow a partition with the same name as an existing partition.
  partitionDefinitions = partitionDefinitions.filter(function (entry) {return (
      _typeof(findPartition(entry.partitionName)) === undefinedString);});

  if (_store !== null) {
    // Hot reload.
    // Handle any new keys defined in defaultState
    // Handle any new controller functions also.
    existingPartitionDefinitions.forEach(function (entry) {
      // Handle new uiServiceFunctions.
      var p = findPartition(entry.partitionName);
      if (!(0, _util.shallowEqual)(p.uiServiceFunctions, entry.uiServiceFunctions)) {
        // Remove all the prior functions from the store.
        (0, _util.getKeys)(p.uiServiceFunctions).forEach(function (o) {
          delete _store[p.partitionName][o];
        });
        p.uiServiceFunctions = entry.uiServiceFunctions;
        // All ui service functions are made available in the partition store.
        // This way other modules can call them.
        (0, _util.getKeys)(p.uiServiceFunctions).forEach(function (o) {
          _store[p.partitionName][o] = p.uiServiceFunctions[o];
        });
      }
      var newObj = {};
      // New keys
      (0, _util.getKeys)(entry.defaultState).forEach(function (key) {
        // Found a newly defined key in entry.defaultState
        if (_typeof(_defaultState[entry.partitionName][key]) === undefinedString) {
          var val = entry.defaultState[key];
          p.defaultState[key] = val;
          _defaultState[entry.partitionName][key] = val;
          newObj[key] = val;
        }
      });
      // Add the news keys and their initial values to the store
      if ((0, _util.getKeys)(newObj).length > 0) {
        executeSetState(entry.partitionName, newObj, true);
      }
    });
    partitionDefinitions.forEach(function (entry) {
      _defaultState[entry.partitionName] = (0, _util.shallowCopy)(entry.defaultState);
      var action = {
        type: internalActionType,
        defaultState: entry.defaultState,
        partitionName: entry.partitionName };


      addPartitionInternal(entry);
      internalDispatch(action);
      _onAddParitionListeners.forEach(function (func) {return func(entry.partitionName);});
    });
  } else {
    _partitionDefinitions = _partitionDefinitions.concat(partitionDefinitions);
  }
}

// Subscribe to changes in a partition of the store. This can be done before and after createStore.
function subscribe(partitionName, listener, arrKeys, listenerName) {
  if (typeof listener !== 'function') {
    (0, _util.error)('subscribe listener argument is not a function.');
  }
  if (!Array.isArray(arrKeys)) {
    arrKeys = [arrKeys];
  }
  if (_store !== null) {
    if (_typeof(_store[partitionName]) === undefinedString) {
      (0, _util.error)(partitionName + ' is an invalid partition.');
    }
    _store[partitionName].subscribe(listener, arrKeys, listenerName);
  } else {
    _subscribers.push({ partitionName: partitionName, listener: listener, arrKeys: arrKeys, listenerName: listenerName });
  }
}

function uniqueKey(templateName) {
  if (!templateName) {
    templateName = _uniqueKeyTemplate;
  }
  var id = 0;
  var key = templateName;
  while (uniqueKeys[key]) {
    key = templateName + id.toString();
    ++id;
  }
  uniqueKeys[key] = true;
  return key;
}

//
// Allows the creation of module data that is proxied during development.
// This means changes to the data at the top level keys can be tracked by causality-redux and
// indicated to the caller using dataChangeListener.
//
var getModuleData = function getModuleData(DEBUG, defaultState, dataChangeListener) {
  if (DEBUG) {
    var partitionName = uniqueKey();
    if ((typeof defaultState === 'undefined' ? 'undefined' : _typeof(defaultState)) === undefinedString) {
      (0, _util.error)('defaultState is undefined.');
    }
    if (CausalityRedux.store === null) {
      (0, _util.error)('CausalityRedux not initialized.');
    }

    // Init the store partition
    CausalityRedux.addPartitions({ partitionName: partitionName, defaultState: defaultState });

    // Get the proxy to the data store.
    var moduleData = CausalityRedux.store[partitionName].partitionState;
    var moduleDataUnsubscribe = null;
    if (typeof dataChangeListener === 'function') {
      moduleDataUnsubscribe = CausalityRedux.store[partitionName].subscribe(dataChangeListener);
    }
    return { moduleData: moduleData, moduleDataUnsubscribe: moduleDataUnsubscribe, partitionName: partitionName };
  }

  return { moduleData: defaultState };
};

//
// Shallow copies the entire redux store and shallow copies the partitions.
//
var shallowCopyStorePartitions = function shallowCopyStorePartitions() {
  var store = CausalityRedux.store.getState();
  // Shallow copy the partitions.
  var storeCopy = CausalityRedux.shallowCopy(store);
  // Shallow copy each key in each partition.
  CausalityRedux.getKeys(storeCopy).forEach(function (key) {
    storeCopy[key] = CausalityRedux.shallowCopy(store[key]);
  });
  return storeCopy;
};

//
// The functions below allow co-existence with redux.
//
var reduxReducer = function reduxReducer(combineReducersFunction, state, action) {
  if (action[_causalityreduxAction]) {
    return generalReducer(state, action);
  }
  return (0, _util.merge)({}, state, combineReducersFunction(state, action));
};

// Call to ad a reducer object for lazy load.
var addReducers = function addReducers(reducers) {
  if (!_reduxStore) {
    (0, _util.error)('setReduxStore must be called before calling addReducers.');
  }
  _reduxReducers = (0, _util.merge)({}, _reduxReducers, reducers);
  var crReducer = function crReducer(state, action) {return reduxReducer((0, _combineReducers2.default)(_reduxReducers), state, action);};
  _reduxStore.replaceReducer(crReducer);
};

// Call this just afdter creating the redux store.
var setReduxStore = function setReduxStore(store, reducersObject, hydrate, options) {
  _reduxStore = store;
  if ((typeof reducersObject === 'undefined' ? 'undefined' : _typeof(reducersObject)) === undefined || !isObjectType(reducersObject)) {
    (0, _util.error)('Invalid reducers object.');
  }
  addReducers(reducersObject);
  var crStore = createStore([], hydrate, undefined, options);
  return crStore;
};

//
// Global store that can be used anywhere in the program.
//
var createGlobalStore = function createGlobalStore(defaultState) {
  var store = createStore({ partitionName: _globalDataKey, defaultState: defaultState });
  var globalStore = store[_globalDataKey];

  // globalPartitionState - Access and set individual key values in the global store.
  // globalSetState = Set multiple key values in the global store.
  // globalGetState - Get global store object.
  // globalSubscribe - Subscribe to changes to key values in the global store.
  // globalSubscribe(listener: function, globalStoreKeys = [], listenerName = '')
  // If globalStoreKeys == [] or undefined, listen to all keys in the global partition.

  return {
    globalStore: globalStore,
    globalPartitionState: globalStore.partitionState,
    globalSetState: globalStore.setState,
    globalGetState: globalStore.getState,
    globalSubscribe: globalStore.subscribe };

};

var CausalityRedux = {
  createStore: createStore,
  createGlobalStore: createGlobalStore,
  addPartitions: addPartitions,
  subscribe: subscribe,
  //
  // Do not call setOptions in hot reloadedable code.
  // The listener would be called for each time the module is loaded.
  //
  setOptions: setOptions,
  shallowEqual: _util.shallowEqual,
  shallowCopy: _util.shallowCopy,
  merge: _util.merge,
  getKeys: _util.getKeys,
  getModuleData: getModuleData,
  copyState: copyState,
  shallowCopyStorePartitions: shallowCopyStorePartitions,
  setReduxStore: setReduxStore,
  addReducers: addReducers,
  combineReducers: _combineReducers2.default,
  addPlugins: function addPlugins() {return (
      (0, _util.error)('addPlugins is deprecated. Use uiServiceFunctions and define a function there to replace addPlugins.'));},
  get operations() {
    return {};
  },
  get store() {
    return _store;
  },
  get reduxStore() {
    return _reduxStore;
  },
  get defaultState() {
    return _defaultState;
  },
  get partitionDefinitions() {
    return _partitionDefinitions;
  },
  get onListener() {
    return discloseToListeners;
  },
  get storeVersionKey() {
    return _storeVersionKey;
  },
  get globalDataKey() {
    return _globalDataKey;
  },
  get storeHistoryKey() {
    return _storeHistoryKey;
  },
  get reducer() {
    return generalReducer;
  },
  get globalStore() {
    return _store[_globalDataKey];
  } };exports.default =


CausalityRedux;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 4 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(process) {Object.defineProperty(exports, "__esModule", { value: true });exports.default =

combineReducers;var _util = __webpack_require__(0);function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if (process.env.NODE_ENV !== 'production') {
      if (typeof reducers[key] === 'undefined') {
        (0, _util.error)('No reducer provided for key "' + key + '"');
      }
    }

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  return function combination() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};var action = arguments[1];
    var hasChanged = false;
    var nextState = {};
    for (var _i = 0; _i < finalReducerKeys.length; _i++) {
      var _key = finalReducerKeys[_i];
      var reducer = finalReducers[_key];
      var previousStateForKey = state[_key];
      var nextStateForKey = reducer(previousStateForKey, action);
      nextState[_key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {var _causalityRedux = __webpack_require__(3);var _causalityRedux2 = _interopRequireDefault(_causalityRedux);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

if (typeof window !== 'undefined') {
  window['CausalityRedux'] = _causalityRedux2.default;
} else if (typeof global !== 'undefined') {
  global['CausalityRedux'] = _causalityRedux2.default;
}
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isObject = __webpack_require__(1);
var forIn = __webpack_require__(8);

function mixin(target, objects) {
  if (!isObject(target)) {
    throw new TypeError('mixin-object expects the first argument to be an object.');
  }
  var len = arguments.length, i = 0;
  while (++i < len) {
    var obj = arguments[i];
    if (isObject(obj)) {
      forIn(obj, copy, target);
    }
  }
  return target;
}

/**
 * copy properties from the source object to the
 * target object.
 *
 * @param  {*} `value`
 * @param  {String} `key`
 */

function copy(value, key) {
  this[key] = value;
}

/**
 * Expose `mixin`
 */

module.exports = mixin;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * for-in <https://github.com/jonschlinkert/for-in>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



module.exports = function forIn(obj, fn, thisArg) {
  for (var key in obj) {
    if (fn.call(thisArg, obj[key], key, obj) === false) {
      break;
    }
  }
};


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/


/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * shallow-clone <https://github.com/jonschlinkert/shallow-clone>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



var isObject = __webpack_require__(1);
var mixin = __webpack_require__(7);
var typeOf = __webpack_require__(11);

/**
 * Shallow copy an object, array or primitive.
 *
 * @param  {any} `val`
 * @return {any}
 */

function clone(val) {
  var type = typeOf(val);
  if (clone.hasOwnProperty(type)) {
    return clone[type](val);
  }
  return val;
}

clone.array = function cloneArray(arr) {
  return arr.slice();
};

clone.date = function cloneDate(date) {
  return new Date(+date);
};

clone.object = function cloneObject(obj) {
  if (isObject(obj)) {
    return mixin({}, obj);
  } else {
    return obj;
  }
};

clone.regexp = function cloneRegExp(re) {
  var flags = '';
  flags += re.multiline ? 'm' : '';
  flags += re.global ? 'g' : '';
  flags += re.ignorecase ? 'i' : '';
  return new RegExp(re.source, flags);
};

/**
 * Expose `clone`
 */

module.exports = clone;


/***/ }),
/* 11 */
/***/ (function(module, exports) {

var toString = Object.prototype.toString;

/**
 * Get the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*} Native javascript type
 */

module.exports = function kindOf(val) {
  var type = typeof val;

  // primitivies
  if (type === 'undefined') {
    return 'undefined';
  }
  if (val === null) {
    return 'null';
  }
  if (val === true || val === false || val instanceof Boolean) {
    return 'boolean';
  }
  if (type === 'string' || val instanceof String) {
    return 'string';
  }
  if (type === 'number' || val instanceof Number) {
    return 'number';
  }

  // functions
  if (type === 'function' || val instanceof Function) {
    if (typeof val.constructor.name !== 'undefined' && val.constructor.name.slice(0, 9) === 'Generator') {
      return 'generatorfunction';
    }
    return 'function';
  }

  // array
  if (typeof Array.isArray !== 'undefined' && Array.isArray(val)) {
    return 'array';
  }

  // check for instances of RegExp and Date before calling `toString`
  if (val instanceof RegExp) {
    return 'regexp';
  }
  if (val instanceof Date) {
    return 'date';
  }

  // other objects
  type = toString.call(val);

  if (type === '[object RegExp]') {
    return 'regexp';
  }
  if (type === '[object Date]') {
    return 'date';
  }
  if (type === '[object Arguments]') {
    return 'arguments';
  }
  if (type === '[object Error]') {
    return 'error';
  }
  if (type === '[object Promise]') {
    return 'promise';
  }

  // buffer
  if (isBuffer(val)) {
    return 'buffer';
  }

  // es6: Map, WeakMap, Set, WeakSet
  if (type === '[object Set]') {
    return 'set';
  }
  if (type === '[object WeakSet]') {
    return 'weakset';
  }
  if (type === '[object Map]') {
    return 'map';
  }
  if (type === '[object WeakMap]') {
    return 'weakmap';
  }
  if (type === '[object Symbol]') {
    return 'symbol';
  }
  
  if (type === '[object Map Iterator]') {
    return 'mapiterator';
  }
  if (type === '[object Set Iterator]') {
    return 'setiterator';
  }
  if (type === '[object String Iterator]') {
    return 'stringiterator';
  }
  if (type === '[object Array Iterator]') {
    return 'arrayiterator';
  }
  
  // typed arrays
  if (type === '[object Int8Array]') {
    return 'int8array';
  }
  if (type === '[object Uint8Array]') {
    return 'uint8array';
  }
  if (type === '[object Uint8ClampedArray]') {
    return 'uint8clampedarray';
  }
  if (type === '[object Int16Array]') {
    return 'int16array';
  }
  if (type === '[object Uint16Array]') {
    return 'uint16array';
  }
  if (type === '[object Int32Array]') {
    return 'int32array';
  }
  if (type === '[object Uint32Array]') {
    return 'uint32array';
  }
  if (type === '[object Float32Array]') {
    return 'float32array';
  }
  if (type === '[object Float64Array]') {
    return 'float64array';
  }

  // must be a plain object
  return 'object';
};

/**
 * If you need to support Safari 5-7 (8-10 yr-old browser),
 * take a look at https://github.com/feross/is-buffer
 */

function isBuffer(val) {
  return val.constructor
    && typeof val.constructor.isBuffer === 'function'
    && val.constructor.isBuffer(val);
}


/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = Redux;

/***/ })
/******/ ]);