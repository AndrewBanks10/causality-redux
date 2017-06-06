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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("redux");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /** @preserve © 2017 Andrew Banks ALL RIGHTS RESERVED */

var _redux = __webpack_require__(0);

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var CausalityRedux = function () {

    var _operations = {
        STATE_COPY: 1,
        STATE_ARRAY_ADD: 2,
        STATE_ARRAY_DELETE: 3,
        STATE_ARRAY_ENTRY_MERGE: 4,
        STATE_OBJECT_MERGE: 5,
        STATE_TOGGLE: 6,
        STATE_FUNCTION_CALL: 7,
        STATE_SETTODEFAULTS: 8,
        STATE_INCREMENT: 9,
        STATE_DECREMENT: 10
    };

    var changerDefinitionKeys = ['arguments', 'impliedArguments', 'type', 'operation', 'arrayName', 'keyIndexerName', 'keyName', 'arrayArgShape', 'pluginId'];

    var invalidChangerKeys = ['getState', 'subscribe'];

    var stateEntryValidKeys = ['partitionName', 'defaultState', 'changers', 'reducers', 'changerDefinitions'];

    var stateEntryRequiredKeys = ['partitionName', 'defaultState'];

    var pluginRequiredKeys = ['pluginId', 'reducer'];

    var undefinedString = 'undefined';

    var _defaultState = {};

    var internalActionType = '@@causality-redux/INIT';

    var _store = null;
    var _reduxStore = null;
    var _partitionsThatChanged = {};
    var _listeners = [];
    var _subscriberId = 0;
    var _partitionDefinitions = [];
    var _options = {};
    var _onStateChange = null;
    var _onListener = null;
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
        } else error('Redux is undefined');
    }
    /*eslint-enable */

    var error = function error(msg) {
        throw new Error('CausalityRedux: ' + msg);
    };

    var _merge = Object.assign;

    var objectType = function objectType(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    };

    var getKeys = function getKeys(obj) {
        return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === undefinedString ? [] : [].concat(_toConsumableArray(Object.keys(obj)), _toConsumableArray(Object.getOwnPropertySymbols(obj)));
    };

    // This is from redux
    function _shallowEqual(objA, objB) {
        if (objA === objB) {
            return true;
        }

        var keysA = getKeys(objA);
        var keysB = getKeys(objB);

        if (keysA.length !== keysB.length) {
            return false;
        }

        var hasOwn = Object.prototype.hasOwnProperty;
        for (var i = 0; i < keysA.length; i++) {
            if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
                return false;
            }
        }

        return true;
    }
    // end from redux

    var findPartition = function findPartition(partitionName) {
        var partition = CausalityRedux.partitionDefinitions.find(function (e) {
            return partitionName === e.partitionName;
        });
        return partition;
    };

    var findPlugin = function findPlugin(pluginId) {
        var plugin = _plugins.find(function (e) {
            return pluginId === e.pluginId;
        });
        return plugin;
    };

    var indicateStateChange = function indicateStateChange(partitionName, type, operation, prevState, nextState, changerName, theirArgs) {
        if (typeof _onStateChange === 'function') {
            var obj = {
                partitionName: partitionName,
                type: type,
                operation: (typeof operation === 'undefined' ? 'undefined' : _typeof(operation)) === undefinedString ? 'User defined' : operation,
                prevState: prevState,
                nextState: nextState,
                changerName: changerName,
                args: theirArgs
            };
            _onStateChange(obj);
        }
    };

    var indicateListener = function indicateListener(partitionName, nextState, listenerName) {
        if (typeof _onListener === 'function') {
            var obj = {
                partitionName: partitionName,
                nextState: nextState,
                listenerName: listenerName
            };
            _onListener(obj);
        }
    };

    // Can only subscribe as a listener on a partition.  
    var internalSubscriber = function internalSubscriber(listener, partitionName) {
        var stateEntries = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var listenerName = arguments[3];

        var arr = _merge([], stateEntries);
        var obj = { id: _subscriberId++, listener: listener, partitionName: partitionName, stateEntries: arr, listenerName: listenerName };
        _listeners.push(obj);
        return obj.id;
    };

    var internalUnsubscriber = function internalUnsubscriber(id) {
        _listeners = _listeners.filter(function (item) {
            return item.id !== id;
        });
    };

    //
    // Whenever a changer is called, this is actually what executes.
    // It calls the actual changer and then stores info in the action object returned by the changer.
    // The associated reducer is saved also so that the generalReducer can call it.
    // Then redux dispatch is called.
    //
    var internalPartitionChanger = function internalPartitionChanger(store, stateEntry, o, reducerName) {
        return function () {
            var _stateEntry$changers;

            var action = (_stateEntry$changers = stateEntry.changers)[o].apply(_stateEntry$changers, arguments);
            // User defined changer. Check validity of the returned action object.
            if (_typeof(stateEntry.changerDefinitions[o]) === undefinedString) {
                if ((typeof action === 'undefined' ? 'undefined' : _typeof(action)) === undefinedString || objectType(action) !== 'Object') {
                    error('Changer ' + o + ' must return an action object.');
                    return;
                }
                // This is  _operations.STATE_FUNCTION_CALL. No dispatch action is to be taken.
            } else if ((typeof action === 'undefined' ? 'undefined' : _typeof(action)) === undefinedString) return;
            action.type = _typeof(action.type) === undefinedString ? '' : action.type;
            // Set the reducer so that it can be called in the generalReducer.
            action.reducer = stateEntry.reducers[reducerName];
            action.partitionName = stateEntry.partitionName;
            action.reducerName = reducerName;
            // redux dispatch
            store.dispatch(action);
        };
    };

    //
    // This is called in the store partition to subscribe to changes to the partition.
    //
    var internalPartitionSubscriber = function internalPartitionSubscriber(partitionName) {
        return function (listener, stateEntries) {
            var listenerName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

            if (!Array.isArray(stateEntries)) error('subscribe: the 2nd argument must be an array of keys to listen on.');
            var partition = findPartition(partitionName);
            stateEntries.forEach(function (se) {
                var found = false;
                if (_typeof(partition.defaultState[se]) !== undefinedString) found = true;else {
                    getKeys(partition.changerDefinitions).forEach(function (key) {
                        if (key === se) {
                            if (stateEntries.length > 1) error('Can only subscribe to one changer event.');
                            found = true;
                        }
                    });
                }
                if (!found) throw se + ' is not a valid key in the state partition ' + partitionName + '.';
            });

            var id = internalSubscriber(listener, partitionName, stateEntries, listenerName);
            // Return an unsubscriber function
            return function (id) {
                return function () {
                    internalUnsubscriber(id);
                };
            }(id);
        };
    };

    // getState for the partiton    
    var internalPartitionGetState = function internalPartitionGetState(store, partitionName) {
        return function () {
            return store.getState()[partitionName];
        };
    };

    var validateStateEntry = function validateStateEntry(stateEntry) {
        if (_typeof(stateEntry.partitionName) === undefinedString) error('partitionName not found.');
        if (_typeof(stateEntry.defaultState) === undefinedString) error('defaultState missing from entry: ' + stateEntry.partitionName);
        if (_typeof(stateEntry.changers) === undefinedString) error('changers missing from entry: ' + stateEntry.partitionName);
        if (_typeof(stateEntry.reducers) === undefinedString) error('reducers missing from entry: ' + stateEntry.partitionName);
    };

    // Each partition has access to the changers and its own subscribe and getState functions.
    function setupPartition(store, stateEntry) {
        validateStateEntry(stateEntry);
        var partitionName = stateEntry.partitionName;
        store[partitionName] = {};
        var partitionStoreObject = store[partitionName];
        getKeys(stateEntry.changers).forEach(function (o) {
            var reducerName = o + 'Reducer';
            if (_typeof(stateEntry.reducers[reducerName]) === undefinedString) error('\'Reducer: ' + reducerName + ' not found.');
            partitionStoreObject[o] = internalPartitionChanger(store, stateEntry, o, reducerName);
        });

        partitionStoreObject.subscribe = internalPartitionSubscriber(partitionName);
        partitionStoreObject.getState = internalPartitionGetState(store, partitionName);
    }

    var buildStateEntryChangersAndReducers = function buildStateEntryChangersAndReducers(entry) {
        if (!entry.changerDefinitions) return;

        var isArrayOperation = function isArrayOperation(arg) {
            return arg === _operations.STATE_ARRAY_ADD || arg === _operations.STATE_ARRAY_DELETE || arg === _operations.STATE_ARRAY_ENTRY_MERGE;
        };

        var checkArguments = function checkArguments(defaultState, changerName, changerArgs, theirArgs) {
            if (theirArgs.length !== changerArgs.length) error('Incorrect number of arguments for ' + changerName + ' call.');

            for (var i = 0; i < theirArgs.length; ++i) {
                if (_typeof(defaultState[changerArgs[i]]) === undefinedString) error('Invalid argument name "' + changerArgs[i] + '" for ' + changerName + ' call.');else {
                    if (objectType(defaultState[changerArgs[i]]) !== 'Object') {
                        if (objectType(defaultState[changerArgs[i]]) !== objectType(theirArgs[i])) error('Incorrect argument type for argument #' + (i + 1) + ' for ' + changerName + ' call.');
                    }
                }
            }
        };

        var compareArrayArgTypesForArray = function compareArrayArgTypesForArray(o1, o2) {
            var k1 = getKeys(o1);
            var k2 = getKeys(o2);
            var str = '';
            k1.some(function (key) {
                if (_typeof(o2[key]) === undefinedString) str = key + ' is missing in the first argument';else if (o1[key] !== objectType(o2[key])) str = 'Invalid type for ' + key + ' in the first argument';

                return str !== '';
            });
            if (str === '') {
                k2.some(function (key) {
                    if (_typeof(o1[key]) === undefinedString) str = '\'' + key + '\' is an invalid field in the first argument';
                    return str !== '';
                });
            }
            return str;
        };

        // Validates a changer entry in a partition definition.        
        var validateChangerArg = function validateChangerArg(changerArg) {
            getKeys(changerArg).forEach(function (tag) {
                var valid = changerDefinitionKeys.some(function (keyName) {
                    return tag === keyName;
                });
                if (!valid) error(tag + ' is an invalid entry in ' + entry.partitionName + '.');
            });

            if (_typeof(changerArg.arguments) !== undefinedString) {
                if (!Array.isArray(changerArg.arguments)) error('\'arguments\' must be an array for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
            }

            if (isArrayOperation(changerArg.operation)) {
                if (_typeof(changerArg.keyIndexerName) !== undefinedString && _typeof(changerArg.keyName) === undefinedString) error('The keyIndexerName is defined in ' + o + ' but keyName is not defined.');
                if (_typeof(entry.defaultState[changerArg.arrayName]) === undefinedString) error('Missing the \'arrayName\' definition for entry \'' + o + '\' in partitionName = ' + entry.partitionName + '.');else if (!Array.isArray(entry.defaultState[changerArg.arrayName])) error(changerArg.arrayName + ' is not an array for entry \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
            } else if (changerArg.operation === _operations.STATE_TOGGLE) {
                if (_typeof(changerArg.impliedArguments) === undefinedString || changerArg.impliedArguments.length === 0) error('impliedArguments is required for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
                changerArg.impliedArguments.forEach(function (e) {
                    if (objectType(entry.defaultState[e]) !== 'Boolean') error('The impliedArgument ' + e + ' is not Boolean as required by the Toggle operation in \'' + o + '\' of partitionName = ' + entry.partitionName + '.');
                });
            } else if (changerArg.operation === _operations.STATE_INCREMENT || changerArg.operation === _operations.STATE_DECREMENT) {
                if (_typeof(changerArg.impliedArguments) === undefinedString || changerArg.impliedArguments.length !== 1) error('impliedArguments with 1 entry is required for \'' + o + '\' in stateName = ' + entry.stateName + '.');
                changerArg.impliedArguments.forEach(function (e) {
                    if (objectType(entry.defaultState[e]) !== 'Number') error('The impliedArgument ' + e + ' is not a Number as required by the ' + changerArg.operation + ' operation in \'' + o + '\' of partitionName = ' + entry.partitionName + '.');
                });
            } else if (changerArg.operation === _operations.STATE_OBJECT_MERGE) {
                if (_typeof(changerArg.arguments) === undefinedString || changerArg.arguments.length === 0) error('\'arguments\' is required for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
                if (changerArg.arguments.length !== 1) error('STATE_OBJECT_MERGE allows only 1 argument for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
            } else if (changerArg.operation === _operations.STATE_SETTODEFAULTS) {
                if (_typeof(changerArg.impliedArguments) === undefinedString || changerArg.impliedArguments.length === 0) error('\'impliedArguments\' is required for \'' + o + '\' in partitionName = ' + entry.partitionName + '.');
            }
        };

        var buildChanger = function buildChanger(partitionName, changerName, changerArg) {
            return function () {
                for (var _len = arguments.length, theirArgs = Array(_len), _key = 0; _key < _len; _key++) {
                    theirArgs[_key] = arguments[_key];
                }

                var theArgs = [].concat(theirArgs);
                // This simply calls all those listening to the name of the changer
                if (changerArg.operation === _operations.STATE_FUNCTION_CALL) {
                    var listenersToCall = [];
                    _listeners.forEach(function (listenerEntry) {
                        if (!Array.isArray(listenerEntry.stateEntries)) error('Listenername=' + listenerEntry.listenerName + ', partitionName=' + listenerEntry.partitionName + ' is not an array.');

                        listenerEntry.stateEntries.forEach(function (e) {
                            if (e === changerName) listenersToCall.push(listenerEntry);
                        });
                    });
                    if (listenersToCall.length === 0) error('There is no subscriber to ' + changerName + ' in ' + partitionName + '.');
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
                    indicateStateChange(partitionName, changerName, changerArg.operation, {}, nextState, changerName, theArgs);
                    listenersToCall.forEach(function (listener) {
                        indicateListener(partitionName, nextState, listener.listenerName);
                        listener.listener.apply(listener, _toConsumableArray(theArgs));
                    });
                    // Indicates no reducer should be called and redux dispatch should not be called.
                    return undefined;
                }

                // Save important information in the action object
                var actionObj = {};
                actionObj.changerName = changerName;
                actionObj.theirArgs = theArgs;
                actionObj.type = _typeof(changerArg.type) === undefinedString ? changerName : changerArg.type;
                actionObj.arguments = _typeof(changerArg.arguments) === undefinedString ? [] : changerArg.arguments;
                actionObj.impliedArguments = _typeof(changerArg.impliedArguments) === undefinedString ? [] : changerArg.impliedArguments;
                actionObj.operation = _typeof(changerArg.operation) === undefinedString ? _operations.STATE_COPY : changerArg.operation;
                actionObj.partitionName = partitionName;
                actionObj.changerDefinition = changerArg;

                // A plugin only validates arguments. Its reducer will be called for the actual change.
                if (_typeof(changerArg.pluginId) !== undefinedString) {
                    var p = findPlugin(changerArg.pluginId);
                    if (typeof p.validateChangerArguments === 'function') p.validateChangerArguments.apply(p, _toConsumableArray(theArgs));
                    return actionObj;
                }

                if (isArrayOperation(changerArg.operation)) {
                    if (changerArg.operation === _operations.STATE_ARRAY_ADD) {
                        if (objectType(theArgs[0]) !== 'Object') error('STATE_ARRAY_ADD can only accept pure base objects. You must define your own changers and reducers for this object.');
                    }

                    if (changerArg.operation === _operations.STATE_ARRAY_ADD || changerArg.operation === _operations.STATE_ARRAY_DELETE) {
                        if (theArgs.length !== 1) error('Only one argument is allowed with ' + changerArg.operation + ' for entry \'' + changerName + '\' in partitionName = ' + entry.partitionName + '.');

                        if (changerArg.operation === _operations.STATE_ARRAY_ADD && _typeof(changerArg.arrayArgShape) !== undefinedString) {
                            var str = compareArrayArgTypesForArray(changerArg.arrayArgShape, theArgs[0]);
                            if (str !== '') error(str + ' for ' + changerName);
                        }
                    } else {
                        if (theArgs.length !== 2) error('Two arguments are required with ' + changerArg.operation + ' for entry \'' + changerName + '\' in partitionName = ' + entry.partitionName + '.');
                        if (_typeof(changerArg.arrayArgShape) !== undefinedString) {
                            var _str = compareArrayArgTypesForArray(changerArg.arrayArgShape, theArgs[1]);
                            if (_str !== '') error(_str + ' for ' + changerName);
                        }
                    }
                    if (changerArg.operation === _operations.STATE_ARRAY_DELETE || changerArg.operation === _operations.STATE_ARRAY_ENTRY_MERGE) actionObj.arrayArg = theArgs[0].toString();else actionObj.arrayArg = theArgs[0];

                    actionObj.arrayEntryArg = theArgs[1];
                    actionObj.arrayName = changerArg.arrayName;
                    actionObj.keyIndexerName = changerArg.keyIndexerName;
                    actionObj.keyName = changerArg.keyName;
                } else if (changerArg.operation === _operations.STATE_OBJECT_MERGE) {
                    if (theArgs.length !== 1) error('STATE_OBJECT_MERGE allows only 1 argument for ' + changerName + '.');
                    actionObj[actionObj.arguments[0]] = theArgs[0];
                } else if (changerArg.operation === _operations.STATE_SETTODEFAULTS || changerArg.operation === _operations.STATE_TOGGLE) {
                    if (theArgs.length !== 0) error(changerArg.operation + ' allows only 0 arguments for ' + changerName);
                } else if (changerArg.operation !== _operations.STATE_FUNCTION_CALL) {
                    checkArguments(entry.defaultState, changerName, actionObj.arguments, theArgs);
                    if (theArgs.length > 0) {
                        for (var i = 0; i < theArgs.length; ++i) {
                            actionObj[actionObj.arguments[i]] = theArgs[i];
                        }
                    }
                }

                return actionObj;
            };
        };

        //
        // Supports internally defined operations.
        //
        var internalDefinedReducer = function internalDefinedReducer(changerName, changerArg) {
            return function (state, action) {
                var newState = _merge({}, state);
                var newArray = [];
                var key = void 0,
                    index = void 0;
                if (_typeof(action.operation) === undefinedString) action.operation = _operations.STATE_COPY;

                // Below implements the reducers for the standard operations.
                switch (action.operation) {
                    case _operations.STATE_COPY:
                        action.arguments.forEach(function (entry) {
                            newState[entry] = action[entry];
                        });
                        break;
                    case _operations.STATE_TOGGLE:
                        action.impliedArguments.forEach(function (entry) {
                            newState[entry] = !newState[entry];
                        });
                        break;
                    case _operations.STATE_INCREMENT:
                        action.impliedArguments.forEach(function (entry) {
                            newState[entry] = newState[entry] + 1;
                        });
                        break;
                    case _operations.STATE_DECREMENT:
                        action.impliedArguments.forEach(function (entry) {
                            newState[entry] = newState[entry] - 1;
                        });
                        break;
                    case _operations.STATE_SETTODEFAULTS:
                        changerArg.impliedArguments.forEach(function (argEntry) {
                            newState[argEntry] = _defaultState[action.partitionName][argEntry];
                        });
                        break;
                    case _operations.STATE_ARRAY_ADD:
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
                    case _operations.STATE_ARRAY_DELETE:
                        newArray = newState[action.arrayName].filter(function (entry) {
                            return entry[action.keyName] !== action.arrayArg;
                        });
                        newState[action.arrayName] = newArray;
                        break;
                    case _operations.STATE_ARRAY_ENTRY_MERGE:
                        newArray = [].concat(_toConsumableArray(newState[action.arrayName]));
                        index = newState[action.arrayName].findIndex(function (entry) {
                            return entry[action.keyName] === action.arrayArg;
                        });
                        if (index >= 0) {
                            newArray[index] = _merge(newArray[index], action.arrayEntryArg);
                            newState[action.arrayName] = newArray;
                        }
                        break;
                    case _operations.STATE_OBJECT_MERGE:
                        key = action.arguments[0];
                        newState[key] = _merge(newState[key], action[key]);
                        break;
                    default:
                        error('Unknown operation entry in ' + changerName + '.');
                }
                return newState;
            };
        };

        if (_typeof(entry.changers) === undefinedString) entry.changers = {};

        if (_typeof(entry.reducers) === undefinedString) entry.reducers = {};

        //
        // Setup the internal changers and reducers.
        //
        getKeys(entry.changerDefinitions).forEach(function (o) {
            var changerArg = entry.changerDefinitions[o];
            if ((typeof changerArg === 'undefined' ? 'undefined' : _typeof(changerArg)) === undefinedString) error('Changer definition argument for ' + o + ' must be defined');

            validateChangerArg(changerArg);

            // Make the changer            
            entry.changers[o] = buildChanger(entry.partitionName, o, changerArg);

            var reducerName = o + 'Reducer';

            // No reducer, define one.
            if (_typeof(entry.reducers[reducerName]) === undefinedString) {
                // Plugin reducer
                if (_typeof(changerArg.pluginId) !== undefinedString) entry.reducers[reducerName] = findPlugin(changerArg.pluginId).reducer;
                // Auto build reducer
                else entry.reducers[reducerName] = internalDefinedReducer(o, changerArg);
            }
        });
    };

    function validatePartition(stateEntry) {
        var changerKeys = [];
        if (_typeof(stateEntry.changerDefinitions) !== undefinedString) changerKeys = getKeys(stateEntry.changerDefinitions);
        if (_typeof(stateEntry.changers) !== undefinedString) changerKeys = [].concat(_toConsumableArray(changerKeys), _toConsumableArray(getKeys(stateEntry.changers)));

        changerKeys.forEach(function (e) {
            var found = invalidChangerKeys.some(function (e2) {
                return e2 === e;
            });
            if (found) error(e + ' is an invalid changer name.');
        });

        stateEntryRequiredKeys.forEach(function (entry) {
            if (_typeof(stateEntry[entry]) === undefinedString) error(entry + ' is a required entry in ' + stateEntry.partitionName + '.');
        });

        getKeys(stateEntry).forEach(function (o) {
            var isvalid = stateEntryValidKeys.some(function (entry) {
                return o === entry;
            });
            if (!isvalid) error(o + ' is not a valid entry in ' + stateEntry.partitionName + '.');
        });

        changerKeys.forEach(function (e) {
            var cd = stateEntry.changerDefinitions[e];
            if ((typeof cd === 'undefined' ? 'undefined' : _typeof(cd)) !== undefinedString) {
                var pluginId = cd.pluginId;
                if ((typeof pluginId === 'undefined' ? 'undefined' : _typeof(pluginId)) !== undefinedString) {
                    var p = findPlugin(pluginId);
                    if ((typeof p === 'undefined' ? 'undefined' : _typeof(p)) === undefinedString) error('Plugin with id ' + pluginId + ' is not defined');
                    if (typeof p.validatePartitionEntry === 'function') p.validatePartitionEntry(cd);
                }
            }
        });
    }

    function addPartitionInternal(partitionDefinition) {
        var partitionDefinitions = [partitionDefinition];
        _partitionDefinitions = _partitionDefinitions.concat(partitionDefinitions);
        partitionDefinitions.forEach(function (stateEntry) {
            validatePartition(stateEntry);
            buildStateEntryChangersAndReducers(stateEntry);
            setupPartition(_store, stateEntry);
        });
    }

    function setOptions() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _options = _merge({}, options);
        if (_options.onStateChange) {
            if (typeof _options.onStateChange !== 'function') error('options.onStateChange must be a function.');
            _onStateChange = _options.onStateChange;
        }
        if (_options.onListener) {
            if (typeof _options.onListener !== 'function') error('options.onListener must be a function.');
            _onListener = _options.onListener;
        }
    }

    function init(partitionDefinitions, preloadedState, enhancer) {
        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        if ((typeof partitionDefinitions === 'undefined' ? 'undefined' : _typeof(partitionDefinitions)) === undefinedString) error('Missing first parameter partitionDefinitions.');
        setOptions(options);

        //
        // This is the general reducer for redux. When a changer is called, the reducer for the changer was placed
        // in the action object so it is known what reducer to call in the code below.
        //
        var generalReducer = function generalReducer() {
            var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaultState;
            var action = arguments[1];

            //
            // The _startState is needed for the base case of listeners to determine whether a change occurred to some value in the partition.
            // We can't just use _defaultState because of possible hydration. 
            //
            if (!_startState) _startState = _merge({}, state);

            //
            // Redux assumes a change occurred if a new state object is returned from this reducer.
            // Essentially, this means a new pointer.
            // So, set up a new one in case something changes.
            //
            var newState = {};
            getKeys(state).forEach(function (entry) {
                newState[entry] = state[entry];
            });

            // This handles correcting the redux store for partitions defined after the redux store is created.            
            if (action.type === internalActionType) {
                if (_typeof(newState[action.partitionName]) === undefinedString) {
                    newState[action.partitionName] = _merge({}, action.defaultState);
                } else {
                    // This is for a pre-hydrated state.
                    getKeys(action.defaultState).forEach(function (key) {
                        if (_typeof(newState[action.partitionName][key]) === undefinedString) newState[action.partitionName][key] = action.defaultState[key];
                    });
                }
                if (_typeof(_startState[action.partitionName]) === undefinedString) {
                    _startState[action.partitionName] = _merge({}, action.defaultState);
                } else {
                    // This is for a pre-hydrated state.
                    getKeys(action.defaultState).forEach(function (key) {
                        if (_typeof(_startState[action.partitionName][key]) === undefinedString) _startState[action.partitionName][key] = action.defaultState[key];
                    });
                }
                return newState;
            }

            // This is for the redux init            
            if (typeof action.reducer !== 'function') return newState;

            // Call the reducer for the associated changer on the partition state.
            newState[action.partitionName] = action.reducer(state[action.partitionName], action);

            //
            // Check to see if anything is different. If not, just return the original state.
            // This is shallow equal. It determines equality only on the keys of state.
            // So, if the state entry is a basic type, then equality is performed.
            // If the entry is an object, only pointer equality is checked. Lower objects may be different
            // and an array that had an element pushed directly in the redux store object  will not regester as a change.
            //
            if (_shallowEqual(newState[action.partitionName], state[action.partitionName])) return state;

            indicateStateChange(action.partitionName, action.type, action.operation, state[action.partitionName], newState[action.partitionName], action.changerName, action.theirArgs);

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
            getKeys(_partitionsThatChanged).forEach(function (o) {
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
            _defaultState[entry.partitionName] = _merge({}, entry.defaultState);
        });

        // handle initial hydration of he redux store.        
        var newObj = {};
        if ((typeof preloadedState === 'undefined' ? 'undefined' : _typeof(preloadedState)) !== undefinedString) {
            var stateKeys = [].concat(_toConsumableArray(getKeys(_defaultState)), _toConsumableArray(getKeys(preloadedState)));
            stateKeys.forEach(function (key) {
                newObj[key] = _merge({}, _defaultState[key], preloadedState[key]);
            });
        } else newObj = undefined;

        _reduxStore = createReduxStore(generalReducer, newObj, enhancer);

        _store = Object.create(_reduxStore);
        _store.subscribe(generalListener);

        partitionDefinitions.forEach(function (entry) {
            addPartitionInternal(entry);
        });

        return _store;
    }

    // Make sure the plugin has the required keys.    
    var verifyPlugin = function verifyPlugin(plugin) {
        pluginRequiredKeys.forEach(function (e) {
            if (_typeof(plugin[e]) === undefinedString) error('Key ' + e + ' is missing from the plugin.');
        });
    };

    return {
        // creates the causality-redux store.
        createStore: function createStore() {
            var partitionDefinitions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            var preloadedState = arguments[1];
            var enhancer = arguments[2];
            var options = arguments[3];

            if (_store !== null) error('CausalityRedux is already initialized.');
            partitionDefinitions = partitionDefinitions.filter(function (entry) {
                return _typeof(findPartition(entry.partitionName)) === undefinedString;
            });
            var p = _partitionDefinitions.concat(partitionDefinitions);
            _partitionDefinitions = [];
            _store = init(p, preloadedState, enhancer, options);
            // call all those that called onStoreCreated with a listener for the store being created.
            _completionListeners.forEach(function (e) {
                return e();
            });
            _completionListeners = [];
            // Add the subscribers that had subscribed before the store was created.
            _subscribers.forEach(function (e) {
                if (_typeof(_store[e.partitionName]) === undefinedString) error('${e.partitionName} is an invalid partition.');
                _store[e.partitionName].subscribe(e.listener, e.arrKeys, e.listenerName);
            });
            _subscribers = [];
            return _store;
        },

        // Add partition. This allows partitions to be added before and after createStore
        addPartitions: function addPartitions(partitionDefinitions) {
            if (!Array.isArray(partitionDefinitions)) partitionDefinitions = [partitionDefinitions];
            partitionDefinitions = partitionDefinitions.filter(function (entry) {
                return _typeof(findPartition(entry.partitionName)) === undefinedString;
            });
            if (_store !== null) {
                partitionDefinitions.forEach(function (entry) {
                    _defaultState[entry.partitionName] = _merge({}, entry.defaultState);
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
        },

        //
        // Allows adding plugins to extend the basic operations.
        // pluginObj has the following entries:
        //
        // .pluginId, unique id for the plugin. Use a symbol.
        // .validatePartitionEntry(changerDefinitionEntry) [Optional] - A function to verify that the user correctly
        //  provided all the keys that you require for your changerDefinitionEntry. Throw exception on failure.
        // .validateChangerArguments(...theirArgs) [Optional] , this is called for you to verify that their arguments for your changer meet
        //  your requirements. Check types and number of arguments. Throw an exception if error.
        // .reducer(state, action). Your plugin reducer.
        //
        addPlugin: function addPlugin(pluginObj) {
            verifyPlugin(pluginObj);
            _plugins.push(pluginObj);
        },

        // Subscribe to changes in a partion of the store. This can be done before and after createStore.
        subscribe: function subscribe(partitionName, listener, arrKeys, listenerName) {
            if (typeof listener !== 'function') error('subscribe listener argument is not a function.');
            if (!Array.isArray(arrKeys)) error('subscribe: the 3rd argument must be an array of keys to listen on.');
            if (_store !== null) {
                if (_typeof(_store[partitionName]) === undefinedString) error('${partitionName} is an invalid partition.');
                _store[partitionName].subscribe(listener, arrKeys, listenerName);
            } else _subscribers.push({ partitionName: partitionName, listener: listener, arrKeys: arrKeys, listenerName: listenerName });
        },

        // Use this to initialize your business logic when you don't know when the store is created.
        // This way, when the completionListener is called you are guaranteed to have your store partition defined. 
        onStoreCreated: function onStoreCreated(completionListener) {
            if (typeof completionListener !== 'function') error('onStoreCreated argument is not a function.');
            if (_store !== null) completionListener();else _completionListeners.push(completionListener);
        },

        setOptions: setOptions,
        get store() {
            return _store;
        },
        get reduxStore() {
            return _reduxStore;
        },
        get operations() {
            return _operations;
        },
        get partitionDefinitions() {
            return _partitionDefinitions;
        },
        get onListener() {
            return _onListener;
        },
        get defaultState() {
            return _defaultState;
        },
        get shallowEqual() {
            return _shallowEqual;
        },
        get merge() {
            return _merge;
        }
    };
}();

if (typeof window !== 'undefined') window['CausalityRedux'] = CausalityRedux;
module.exports = CausalityRedux;

/***/ })
/******/ ]);