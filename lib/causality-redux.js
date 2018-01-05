module.exports =
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
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};exports.




















shallowEqual = shallowEqual;exports.



















shallowCopy = shallowCopy;function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}var objectAssign = __webpack_require__(7);var shallowClone = __webpack_require__(8);var merge = exports.merge = typeof Object.assign === 'function' ? Object.assign : objectAssign;var error = exports.error = function error(msg) {throw new Error('CausalityRedux: ' + msg);};var getKeysWOSymbols = function getKeysWOSymbols(obj) {if (!obj) return [];return Object.keys(obj);};var getKeysWSymbols = function getKeysWSymbols(obj) {if (!obj) return [];return [].concat(_toConsumableArray(Object.keys(obj)), _toConsumableArray(Object.getOwnPropertySymbols(obj)));};var getKeys = getKeysWOSymbols;if (typeof Object.getOwnPropertySymbols === 'function') exports.getKeys = getKeys = getKeysWSymbols;exports.getKeys = getKeys;function shallowEqual(objA, objB) {if (objA === objB) return true;var keysA = getKeys(objA);var keysB = getKeys(objB);if (keysA.length !== keysB.length) return false;var hasOwn = Object.prototype.hasOwnProperty;for (var i = 0; i < keysA.length; i++) {if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {return false;}}return true;}function shallowCopy(obj) {
    if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return obj;
    return shallowClone(obj);
}

var proxyObjects = {};

var addProxyObject = function addProxyObject(partitionName, obj) {return (
        proxyObjects[partitionName] = obj);};

var proxyDefined = function proxyDefined() {return (
        typeof Proxy !== 'undefined');};

var handleAddKeysToProxyObject = exports.handleAddKeysToProxyObject = function handleAddKeysToProxyObject(store, partitionName, currentState, newState) {
    if (proxyDefined())
    return;
    getKeys(newState[partitionName]).forEach(function (key) {
        if (typeof currentState[partitionName][key] === 'undefined')
        defineProxyGetSet(proxyObjects[partitionName], store[partitionName], key);
    });
};

var getPartitionValue = function getPartitionValue(target, key) {
    return shallowCopy(target.getState()[key]);
};

var setPartitionValue = function setPartitionValue(target, key, value) {
    if (target.getState()[key] !== value)
    target.setState(_defineProperty({}, key, value), true);
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
    if (proxyDefined())
    return new Proxy(target, partitionProxyHandler);
    return simulateProxy(partitionName, target, defaultState);
};

//
// MDN code
//
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
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(10)))

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("redux");

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;}; /** @preserve © 2017 Andrew Banks ALL RIGHTS RESERVED */
var _redux = __webpack_require__(3);
var _util = __webpack_require__(0);
var _combineReducers = __webpack_require__(2);var _combineReducers2 = _interopRequireDefault(_combineReducers);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}
var operations = {
    STATE_COPY: 1,
    STATE_ARRAY_ADD: 2,
    STATE_ARRAY_DELETE: 3,
    STATE_ARRAY_ENTRY_MERGE: 4,
    STATE_OBJECT_MERGE: 5,
    STATE_TOGGLE: 6,
    STATE_FUNCTION_CALL: 7,
    STATE_SETTODEFAULTS: 8,
    STATE_INCREMENT: 9,
    STATE_DECREMENT: 10 };


var changerDefinitionKeys = [
'arguments',
'impliedArguments',
'type',
'operation',
'arrayName',
'keyIndexerName',
'keyName',
'arrayArgShape',
'pluginId',
'controllerFunction'];


var invalidChangerKeys = [
'setState',
'getState',
'subscribe',
'partitionState'];


var stateEntryValidKeys = [
'partitionName',
'defaultState',
'changers',
'reducers',
'changerDefinitions',
'controllerFunctions'];


var stateEntryRequiredKeys = [
'partitionName',
'defaultState'];


var pluginRequiredKeys = [
'pluginId'];


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
var _startState = null;
var _completionListeners = [];
var _subscribers = [];
var _plugins = [];
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

/*eslint-disable */
if ((typeof createReduxStore === 'undefined' ? 'undefined' : _typeof(createReduxStore)) === undefinedString) {
    if ((typeof Redux === 'undefined' ? 'undefined' : _typeof(Redux)) !== undefinedString) {
        createReduxStore = Redux.createStore;
    } else
    (0, _util.error)('Redux is undefined');
}
/*eslint-enable */

var objectType = function objectType(obj) {return Object.prototype.toString.call(obj).slice(8, -1);};

var makeReducerName = function makeReducerName(changerName) {return changerName + 'Reducer';};

var findPartition = function findPartition(partitionName) {
    var partition = CausalityRedux.partitionDefinitions.find(function (e) {return (
            partitionName === e.partitionName);});

    return partition;
};

