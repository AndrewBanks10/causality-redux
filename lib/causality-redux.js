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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};exports.

















shallowEqual = shallowEqual;exports.



















shallowCopy = shallowCopy;function _defineProperty(obj, key, value) {if (key in obj) {Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });} else {obj[key] = value;}return obj;}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}var objectAssign = __webpack_require__(3);exports.objectAssign = objectAssign;var getKeysWOSymbols = function getKeysWOSymbols(obj) {if (!obj) return [];return Object.keys(obj);};var getKeysWSymbols = function getKeysWSymbols(obj) {if (!obj) return [];return [].concat(_toConsumableArray(Object.keys(obj)), _toConsumableArray(Object.getOwnPropertySymbols(obj)));};var getKeys = getKeysWOSymbols;if (typeof Object.getOwnPropertySymbols === 'function') exports.getKeys = getKeys = getKeysWSymbols;exports.getKeys = getKeys;function shallowEqual(objA, objB) {if (objA === objB) return true;var keysA = getKeys(objA);var keysB = getKeys(objB);if (keysA.length !== keysB.length) return false;var hasOwn = Object.prototype.hasOwnProperty;for (var i = 0; i < keysA.length; i++) {if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {return false;}}return true;}function shallowCopy(obj) {
    if (!obj || (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') return obj;
    if (Array.isArray(obj))
    return [].concat(_toConsumableArray(obj));

    var copy = {};
    getKeys(obj).forEach(function (key) {return (
            copy[key] = obj[key]);});

    return copy;
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
    var toClone = target.getState()[key];
    return toClone instanceof Object ? shallowCopy(toClone) : toClone;
};

var setPartitionValue = function setPartitionValue(target, key, value) {
    if (target.getState()[key] !== value)
    target.setState(_defineProperty({}, key, value));
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

var simulateProxy = function simulateProxy(partitionName, target) {
    var obj = {};
    getKeys(target.getState()).forEach(function (key) {
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


var getPartitionProxy = exports.getPartitionProxy = function getPartitionProxy(partitionName, target) {
    if (proxyDefined())
    return new Proxy(target, partitionProxyHandler);
    return simulateProxy(partitionName, target);
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
/***/ (function(module, exports) {

module.exports = require("Redux");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;}; /** @preserve © 2017 Andrew Banks ALL RIGHTS RESERVED */
var _redux = __webpack_require__(1);
var _util = __webpack_require__(0);function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}

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
'pluginId'];


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
'changerDefinitions'];


var stateEntryRequiredKeys = [
'partitionName',
'defaultState'];


var pluginRequiredKeys = [
'pluginId'];


var undefinedString = 'undefined';

var _defaultState = {};

var internalActionType = '@@causality-redux/INIT';

var setStateChangerName = 'setState';

var _store = null;
var _reduxStore = null;
var _partitionsThatChanged = {};
var _listeners = [];
var _subscriberId = 0;
var _partitionDefinitions = [];
var _onStateChangeListeners = [];
var _onListenerListeners = [];
var _startState = null;
var _completionListeners = [];
var _subscribers = [];
var _plugins = [];

var createReduxStore = void 0;
if ((typeof _redux.createStore === 'undefined' ? 'undefined' : _typeof(_redux.createStore)) !== undefinedString) {
    createReduxStore = _redux.createStore;
}

/*eslint-disable */
if ((typeof createReduxStore === 'undefined' ? 'undefined' : _typeof(createReduxStore)) === undefinedString) {
    if ((typeof Redux === 'undefined' ? 'undefined' : _typeof(Redux)) !== undefinedString) {
        createReduxStore = Redux.createStore;
    } else
    error('Redux is undefined');
}
/*eslint-enable */

var error = function error(msg) {throw new Error('CausalityRedux: ' + msg);};

var merge = typeof Object.assign === 'function' ? Object.assign : _util.objectAssign;

var objectType = function objectType(obj) {return Object.prototype.toString.call(obj).slice(8, -1);};

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

var indicateStateChange = function indicateStateChange(partitionName, type, operation, prevState, nextState, changerName, reducerName, theirArgs) {
    if (_onStateChangeListeners.length > 0) {
        if (changerName === setStateChangerName)
        operation = setStateChangerName;
        var obj = {
            partitionName: partitionName.toString(),
            type: type,
            operation: (typeof operation === 'undefined' ? 'undefined' : _typeof(operation)) === undefinedString ? 'User defined' : operation,
            prevState: prevState,
            nextState: nextState,
            changerName: changerName,
            reducerName: reducerName,
            args: theirArgs };

        discloseStateChange(obj);
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

// Can only subscribe as a listener on a partition.  
var internalSubscriber = function internalSubscriber(listener, partitionName, stateEntries, listenerName) {
    var arr = merge([], stateEntries);
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
            error('Changer ' + changerName + ' must return an action object.');
            return;
        }
        // This is operations.STATE_FUNCTION_CALL. No dispatch action is to be taken.
    } else if ((typeof action === 'undefined' ? 'undefined' : _typeof(action)) === undefinedString)
    return;
    action.type = _typeof(action.type) === undefinedString ? '' : action.type;
    // Set the reducer so that it can be called in the generalReducer.
    action.reducer = stateEntry.reducers[reducerName];
    action.partitionName = stateEntry.partitionName;
    action.reducerName = reducerName;
    // redux dispatch
    store.dispatch(action);
};

var executeChanger = function executeChanger(partitionName, changerName, reducerName, changerArguments) {
    if (changerName === setStateChangerName) {
        executeSetState(partitionName, changerArguments[0]);
        return;
    }
    var partition = findPartition(partitionName);
    if (!partition)
    return;
    internalExecuteChanger(_store, partition, changerName, reducerName, changerArguments);
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
            error('subscribe: first argument must be a function.');
            if (!Array.isArray(stateEntries))
            error('subscribe: the 2nd argument must be an array of keys to listen on.');

            var partition = findPartition(partitionName);
            stateEntries.forEach(function (se) {
                var found = false;
                if (_typeof(partition.defaultState[se]) !== undefinedString)
                found = true;else
                {
                    (0, _util.getKeys)(partition.changerDefinitions).forEach(function (key) {
                        if (key === se) {
                            if (stateEntries.length > 1)
                            error('Can only subscribe to one changer event.');
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

var executeSetState = function executeSetState(partitionName, theArg) {
    if (!objectType(theArg))
    error('The Argument to setState must be an object.');
    var actionObj = {
        theirArgs: [theArg],
        isSetState: true,
        arguments: [],
        type: setStateChangerName,
        changerName: setStateChangerName,
        partitionName: partitionName };

    _store.dispatch(actionObj);
};

// setState for the partiton    
var internalPartitionSetState = function internalPartitionSetState(partitionName) {
    return function (theArg) {
        executeSetState(partitionName, theArg);
    };
};

var validateStateEntry = function validateStateEntry(stateEntry) {
    if (_typeof(stateEntry.partitionName) === undefinedString)
    error('partitionName not found.');
    if (_typeof(stateEntry.defaultState) === undefinedString)
    error('defaultState missing from entry: ' + stateEntry.partitionName);
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
        var reducerName = o + 'Reducer';
        var isPlugin = _typeof(stateEntry.changerDefinitions[o]) !== undefinedString && _typeof(stateEntry.changerDefinitions[o].pluginId) !== undefinedString;
        if (!isPlugin) {
            if (_typeof(stateEntry.reducers[reducerName]) === undefinedString)
            error('\'Reducer: ' + reducerName + ' not found.');
        }
        partitionStoreObject[o] = internalPartitionChanger(store, stateEntry, o, reducerName);
    });

    partitionStoreObject.subscribe = internalPartitionSubscriber(partitionName);
    partitionStoreObject.getState = internalPartitionGetState(store, partitionName);
    partitionStoreObject.setState = internalPartitionSetState(partitionName);
    partitionStoreObject.partitionState = (0, _util.getPartitionProxy)(partitionName, store[partitionName]);
};

var buildStateEntryChangersAndReducers = function buildStateEntryChangersAndReducers(entry) {
    if (!entry.changerDefinitions)
    return;

    var isArrayOperation = function isArrayOperation(arg) {return (
            arg === operations.STATE_ARRAY_ADD || arg === operations.STATE_ARRAY_DELETE || arg === operations.STATE_ARRAY_ENTRY_MERGE);};

    var checkArguments = function checkArguments(defaultState, changerName, changerArgs, theirArgs) {
        if (theirArgs.length !== changerArgs.length)
        error('Incorrect number of arguments for ' + changerName + ' call.');

        for (var i = 0; i < theirArgs.length; ++i) {
            if (_typeof(defaultState[changerArgs[i]]) === undefinedString)
            error('Invalid argument name "' + changerArgs[i] + '" for ' + changerName + ' call.');else
            {
                if (objectType(defaultState[changerArgs[i]]) !== 'Object') {
                    if (objectType(defaultState[changerArgs[i]]) !== objectType(theirArgs[i]))
                    error('Incorrect argument type for argument #' + (i + 1) + ' for ' + changerName + ' call.');
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
            error(tag + ' is an invalid entry in ' + entry.partitionName + '.');
        });

        if (_typeof(changerArg.arguments) !== undefinedString) {
            if (!Array.isArray(changerArg.arguments))
            error('\'arguments\' must be an array for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
        }

        if (isArrayOperation(changerArg.operation)) {
            if (_typeof(changerArg.keyIndexerName) !== undefinedString && _typeof(changerArg.keyName) === undefinedString)
            error('The keyIndexerName is defined in ' + o + ' but keyName is not defined.');
            if (_typeof(entry.defaultState[changerArg.arrayName]) === undefinedString)
            error('Missing the \'arrayName\' definition for entry \'' + o + '\' in partitionName = ' + entry.partitionName + '.');else
            if (!Array.isArray(entry.defaultState[changerArg.arrayName]))
            error(changerArg.arrayName + ' is not an array for entry \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
        } else if (changerArg.operation === operations.STATE_TOGGLE) {
            if (_typeof(changerArg.impliedArguments) === undefinedString || changerArg.impliedArguments.length === 0)
            error('impliedArguments is required for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
            changerArg.impliedArguments.forEach(function (e) {
                if (objectType(entry.defaultState[e]) !== 'Boolean')
                error('The impliedArgument ' + e + ' is not Boolean as required by the Toggle operation in \'' + o + '\' of partitionName = ' + entry.partitionName + '.');
            });
        } else if (changerArg.operation === operations.STATE_INCREMENT || changerArg.operation === operations.STATE_DECREMENT) {
            if (_typeof(changerArg.impliedArguments) === undefinedString || changerArg.impliedArguments.length !== 1)
            error('impliedArguments with 1 entry is required for \'' + o + '\' in stateName = ' + entry.stateName + '.');
            changerArg.impliedArguments.forEach(function (e) {
                if (objectType(entry.defaultState[e]) !== 'Number')
                error('The impliedArgument ' + e + ' is not a Number as required by the ' + changerArg.operation + ' operation in \'' + o + '\' of partitionName = ' + entry.partitionName + '.');
            });
        } else if (changerArg.operation === operations.STATE_OBJECT_MERGE) {
            if (_typeof(changerArg.arguments) === undefinedString || changerArg.arguments.length === 0)
            error('\'arguments\' is required for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
            if (changerArg.arguments.length !== 1)
            error('STATE_OBJECT_MERGE allows only 1 argument for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
        } else if (changerArg.operation === operations.STATE_SETTODEFAULTS) {
            if (_typeof(changerArg.impliedArguments) === undefinedString || changerArg.impliedArguments.length === 0)
            error('\'impliedArguments\' is required for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
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
                        error('Listenername=' + listenerEntry.listenerName + ', partitionName=' + listenerEntry.partitionName + ' is not an array.');

                        listenerEntry.stateEntries.forEach(function (e) {
                            if (e === changerName)
                            listenersToCall.push(listenerEntry);
                        });
                    });
                    if (listenersToCall.length === 0)
                    error('There is no subscriber to ' + changerName + ' in ' + partitionName + '.');
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
                    var nextState = { functionArguments: theArgs };
                    indicateStateChange(partitionName, changerName, changerArg.operation, {}, nextState, changerName, changerArg.reducerName, theArgs);
                    listenersToCall.forEach(function (listener) {
                        indicateListener(partitionName, nextState, listener.listenerName);
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
                        error('STATE_ARRAY_ADD can only accept pure base objects. You must define your own changers and reducers for this object.');
                    }

                    if (changerArg.operation === operations.STATE_ARRAY_ADD || changerArg.operation === operations.STATE_ARRAY_DELETE) {
                        if (theArgs.length !== 1)
                        error('Only one argument is allowed with ' + changerArg.operation + ' for entry \'' + changerName + '\' in partitionName = ' + entry.partitionName + '.');

                        if (changerArg.operation === operations.STATE_ARRAY_ADD && _typeof(changerArg.arrayArgShape) !== undefinedString) {
                            var str = compareArrayArgTypesForArray(changerArg.arrayArgShape, theArgs[0]);
                            if (str !== '')
                            error(str + ' for ' + changerName);
                        }
                    } else {
                        if (theArgs.length !== 2)
                        error('Two arguments are required with ' + changerArg.operation + ' for entry \'' + changerName + '\' in partitionName = ' + entry.partitionName + '.');
                        if (_typeof(changerArg.arrayArgShape) !== undefinedString) {
                            var _str = compareArrayArgTypesForArray(changerArg.arrayArgShape, theArgs[1]);
                            if (_str !== '')
                            error(_str + ' for ' + changerName);
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
                    error('STATE_OBJECT_MERGE allows only 1 argument for ' + changerName + '.');
                    actionObj[actionObj.arguments[0]] = theArgs[0];
                } else if (changerArg.operation === operations.STATE_SETTODEFAULTS || changerArg.operation === operations.STATE_TOGGLE) {
                    if (theArgs.length !== 0)
                    error(changerArg.operation + ' allows only 0 arguments for ' + changerName);
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
                var newState = merge({}, state);
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
                            newArray[index] = merge(newArray[index], action.arrayEntryArg);
                            newState[action.arrayName] = newArray;
                        }
                        break;
                    case operations.STATE_OBJECT_MERGE:
                        key = action.arguments[0];
                        newState[key] = merge(newState[key], action[key]);
                        break;
                    default:
                        error('Unknown operation entry in ' + changerName + '.');}

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
        error('Changer definition argument for ' + o + ' must be defined');

        validateChangerArg(o, changerArg);

        // Make the changer            
        entry.changers[o] = buildChanger(entry.partitionName, o, changerArg);

        var reducerName = o + 'Reducer';

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
        var found = invalidChangerKeys.some(function (e2) {return (
                e2 === e);});

        if (found)
        error(e + ' is an invalid changer name.');
    });

    stateEntryRequiredKeys.forEach(function (entry) {
        if (_typeof(stateEntry[entry]) === undefinedString)
        error(entry + ' is a required entry in ' + stateEntry.partitionName + '.');
    });

    (0, _util.getKeys)(stateEntry).forEach(function (o) {
        var isvalid = stateEntryValidKeys.some(function (entry) {return (
                o === entry);});

        if (!isvalid)
        error(o + ' is not a valid entry in ' + stateEntry.partitionName + '.');
    });

    changerKeys.forEach(function (e) {
        var cd = stateEntry.changerDefinitions[e];
        if ((typeof cd === 'undefined' ? 'undefined' : _typeof(cd)) !== undefinedString) {
            var pluginId = cd.pluginId;
            if ((typeof pluginId === 'undefined' ? 'undefined' : _typeof(pluginId)) !== undefinedString) {
                var p = findPlugin(pluginId);
                if ((typeof p === 'undefined' ? 'undefined' : _typeof(p)) === undefinedString)
                error('Plugin with id ' + pluginId + ' is not defined');
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

function setOptions() {var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (options.onStateChange) {
        if (typeof options.onStateChange !== 'function')
        error('options.onStateChange must be a function.');
        _onStateChangeListeners.push(options.onStateChange);
    }
    if (options.onListener) {
        if (typeof options.onListener !== 'function')
        error('options.onListener must be a function.');
        _onListenerListeners.push(options.onListener);
    }
}

function init(partitionDefinitions, preloadedState, enhancer) {var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    if ((typeof partitionDefinitions === 'undefined' ? 'undefined' : _typeof(partitionDefinitions)) === undefinedString)
    error('Missing first parameter partitionDefinitions.');
    setOptions(options);

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
        _startState = merge({}, state);

        //
        // Redux assumes a change occurred if a new state object is returned from this reducer.
        // Essentially, this means a new pointer.
        // So, set up a new one in case something changes.
        //
        var newState = {};
        (0, _util.getKeys)(state).forEach(function (entry) {
            newState[entry] = state[entry];
        });

        // This handles correcting the redux store for partitions defined after the redux store is created.            
        if (action.type === internalActionType) {
            if (_typeof(newState[action.partitionName]) === undefinedString) {
                newState[action.partitionName] = merge({}, action.defaultState);
            } else {
                // This is for a pre-hydrated state.
                (0, _util.getKeys)(action.defaultState).forEach(function (key) {
                    if (_typeof(newState[action.partitionName][key]) === undefinedString)
                    newState[action.partitionName][key] = action.defaultState[key];
                });
            }
            if (_typeof(_startState[action.partitionName]) === undefinedString) {
                _startState[action.partitionName] = merge({}, action.defaultState);
            } else {
                // This is for a pre-hydrated state.
                (0, _util.getKeys)(action.defaultState).forEach(function (key) {
                    if (_typeof(_startState[action.partitionName][key]) === undefinedString)
                    _startState[action.partitionName][key] = action.defaultState[key];
                });
            }
            return newState;
        }

        // Call the reducer for the associated changer on the partition state.
        if (action.isSetState)
        newState[action.partitionName] = merge({}, state[action.partitionName], action.theirArgs[0]);else
        if (typeof action.reducer === 'function')
        newState[action.partitionName] = action.reducer(state[action.partitionName], action);else
        if (typeof action.pluginCallback === 'function') {
            setTimeout.apply(undefined, [action.pluginCallback, 1].concat(_toConsumableArray(action.theirArgs)));
            return state;
        } else
        return state; // This is for the redux init   

        //
        // Check to see if anything is different. If not, just return the original state.
        // This is shallow equal. It determines equality only on the keys of state.
        // So, if the state entry is a basic type, then equality is performed.
        // If the entry is an object, only pointer equality is checked. Lower objects may be different
        // and an array that had an element pushed directly in the redux store object  will not regester as a change.
        //
        if ((0, _util.shallowEqual)(newState[action.partitionName], state[action.partitionName]))
        return state;

        // This only applies to ancient browsers.
        (0, _util.handleAddKeysToProxyObject)(_store, action.partitionName, state, newState);

        // For all listeners, disclose a state change.
        indicateStateChange(action.partitionName, action.type, action.operation, state[action.partitionName], newState[action.partitionName], action.changerName, action.reducerName, action.theirArgs);

        // This is used to determine what partition listeners are involved in this change.           
        _partitionsThatChanged[action.partitionName] = true;
        return newState;
    };

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
        _defaultState[entry.partitionName] = merge({}, entry.defaultState);
    });

    // handle initial hydration of the redux store.        
    var newObj = {};
    if ((typeof preloadedState === 'undefined' ? 'undefined' : _typeof(preloadedState)) !== undefinedString) {
        var stateKeys = [].concat(_toConsumableArray((0, _util.getKeys)(_defaultState)), _toConsumableArray((0, _util.getKeys)(preloadedState)));
        stateKeys.forEach(function (key) {
            newObj[key] = merge({}, _defaultState[key], preloadedState[key]);
        });
    } else
    newObj = undefined;

    _reduxStore = createReduxStore(generalReducer, newObj, enhancer);

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
        error('Key ' + e + ' is missing from the plugin.');
        if (typeof plugin.reducer !== 'function' && typeof plugin.pluginCallback !== 'function')
        error('The plugin must have either a reducer function or a pluginCallback function.');
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
        error('${e.partitionName} is an invalid partition.');
        _store[e.partitionName].subscribe(e.listener, e.arrKeys, e.listenerName);
    });
    _subscribers = [];
    return _store;
}

// Add partitions. This allows partitions to be added before and after createStore
function addPartitions(partitionDefinitions) {
    if (!Array.isArray(partitionDefinitions))
    partitionDefinitions = [partitionDefinitions];
    // Do not allow a partition with the same name as an existing partition.
    partitionDefinitions = partitionDefinitions.filter(function (entry) {return (
            _typeof(findPartition(entry.partitionName)) === undefinedString);});

    if (_store !== null) {
        partitionDefinitions.forEach(function (entry) {
            _defaultState[entry.partitionName] = merge({}, entry.defaultState);
            var action = {};
            action.type = internalActionType;
            action.defaultState = entry.defaultState;
            action.partitionName = entry.partitionName;
            _store.dispatch(action);
            addPartitionInternal(entry);
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
    pluginObjs = pluginObjs.filter(function (entry) {return (
            _typeof(findPlugin(entry.pluginId)) === undefinedString);});


    pluginObjs.forEach(function (pluginObj) {
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
    error('subscribe listener argument is not a function.');
    if (!Array.isArray(arrKeys))
    error('subscribe: the 3rd argument must be an array of keys to listen on.');
    if (_store !== null) {
        if (_typeof(_store[partitionName]) === undefinedString)
        error('${partitionName} is an invalid partition.');
        _store[partitionName].subscribe(listener, arrKeys, listenerName);
    } else
    _subscribers.push({ partitionName: partitionName, listener: listener, arrKeys: arrKeys, listenerName: listenerName });
}

// Use this to initialize your business logic when you don't know when the store is created.
// This way, when the completionListener is called you can guarantee that your store partition is defined. 
function onStoreCreated(completionListener) {
    if (typeof completionListener !== 'function')
    error('onStoreCreated argument is not a function.');
    if (_store !== null)
    completionListener();else

    _completionListeners.push(completionListener);
}

//
// Allows the creation of module data that is proxied during development.
// This means changes to the data can be tracked by causality-redux and
// indicated to the caller using dataChangeListener.
//
var getModuleData = function getModuleData(DEBUG, partitionName, defaultState, dataChangeListener) {
    if (DEBUG) {
        if ((typeof partitionName === 'undefined' ? 'undefined' : _typeof(partitionName)) === undefinedString)
        error('partitionName is undefined.');
        if ((typeof defaultState === 'undefined' ? 'undefined' : _typeof(defaultState)) === undefinedString)
        error('defaultState is undefined.');
        if (CausalityRedux.store === null)
        error('CausalityRedux not initialized.');

        // Init the store partition
        CausalityRedux.addPartitions({ partitionName: partitionName, defaultState: defaultState });

        // Get the proxy to the data store.    
        var moduleData = CausalityRedux.store[partitionName].partitionState;
        if (typeof dataChangeListener === 'function')
        CausalityRedux.store[partitionName].subscribe(dataChangeListener);
        return moduleData;
    }

    return defaultState;
};

var CausalityRedux = {
    createStore: createStore,
    addPartitions: addPartitions,
    addPlugins: addPlugins,
    subscribe: subscribe,
    onStoreCreated: onStoreCreated,
    setOptions: setOptions,
    shallowEqual: _util.shallowEqual,
    merge: merge,
    getKeys: _util.getKeys,
    operations: operations,
    getModuleData: getModuleData,
    executeChanger: executeChanger,
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
    } };exports.default =


CausalityRedux;

/***/ }),
/* 3 */
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


/***/ })
/******/ ]);