var findPlugin = function findPlugin(pluginId) {
    var plugin = _plugins.find(function (e) {return (
            pluginId === e.pluginId);});

    return plugin;
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

var indicateStateChange = function indicateStateChange(partitionName, type, operation, prevState, nextState, changerName, reducerName, theirArgs, storeVersion) {
    if (_onStateChangeListeners.length > 0) {
        if (changerName === setStateChangerName)
        operation = setStateChangerName;
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

var internalExecuteChanger = function internalExecuteChanger(store, stateEntry, changerName, reducerName, changerArguments) {var _stateEntry$changers;
    var action = (_stateEntry$changers = stateEntry.changers)[changerName].apply(_stateEntry$changers, _toConsumableArray(changerArguments));
    // User defined changer. Check validity of the returned action object.
    if (_typeof(stateEntry.changerDefinitions[changerName]) === undefinedString) {
        if ((typeof action === 'undefined' ? 'undefined' : _typeof(action)) === undefinedString || objectType(action) !== 'Object') {
            (0, _util.error)('Changer ' + changerName + ' must return an action object.');
            return;
        }
        // This is operations.STATE_FUNCTION_CALL. No dispatch action is to be taken so no reducer.
    } else if ((typeof action === 'undefined' ? 'undefined' : _typeof(action)) === undefinedString)
    return;
    action.type = _typeof(action.type) === undefinedString ? '' : action.type;
    // Set the reducer so that it can be called in the generalReducer.
    action.reducer = stateEntry.reducers[reducerName];
    action.partitionName = stateEntry.partitionName;
    action.reducerName = reducerName;
    internalDispatch(action);
};

//
// Whenever a changer is called, this is actually what executes.
// It calls the actual changer and then stores info in the action object returned by the changer.
// The associated reducer is saved also so that the generalReducer can call it.
// Then redux dispatch is called.
//
var internalPartitionChanger = function internalPartitionChanger(store, stateEntry, changerName, reducerName) {
    return function () {
        internalExecuteChanger(store, stateEntry, changerName, reducerName, arguments);
    };
};

//
// This is called in the store partition to subscribe to changes to the partition.
//
var internalPartitionSubscriber = function internalPartitionSubscriber(partitionName) {
    return (
        // If stateEntries == [] or undefined, listen to all keys in the partition.
        function (listener) {var stateEntries = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];var listenerName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
            if (typeof listener !== 'function')
            (0, _util.error)('subscribe: first argument must be a function.');
            if (!Array.isArray(stateEntries))
            stateEntries = [stateEntries];

            var partition = findPartition(partitionName);
            stateEntries.forEach(function (se) {
                var found = false;
                if (_typeof(partition.defaultState[se]) !== undefinedString)
                found = true;else
                {
                    (0, _util.getKeys)(partition.changerDefinitions).forEach(function (key) {
                        if (key === se) {
                            if (stateEntries.length > 1)
                            (0, _util.error)('Can only subscribe to one changer event.');
                            found = true;
                        }
                    });
                }
                if (!found)
                throw se + ' is not a valid key in the state partition ' + partitionName + '.';
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
    if (!objectType(theArg))
    (0, _util.error)('The Argument to setState must be an object.');
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

var copyState = function copyState(stateToCopy) {
    if (!objectType(stateToCopy))
    (0, _util.error)('The Argument to copyState must be an object.');

    internalDispatch({ stateToCopy: stateToCopy, type: '' });
};

// setState for the partiton    
var internalPartitionSetState = function internalPartitionSetState(partitionName) {
    return function (theObjectArg, noCheckCompare) {
        executeSetState(partitionName, theObjectArg, noCheckCompare);
    };
};

var validateStateEntry = function validateStateEntry(stateEntry) {
    if (_typeof(stateEntry.partitionName) === undefinedString)
    (0, _util.error)('partitionName not found.');
    if (_typeof(stateEntry.defaultState) === undefinedString)
    (0, _util.error)('defaultState missing from entry: ' + stateEntry.partitionName);
};

//
// Each partition has access to the changers and its own subscribe, getState and setState functions
// with a partitionState proxy.
//
var setupPartition = function setupPartition(store, stateEntry) {
    validateStateEntry(stateEntry);
    var partitionName = stateEntry.partitionName;
    store[partitionName] = {};
    var partitionStoreObject = store[partitionName];
    (0, _util.getKeys)(stateEntry.changers).forEach(function (o) {
        var reducerName = makeReducerName(o);
        var isPlugin = _typeof(stateEntry.changerDefinitions[o]) !== undefinedString && _typeof(stateEntry.changerDefinitions[o].pluginId) !== undefinedString;
        if (!isPlugin) {
            if (_typeof(stateEntry.reducers[reducerName]) === undefinedString)
            (0, _util.error)('\'Reducer: ' + reducerName + ' not found.');
        }
        partitionStoreObject[o] = internalPartitionChanger(store, stateEntry, o, reducerName);
    });

    partitionStoreObject.subscribe = internalPartitionSubscriber(partitionName);
    partitionStoreObject.getState = internalPartitionGetState(store, partitionName);
    partitionStoreObject.setState = internalPartitionSetState(partitionName);
    partitionStoreObject.partitionState = (0, _util.getPartitionProxy)(partitionName, store[partitionName], stateEntry.defaultState);
};

var handleControllerFunctions = function handleControllerFunctions(entry) {
    if (entry.controllerFunctions) {
        if (!entry.changerDefinitions)
        entry.changerDefinitions = {};
        (0, _util.getKeys)(entry.controllerFunctions).forEach(function (functionEntry) {
            entry.changerDefinitions[functionEntry] = { operation: CausalityRedux.operations.STATE_FUNCTION_CALL, controllerFunction: entry.controllerFunctions[functionEntry] };
        });
    }
};

var buildStateEntryChangersAndReducers = function buildStateEntryChangersAndReducers(entry) {

    handleControllerFunctions(entry);

    if (!entry.changerDefinitions)
    return;

    var isArrayOperation = function isArrayOperation(arg) {return (
            arg === operations.STATE_ARRAY_ADD || arg === operations.STATE_ARRAY_DELETE || arg === operations.STATE_ARRAY_ENTRY_MERGE);};

    var checkArguments = function checkArguments(defaultState, changerName, changerArgs, theirArgs) {
        if (theirArgs.length !== changerArgs.length)
        (0, _util.error)('Incorrect number of arguments for ' + changerName + ' call.');

        for (var i = 0; i < theirArgs.length; ++i) {
            if (_typeof(defaultState[changerArgs[i]]) === undefinedString)
            (0, _util.error)('Invalid argument name "' + changerArgs[i] + '" for ' + changerName + ' call.');else
            {
                if (objectType(defaultState[changerArgs[i]]) !== 'Object') {
                    if (objectType(defaultState[changerArgs[i]]) !== objectType(theirArgs[i]))
                    (0, _util.error)('Incorrect argument type for argument #' + (i + 1) + ' for ' + changerName + ' call.');
                }
            }
        }
    };

    var compareArrayArgTypesForArray = function compareArrayArgTypesForArray(o1, o2) {
        var k1 = (0, _util.getKeys)(o1);
        var k2 = (0, _util.getKeys)(o2);
        var str = '';
        k1.some(function (key) {
            if (_typeof(o2[key]) === undefinedString)
            str = key + ' is missing in the first argument';else
            if (o1[key] !== objectType(o2[key]))
            str = 'Invalid type for ' + key + ' in the first argument';

            return str !== '';
        });
        if (str === '') {
            k2.some(function (key) {
                if (_typeof(o1[key]) === undefinedString)
                str = '\'' + key + '\' is an invalid field in the first argument';
                return str !== '';
            });
        }
        return str;
    };

    // Validates a changer entry in a partition definition.        
    var validateChangerArg = function validateChangerArg(o, changerArg) {
        (0, _util.getKeys)(changerArg).forEach(function (tag) {
            var valid = changerDefinitionKeys.some(function (keyName) {return (
                    tag === keyName);});

            if (!valid)
            (0, _util.error)(tag + ' is an invalid entry in ' + entry.partitionName + '.');
        });

        if (_typeof(changerArg.arguments) !== undefinedString) {
            if (!Array.isArray(changerArg.arguments))
            (0, _util.error)('\'arguments\' must be an array for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
        }

        if (isArrayOperation(changerArg.operation)) {
            if (_typeof(changerArg.keyIndexerName) !== undefinedString && _typeof(changerArg.keyName) === undefinedString)
            (0, _util.error)('The keyIndexerName is defined in ' + o + ' but keyName is not defined.');
            if (_typeof(entry.defaultState[changerArg.arrayName]) === undefinedString)
            (0, _util.error)('Missing the \'arrayName\' definition for entry \'' + o + '\' in partitionName = ' + entry.partitionName + '.');else
            if (!Array.isArray(entry.defaultState[changerArg.arrayName]))
            (0, _util.error)(changerArg.arrayName + ' is not an array for entry \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
        } else if (changerArg.operation === operations.STATE_TOGGLE) {
            if (_typeof(changerArg.impliedArguments) === undefinedString || changerArg.impliedArguments.length === 0)
            (0, _util.error)('impliedArguments is required for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
            changerArg.impliedArguments.forEach(function (e) {
                if (objectType(entry.defaultState[e]) !== 'Boolean')
                (0, _util.error)('The impliedArgument ' + e + ' is not Boolean as required by the Toggle operation in \'' + o + '\' of partitionName = ' + entry.partitionName + '.');
            });
        } else if (changerArg.operation === operations.STATE_INCREMENT || changerArg.operation === operations.STATE_DECREMENT) {
            if (_typeof(changerArg.impliedArguments) === undefinedString || changerArg.impliedArguments.length !== 1)
            (0, _util.error)('impliedArguments with 1 entry is required for \'' + o + '\' in stateName = ' + entry.stateName + '.');
            changerArg.impliedArguments.forEach(function (e) {
                if (objectType(entry.defaultState[e]) !== 'Number')
                (0, _util.error)('The impliedArgument ' + e + ' is not a Number as required by the ' + changerArg.operation + ' operation in \'' + o + '\' of partitionName = ' + entry.partitionName + '.');
            });
        } else if (changerArg.operation === operations.STATE_OBJECT_MERGE) {
            if (_typeof(changerArg.arguments) === undefinedString || changerArg.arguments.length === 0)
            (0, _util.error)('\'arguments\' is required for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
            if (changerArg.arguments.length !== 1)
            (0, _util.error)('STATE_OBJECT_MERGE allows only 1 argument for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
        } else if (changerArg.operation === operations.STATE_SETTODEFAULTS) {
            if (_typeof(changerArg.impliedArguments) === undefinedString || changerArg.impliedArguments.length === 0)
            (0, _util.error)('\'impliedArguments\' is required for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
        }
    };

    var buildChanger = function buildChanger(partitionName, changerName, changerArg) {
        return (
            function () {for (var _len = arguments.length, theirArgs = Array(_len), _key = 0; _key < _len; _key++) {theirArgs[_key] = arguments[_key];}
                var theArgs = [].concat(theirArgs);
                // This simply calls all those listening to the name of the changer
                if (changerArg.operation === operations.STATE_FUNCTION_CALL) {
                    var listenersToCall = [];
                    _listeners.forEach(function (listenerEntry) {
                        if (!Array.isArray(listenerEntry.stateEntries))
                        (0, _util.error)('Listenername=' + listenerEntry.listenerName + ', partitionName=' + listenerEntry.partitionName + ' is not an array.');

                        if (listenerEntry.partitionName === partitionName) {
                            listenerEntry.stateEntries.forEach(function (e) {
                                if (e === changerName)
                                listenersToCall.push(listenerEntry);
                            });
                        }
                    });
                    if (listenersToCall.length === 0)
                    (0, _util.error)('There is no subscriber to ' + changerName + ' in ' + partitionName + '.');
                    if (changerArg.impliedArguments) {
                        var state = _store[partitionName].getState();
                        if (state) {
                            var argObj = {};
                            changerArg.impliedArguments.forEach(function (entry) {
                                argObj[entry] = state[entry];
                            });
                            theArgs.push(argObj);
                        }
                    }
                    var nextState = { crFunctionCall: changerName, args: theArgs };
                    indicateStateChange(partitionName, changerName, changerArg.operation, {}, nextState, changerName, changerArg.reducerName, theArgs);
                    listenersToCall.forEach(function (listener) {
                        var name = listener.listenerName;
                        if (name === '')
                        name = changerName + ' called';
                        indicateListener(partitionName, nextState, name);
                        listener.listener.apply(listener, _toConsumableArray(theArgs));
                    });
                    // Indicates no reducer should be called and redux dispatch should not be called.
                    return undefined;
                }

                // Save important information in the action object
                var actionObj = {
                    changerName: changerName,
                    partitionName: partitionName,
                    theirArgs: theArgs,
                    type: _typeof(changerArg.type) === undefinedString ? changerName : changerArg.type,
                    arguments: _typeof(changerArg.arguments) === undefinedString ? [] : changerArg.arguments,
                    impliedArguments: _typeof(changerArg.impliedArguments) === undefinedString ? [] : changerArg.impliedArguments,
                    operation: _typeof(changerArg.operation) === undefinedString ? operations.STATE_COPY : changerArg.operation,
                    changerDefinition: changerArg };


                // A plugin only validates arguments. Its reducer will be called for the actual change.
                if (_typeof(changerArg.pluginId) !== undefinedString) {
                    var p = findPlugin(changerArg.pluginId);
                    if (typeof p.validateChangerArguments === 'function')
                    p.validateChangerArguments.apply(p, _toConsumableArray(theArgs));
                    actionObj.pluginCallback = p.pluginCallback;
                    return actionObj;
                }

                if (isArrayOperation(changerArg.operation)) {
                    if (changerArg.operation === operations.STATE_ARRAY_ADD) {
                        if (objectType(theArgs[0]) !== 'Object')
                        (0, _util.error)('STATE_ARRAY_ADD can only accept pure base objects. You must define your own changers and reducers for this object.');
                    }

                    if (changerArg.operation === operations.STATE_ARRAY_ADD || changerArg.operation === operations.STATE_ARRAY_DELETE) {
                        if (theArgs.length !== 1)
                        (0, _util.error)('Only one argument is allowed with ' + changerArg.operation + ' for entry \'' + changerName + '\' in partitionName = ' + entry.partitionName + '.');

                        if (changerArg.operation === operations.STATE_ARRAY_ADD && _typeof(changerArg.arrayArgShape) !== undefinedString) {
                            var str = compareArrayArgTypesForArray(changerArg.arrayArgShape, theArgs[0]);
                            if (str !== '')
                            (0, _util.error)(str + ' for ' + changerName);
                        }
                    } else {
                        if (theArgs.length !== 2)
                        (0, _util.error)('Two arguments are required with ' + changerArg.operation + ' for entry \'' + changerName + '\' in partitionName = ' + entry.partitionName + '.');
                        if (_typeof(changerArg.arrayArgShape) !== undefinedString) {
                            var _str = compareArrayArgTypesForArray(changerArg.arrayArgShape, theArgs[1]);
                            if (_str !== '')
                            (0, _util.error)(_str + ' for ' + changerName);
                        }
                    }
                    if (changerArg.operation === operations.STATE_ARRAY_DELETE || changerArg.operation === operations.STATE_ARRAY_ENTRY_MERGE)
                    actionObj.arrayArg = theArgs[0].toString();else

                    actionObj.arrayArg = theArgs[0];

                    actionObj.arrayEntryArg = theArgs[1];
                    actionObj.arrayName = changerArg.arrayName;
                    actionObj.keyIndexerName = changerArg.keyIndexerName;
                    actionObj.keyName = changerArg.keyName;
                } else if (changerArg.operation === operations.STATE_OBJECT_MERGE) {
                    if (theArgs.length !== 1)
                    (0, _util.error)('STATE_OBJECT_MERGE allows only 1 argument for ' + changerName + '.');
                    actionObj[actionObj.arguments[0]] = theArgs[0];
                } else if (changerArg.operation === operations.STATE_SETTODEFAULTS || changerArg.operation === operations.STATE_TOGGLE) {
                    if (theArgs.length !== 0)
                    (0, _util.error)(changerArg.operation + ' allows only 0 arguments for ' + changerName);
                } else if (changerArg.operation !== operations.STATE_FUNCTION_CALL) {
                    checkArguments(entry.defaultState, changerName, actionObj.arguments, theArgs);
                    if (theArgs.length > 0) {
                        for (var i = 0; i < theArgs.length; ++i) {
                            actionObj[actionObj.arguments[i]] = theArgs[i];
                        }
                    }
                }

                return actionObj;
            });

    };

    //
    // Supports internally defined operations.
    //
    var internalDefinedReducer = function internalDefinedReducer(changerName, changerArg) {
        return (
            function (state, action) {
                var newState = (0, _util.shallowCopy)(state);
                var newArray = [];
                var key = void 0,index = void 0;
                if (_typeof(action.operation) === undefinedString)
                action.operation = operations.STATE_COPY;

                // Below implements the reducers for the standard operations.
                switch (action.operation) {
                    case operations.STATE_COPY:
                        action.arguments.forEach(function (entry) {
                            newState[entry] = action[entry];
                        });
                        break;
                    case operations.STATE_TOGGLE:
                        action.impliedArguments.forEach(function (entry) {
                            newState[entry] = !newState[entry];
                        });
                        break;
                    case operations.STATE_INCREMENT:
                        action.impliedArguments.forEach(function (entry) {
                            newState[entry] = newState[entry] + 1;
                        });
                        break;
                    case operations.STATE_DECREMENT:
                        action.impliedArguments.forEach(function (entry) {
                            newState[entry] = newState[entry] - 1;
                        });
                        break;
                    case operations.STATE_SETTODEFAULTS:
                        changerArg.impliedArguments.forEach(function (argEntry) {
                            newState[argEntry] = _defaultState[action.partitionName][argEntry];
                        });
                        break;
                    case operations.STATE_ARRAY_ADD:
                        newArray = [].concat(_toConsumableArray(newState[action.arrayName]));
                        if (action.keyIndexerName) {
                            var nextIndex = parseInt(newState[action.keyIndexerName]) || 0;
                            action.arrayArg[action.keyName] = nextIndex.toString();
                            ++nextIndex;
                            newState[action.keyIndexerName] = nextIndex.toString();
                        }
                        newArray.push(action.arrayArg);
                        newState[action.arrayName] = newArray;
                        break;
                    case operations.STATE_ARRAY_DELETE:
                        newArray = newState[action.arrayName].filter(function (entry) {
                            if (_typeof(entry[action.keyName]) === undefinedString)
                            return false;
                            return entry[action.keyName].toString() !== action.arrayArg;
                        });
                        newState[action.arrayName] = newArray;
                        break;
                    case operations.STATE_ARRAY_ENTRY_MERGE:
                        newArray = [].concat(_toConsumableArray(newState[action.arrayName]));
                        index = newArray.findIndex(function (entry) {
                            if (_typeof(entry[action.keyName]) === undefinedString)
                            return false;
                            return entry[action.keyName].toString() === action.arrayArg;
                        });
                        if (index >= 0) {
                            newArray[index] = (0, _util.merge)({}, newArray[index], action.arrayEntryArg);
                            newState[action.arrayName] = newArray;
                        }
                        break;
                    case operations.STATE_OBJECT_MERGE:
                        key = action.arguments[0];
                        newState[key] = (0, _util.merge)({}, newState[key], action[key]);
                        break;
                    default:
                        (0, _util.error)('Unknown operation entry in ' + changerName + '.');}

                return newState;
            });

    };

    if (_typeof(entry.changers) === undefinedString)
    entry.changers = {};

    if (_typeof(entry.reducers) === undefinedString)
    entry.reducers = {};

    //
    // Setup the internal changers and reducers.
    //
    (0, _util.getKeys)(entry.changerDefinitions).forEach(function (o) {
        var changerArg = entry.changerDefinitions[o];
        if ((typeof changerArg === 'undefined' ? 'undefined' : _typeof(changerArg)) === undefinedString)
        (0, _util.error)('Changer definition argument for ' + o + ' must be defined');

        validateChangerArg(o, changerArg);

        // Make the changer            
        entry.changers[o] = buildChanger(entry.partitionName, o, changerArg);

        var reducerName = makeReducerName(o);

        // No reducer, define one.
        if (_typeof(entry.reducers[reducerName]) === undefinedString) {
            // Plugin reducer
            if (_typeof(changerArg.pluginId) !== undefinedString)
            entry.reducers[reducerName] = findPlugin(changerArg.pluginId).reducer;
            // Auto build reducer
            else
                entry.reducers[reducerName] = internalDefinedReducer(o, changerArg);
        }
    });
};

function validatePartition(stateEntry) {
    var changerKeys = [];
    if (_typeof(stateEntry.changerDefinitions) !== undefinedString)
    changerKeys = (0, _util.getKeys)(stateEntry.changerDefinitions);
    if (_typeof(stateEntry.changers) !== undefinedString)
    changerKeys = [].concat(_toConsumableArray(changerKeys), _toConsumableArray((0, _util.getKeys)(stateEntry.changers)));

    changerKeys.forEach(function (e) {
        var found = invalidChangerKeys.some(function (e2) {return e2 === e;});
        if (found)
        (0, _util.error)(e + ' is an invalid changer name.');
    });

    stateEntryRequiredKeys.forEach(function (entry) {
        if (_typeof(stateEntry[entry]) === undefinedString)
        (0, _util.error)(entry + ' is a required entry in ' + stateEntry.partitionName + '.');
    });

    (0, _util.getKeys)(stateEntry).forEach(function (o) {
        var isvalid = stateEntryValidKeys.some(function (entry) {return (
                o === entry);});

        if (!isvalid)
        (0, _util.error)(o + ' is not a valid entry in ' + stateEntry.partitionName + '.');
    });

    changerKeys.forEach(function (e) {
        var cd = stateEntry.changerDefinitions[e];
        if ((typeof cd === 'undefined' ? 'undefined' : _typeof(cd)) !== undefinedString) {
            var pluginId = cd.pluginId;
            if ((typeof pluginId === 'undefined' ? 'undefined' : _typeof(pluginId)) !== undefinedString) {
                var p = findPlugin(pluginId);
                if ((typeof p === 'undefined' ? 'undefined' : _typeof(p)) === undefinedString)
                (0, _util.error)('Plugin with id ' + pluginId + ' is not defined');
                if (typeof p.validatePartitionEntry === 'function')
                p.validatePartitionEntry(cd);
            }
        }
    });
}

function addPartitionInternal(partitionDefinition) {
    _partitionDefinitions.push(partitionDefinition);
    validatePartition(partitionDefinition);
    buildStateEntryChangersAndReducers(partitionDefinition);
    setupPartition(_store, partitionDefinition);
}

//
// Do not call this in hot reloadedable code.
// The listener would be called for each time the module is loaded.
//
function setOptions() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (options.onStateChange) {
        if (typeof options.onStateChange !== 'function')
        (0, _util.error)('options.onStateChange must be a function.');
        _onStateChangeListeners.push(options.onStateChange);
    }

    if (options.onGlobalStateChange) {
        if (typeof options.onGlobalStateChange !== 'function')
        (0, _util.error)('options.onGlobalStateChange must be a function.');
        _onGlobalStateChangeListeners.push(options.onGlobalStateChange);
    }

    if (options.onListener) {
        if (typeof options.onListener !== 'function')
        (0, _util.error)('options.onListener must be a function.');
        _onListenerListeners.push(options.onListener);
    }
}

//
// This is the general reducer for redux. When a changer is called, the reducer for the changer was placed
// in the action object so it is known what reducer to call in the code below.
//
var generalReducer = function generalReducer() {var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaultState;var action = arguments[1];
    //
    // The _startState is needed for the base case of listeners to determine whether a change occurred to some value in the partition.
    // We can't just use _defaultState because of possible hydration. 
    //
    if (!_startState)
    _startState = (0, _util.shallowCopy)(state);

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
                if (_typeof(newState[action.partitionName][key]) === undefinedString)
                newState[action.partitionName][key] = action.defaultState[key];
            });
        }
        if (_typeof(_startState[action.partitionName]) === undefinedString) {
            _startState[action.partitionName] = (0, _util.shallowCopy)(action.defaultState);
        } else {
            // This is for a pre-hydrated state.
            (0, _util.getKeys)(action.defaultState).forEach(function (key) {
                if (_typeof(_startState[action.partitionName][key]) === undefinedString)
                _startState[action.partitionName][key] = action.defaultState[key];
            });
        }
        if (_typeof(newState[_storeVersionKey]) === undefinedString)
        newState[_storeVersionKey] = 0;
        return newState;
    }
    // This handles a redux hydration.           
    if (action.type === internalReduxActionType) {
        return (0, _util.merge)({}, state, action.defaultState);
    }

    // Call the reducer for the associated changer on the partition state.
    if (action.isSetState)
    newState[action.partitionName] = (0, _util.merge)({}, state[action.partitionName], action.theirArgs[0]);else
    if (typeof action.reducer === 'function')
    newState[action.partitionName] = action.reducer(state[action.partitionName], action);else
    if (typeof action.pluginCallback === 'function') {
        // The plugin might set a redux store value which is illegal while in the reducer.
        // So, use a setTimeout so that we are guaranteed to not be in this reducer.
        setTimeout.apply(undefined, [action.pluginCallback, 1].concat(_toConsumableArray(action.theirArgs)));
        return state;
    } else
    return state; // This is for the redux init   

    //
    // Check to see if anything is different. If not, just return the original state.
    // This is shallow equal. It determines equality only on the keys of state.
    // So, if a state entry at a key is a basic type, then equality is performed.
    // If the entry is an object, only pointer equality is checked. Lower objects may be different
    // and an array that had an element pushed directly in the redux store object  will not regester as a change.
    // A noCheckCompare on setState is allowed to proceed unchecked.
    //
    if (!action.noCheckCompare && (0, _util.shallowEqual)(newState[action.partitionName], state[action.partitionName]))
    return state;

    // This only applies to ancient browsers.
    (0, _util.handleAddKeysToProxyObject)(_store, action.partitionName, state, newState);

    _partitionsThatChanged[action.partitionName] = true;

    if (_typeof(newState[_storeVersionKey]) === undefinedString)
    newState[_storeVersionKey] = 0;
    ++newState[_storeVersionKey];

    // For all listeners, disclose a state change.
    indicateStateChange(action.partitionName, action.type, action.operation, state[action.partitionName], newState[action.partitionName], action.changerName, action.reducerName, action.theirArgs, newState[_storeVersionKey]);
    indicateGlobalStateChange(newState, false);
    // This is used to determine what partition listeners are involved in this change.           
    return newState;
};


function init(partitionDefinitions, preloadedState, enhancer) {var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

    if ((typeof partitionDefinitions === 'undefined' ? 'undefined' : _typeof(partitionDefinitions)) === undefinedString)
    (0, _util.error)('Missing first parameter partitionDefinitions.');
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
                        // Determine what entries in the partition changed.
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
    } else
    newObj = undefined;

    if (!_reduxStore)
    _reduxStore = createReduxStore(generalReducer, newObj, enhancer);else
    {
        if (newObj) {
            _startState = newObj;
            var action = {
                type: internalReduxActionType,
                defaultState: newObj };

            _store = _reduxStore;
            internalDispatch(action);
        }
    }

    _store = Object.create(_reduxStore);
    _store.subscribe(generalListener);

    partitionDefinitions.forEach(function (entry) {
        addPartitionInternal(entry);
    });
}

// Make sure the plugin has the required keys.    
var verifyPlugin = function verifyPlugin(plugin) {
    pluginRequiredKeys.forEach(function (e) {
        if (_typeof(plugin[e]) === undefinedString)
        (0, _util.error)('Key ' + e + ' is missing from the plugin.');
        if (typeof plugin.reducer !== 'function' && typeof plugin.pluginCallback !== 'function')
        (0, _util.error)('The plugin must have either a reducer function or a pluginCallback function.');
    });
};

// creates the causality-redux store.
function createStore() {var partitionDefinitions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];var preloadedState = arguments[1];var enhancer = arguments[2];var options = arguments[3];

    if (!Array.isArray(partitionDefinitions))
    partitionDefinitions = [partitionDefinitions];
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
    // call all those that called onStoreCreated with a listener for the store being created.
    _completionListeners.forEach(function (e) {return e();});
    _completionListeners = [];
    // Add the subscribers that had subscribed before the store was created.
    _subscribers.forEach(function (e) {
        if (_typeof(_store[e.partitionName]) === undefinedString)
        (0, _util.error)('${e.partitionName} is an invalid partition.');
        _store[e.partitionName].subscribe(e.listener, e.arrKeys, e.listenerName);
    });
    _subscribers = [];
    return _store;
}

// Add partitions. This allows partitions to be added before and after createStore.
// It also does not allow the same partition name to be included twice.
function addPartitions(partitionDefinitions) {
    if (!Array.isArray(partitionDefinitions))
    partitionDefinitions = [partitionDefinitions];

    partitionDefinitions.forEach(function (entry) {
        if (entry.partitionName === _storeVersionKey)
        (0, _util.error)('Invalid partition name.');
    });

    // This is fot hot reloading.
    // We want to include new definitions in defaultState and new controller function definitions.
    var existingPartitionDefinitions = partitionDefinitions.filter(function (entry) {return (
            _typeof(findPartition(entry.partitionName)) !== undefinedString);});


    // Do not allow a partition with the same name as an existing partition.
    partitionDefinitions = partitionDefinitions.filter(function (entry) {return (
            _typeof(findPartition(entry.partitionName)) === undefinedString);});

    if (_store !== null) {
        // Hot reload.
        // Handle any new keys defined in defaultState
        // Handle any new controll functions also.
        existingPartitionDefinitions.forEach(function (entry) {
            // Handle new controller functions.
            var p = findPartition(entry.partitionName);
            if (!(0, _util.shallowEqual)(p.controllerFunctions, entry.controllerFunctions)) {
                p.controllerFunctions = entry.controllerFunctions;
                buildStateEntryChangersAndReducers(p);
                (0, _util.getKeys)(p.changers).forEach(function (o) {
                    _store[p.partitionName][o] = internalPartitionChanger(_store, p, o, makeReducerName(o));
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
        });
    } else {
        _partitionDefinitions = _partitionDefinitions.concat(partitionDefinitions);
    }
}

//
// Allows adding plugins to extend the basic operations.
// pluginObj has the following entries:
//
// .pluginId, unique id for the plugin. Use a symbol.
// .validatePartitionEntry(changerDefinitionEntry) [Optional] - A function to verify that the user correctly
//  provided all the keys that you require for your changerDefinitionEntry. Throw exception on failure.
// .validateChangerArguments(...theirArgs) [Optional] , this is called for you to verify that their arguments for your changer meet
//  your requirements. Check types and number of arguments. Throw an exception if error.
// .pluginCallback(...theirArgs). Your plugin's function to call with their arguments.
// .reducer . Your plugin's reducer to call.
// .partitionDefinitions [Optional] - The state partitions defined with the plugin.
// .onStoreCreated [Optional] - Callback for onStoreCreated
//
function addPlugins(pluginObjs) {
    if (!Array.isArray(pluginObjs))
    pluginObjs = [pluginObjs];

    pluginObjs.forEach(function (pluginObj) {
        // Remove the plugin if it is already installed.
        // This is for hot reloading.
        _plugins = _plugins.filter(function (e) {return (
                pluginObj.pluginId !== e.pluginId);});

        verifyPlugin(pluginObj);
        _plugins.push(pluginObj);
        if (_typeof(pluginObj.partitionDefinitions) !== undefinedString)
        CausalityRedux.addPartitions(pluginObj.partitionDefinitions);
        if (typeof pluginObj.onStoreCreated === 'function')
        CausalityRedux.onStoreCreated(pluginObj.onStoreCreated);
    });
}

// Subscribe to changes in a partition of the store. This can be done before and after createStore.
function subscribe(partitionName, listener, arrKeys, listenerName) {
    if (typeof listener !== 'function')
    (0, _util.error)('subscribe listener argument is not a function.');
    if (!Array.isArray(arrKeys))
    arrKeys = [arrKeys];
    if (_store !== null) {
        if (_typeof(_store[partitionName]) === undefinedString)
        (0, _util.error)('${partitionName} is an invalid partition.');
        _store[partitionName].subscribe(listener, arrKeys, listenerName);
    } else
    _subscribers.push({ partitionName: partitionName, listener: listener, arrKeys: arrKeys, listenerName: listenerName });
}

// Use this to initialize your business logic when you don't know when the store is created.
// This way, when the completionListener is called you can guarantee that your store partition is defined. 
function onStoreCreated(completionListener) {
    if (typeof completionListener !== 'function')
    (0, _util.error)('onStoreCreated argument is not a function.');
    if (_store !== null)
    completionListener();else

    _completionListeners.push(completionListener);
}


function uniqueKey(templateName) {
    if (!templateName)
    templateName = _uniqueKeyTemplate;
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
        if ((typeof defaultState === 'undefined' ? 'undefined' : _typeof(defaultState)) === undefinedString)
        (0, _util.error)('defaultState is undefined.');
        if (CausalityRedux.store === null)
        (0, _util.error)('CausalityRedux not initialized.');

        // Init the store partition
        CausalityRedux.addPartitions({ partitionName: partitionName, defaultState: defaultState });

        // Get the proxy to the data store.    
        var moduleData = CausalityRedux.store[partitionName].partitionState;
        var moduleDataUnsubscribe = null;
        if (typeof dataChangeListener === 'function')
        moduleDataUnsubscribe = CausalityRedux.store[partitionName].subscribe(dataChangeListener);
        return { moduleData: moduleData, moduleDataUnsubscribe: moduleDataUnsubscribe, partitionName: partitionName };
    }

    return { moduleData: defaultState };
};

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

var reduxReducer = function reduxReducer(combineReducersFunction, state, action) {
    if (action[_causalityreduxAction])
    return generalReducer(state, action);
    return (0, _util.merge)({}, state, combineReducersFunction(state, action));
};

var addReducers = function addReducers(reducers) {
    if (!_reduxStore)
    (0, _util.error)('setReduxStore must be called before calling addReducers.');
    _reduxReducers = (0, _util.merge)({}, _reduxReducers, reducers);
    var crReducer = function crReducer(state, action) {return reduxReducer((0, _combineReducers2.default)(_reduxReducers), state, action);};
    _reduxStore.replaceReducer(crReducer);
};

var setReduxStore = function setReduxStore(store, reducersObject, hydrate, options) {
    _reduxStore = store;
    if ((typeof reducersObject === 'undefined' ? 'undefined' : _typeof(reducersObject)) === undefined)
    (0, _util.error)('Invalid reducers object.');
    addReducers(reducersObject);
    var crStore = createStore([], hydrate, undefined, options);
    return crStore;
};

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
    addPlugins: addPlugins,
    subscribe: subscribe,
    onStoreCreated: onStoreCreated,
    //
    // Do not call setOptions in hot reloadedable code.
    // The listener would be called for each time the module is loaded.
    //
    setOptions: setOptions,
    shallowEqual: _util.shallowEqual,
    shallowCopy: _util.shallowCopy,
    merge: _util.merge,
    getKeys: _util.getKeys,
    operations: operations,
    getModuleData: getModuleData,
    copyState: copyState,
    shallowCopyStorePartitions: shallowCopyStorePartitions,
    setReduxStore: setReduxStore,
    addReducers: addReducers,
    combineReducers: _combineReducers2.default,
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

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var isObject = __webpack_require__(1);
var forIn = __webpack_require__(6);

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
/* 6 */
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
/* 7 */
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
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*!
 * shallow-clone <https://github.com/jonschlinkert/shallow-clone>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



var isObject = __webpack_require__(1);
var mixin = __webpack_require__(5);
var typeOf = __webpack_require__(9);

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
/* 9 */
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
/* 10 */
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


/***/ })
/******/ ]);