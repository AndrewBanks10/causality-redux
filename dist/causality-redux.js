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

module.exports = Redux;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /** @preserve © 2017 Andrew Banks ALL RIGHTS RESERVED */

/**
 * @constructor
 */

var _redux = __webpack_require__(0);

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var CausalityRedux = function () {
    'use strict';

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

    var changerDefinitionKeys = ['arguments', 'impliedArguments', 'type', 'operation', 'arrayName', 'keyIndexerName', 'keyName', 'arrayArgShape'];

    var stateEntryValidKeys = ['partitionName', 'defaultState', 'changers', 'reducers', 'changerDefinitions'];

    var stateEntryRequiredKeys = ['partitionName', 'defaultState'];

    var undefinedString = 'undefined';

    var _store = null;
    var _reduxStore = null;
    var changes = {};
    var listeners = [];
    var subscriberId = 0;
    var _partitionDefinitions = [];
    var _options = {};
    var _onStateChange = null;
    var _onListener = null;
    var _defaultState = {};
    var startState = null;
    var argumentName = 'argument';
    var completionListeners = [];
    var subscribers = [];

    var error = function error(msg) {
        throw new Error('CausalityRedux: ' + msg);
    };

    var _merge = Object.assign;

    var createReduxStore;
    if ((typeof _redux.createStore === 'undefined' ? 'undefined' : _typeof(_redux.createStore)) != undefinedString) {
        createReduxStore = _redux.createStore;
    }

    if ((typeof createReduxStore === 'undefined' ? 'undefined' : _typeof(createReduxStore)) == undefinedString) {
        if ((typeof Redux === 'undefined' ? 'undefined' : _typeof(Redux)) == undefinedString) {
            error('Redux is undefined');
        }
        createReduxStore = Redux.createStore;
    }

    var objectType = function objectType(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    };

    function _shallowEqual(objA, objB) {
        if (objA === objB) {
            return true;
        }

        var keysA = Object.keys(objA);
        var keysB = Object.keys(objB);

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

    var findPartition = function findPartition(partitionName) {
        var partition = CausalityRedux.partitionDefinitions.find(function (e) {
            return partitionName == e.partitionName;
        });
        return partition;
    };

    var indicateStateChange = function indicateStateChange(partitionName, type, operation, prevState, nextState) {
        if (typeof _onStateChange == 'function') {
            var obj = {
                partitionName: partitionName,
                type: type,
                operation: (typeof operation === 'undefined' ? 'undefined' : _typeof(operation)) == undefinedString ? 'User defined' : operation,
                prevState: prevState,
                nextState: nextState
            };
            _onStateChange(obj);
        }
    };

    var indicateListener = function indicateListener(partitionName, nextState, listenerName) {
        if (typeof _onListener == 'function') {
            var obj = {
                partitionName: partitionName,
                nextState: nextState,
                listenerName: listenerName
            };
            _onListener(obj);
        }
    };

    var generalUnsubscriber = function generalUnsubscriber(id) {
        listeners = listeners.filter(function (item) {
            return item.id != id;
        });
    };

    var generalSubscriber = function generalSubscriber(listener, partitionName) {
        var stateEntries = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var listenerName = arguments[3];

        var arr = _merge([], stateEntries);
        var obj = { id: subscriberId++, listener: listener, partitionName: partitionName, stateEntries: arr, listenerName: listenerName };
        listeners.push(obj);
        return obj.id;
    };

    function setupStateEntry(store, stateEntry) {
        if (_typeof(stateEntry.partitionName) == undefinedString) error('partitionName not found.');
        if (_typeof(stateEntry.defaultState) == undefinedString) error('defaultState missing from entry: ' + stateEntry.partitionName);
        if (_typeof(stateEntry.changers) == undefinedString) error('changers missing from entry: ' + stateEntry.partitionName);
        if (_typeof(stateEntry.reducers) == undefinedString) error('reducers missing from entry: ' + stateEntry.partitionName);
        store[stateEntry.partitionName] = {};
        for (var o in stateEntry.changers) {
            var reducerName = o + 'Reducer';
            if (_typeof(stateEntry.reducers[reducerName]) == undefinedString) error('Reducer: ' + reducerName + ' not found.');
            store[stateEntry.partitionName][o] = function (o, reducerName) {
                return function () {
                    var _stateEntry$changers;

                    var x = (_stateEntry$changers = stateEntry.changers)[o].apply(_stateEntry$changers, arguments);
                    if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) == undefinedString) return;
                    x.type = _typeof(x.type) == undefinedString ? "" : x.type;
                    x.reducer = stateEntry.reducers[reducerName];
                    x.partitionName = stateEntry.partitionName;
                    x.reducerName = reducerName;
                    store.dispatch(x);
                };
            }(o, reducerName);
        }
        store[stateEntry.partitionName].subscribe = function (partitionName) {
            return function (listener, stateEntries) {
                var listenerName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

                if (!Array.isArray(stateEntries)) error('subscribe: the 2nd argument must be an array of keys to listen on.');
                var partition = findPartition(partitionName);
                stateEntries.forEach(function (se) {
                    var found = false;
                    if (typeof partition.defaultState[se] != 'undefined') found = true;else {
                        for (var key in partition.changerDefinitions) {
                            if (key == se) {
                                if (stateEntries.length > 1) {
                                    error('Can only subscribe to one changer event.');
                                }
                                found = true;
                            }
                        }
                    }
                    if (!found) throw se + ' is not a valid key in the state partition ' + partitionName + '.';
                });

                var id = generalSubscriber(listener, partitionName, stateEntries, listenerName);
                return function (id) {
                    return function () {
                        generalUnsubscriber(id);
                    };
                }(id);
            };
        }(stateEntry.partitionName);
        store[stateEntry.partitionName].getState = function (store, partitionName) {
            return function () {
                var state = store.getState();
                return state[partitionName];
            };
        }(store, stateEntry.partitionName);
    }

    var buildStateEntryChangersAndReducers = function buildStateEntryChangersAndReducers(entry) {
        if (!entry.changerDefinitions) return;

        var checkArguments = function checkArguments(defaultState, changerName, changerArgs, theirArgs) {
            if (theirArgs.length != changerArgs.length) error('Incorrect number of arguments for ' + changerName + ' call.');

            for (var i = 0; i < theirArgs.length; ++i) {
                if (_typeof(defaultState[changerArgs[i]]) == undefinedString) error('Invalid argument name "' + changerArgs[i] + '" for ' + changerName + ' call.');else {
                    if (objectType(defaultState[changerArgs[i]]) != 'Object') {
                        if (objectType(defaultState[changerArgs[i]]) != objectType(theirArgs[i])) error('Incorrect argument type for argument #' + (i + 1) + ' for ' + changerName + ' call.');
                    }
                }
            }
        };

        var compareArrayArgTypesForArray = function compareArrayArgTypesForArray(o1, o2) {
            var k1 = Object.keys(o1);
            var k2 = Object.keys(o2);
            var str = "";
            k1.some(function (key) {
                if (_typeof(o2[key]) == undefinedString) str = key + ' is missing in the first argument';else if (o1[key] != objectType(o2[key])) str = 'Invalid type for ' + key + ' in the first argument';

                return str != '';
            });
            if (str == '') {
                k2.some(function (key) {
                    if (_typeof(o1[key]) == undefinedString) str = '\'' + key + '\' is an invalid field in the first argument';
                    return str != '';
                });
            }
            return str;
        };

        var isArrayOperation = function isArrayOperation(arg) {
            return arg == _operations.STATE_ARRAY_ADD || arg == _operations.STATE_ARRAY_DELETE || arg == _operations.STATE_ARRAY_ENTRY_MERGE;
        };

        for (var o in entry.changerDefinitions) {
            var arg = entry.changerDefinitions[o];

            var _loop = function _loop(tag) {
                var valid = changerDefinitionKeys.some(function (keyName) {
                    return tag == keyName;
                });
                if (!valid) error(tag + ' is an invalid entry in ' + entry.partitionName + '.');
            };

            for (var tag in arg) {
                _loop(tag);
            }
        }

        if (_typeof(entry.changers) == undefinedString) entry.changers = {};

        var _loop2 = function _loop2(_o) {
            var changerArg = entry.changerDefinitions[_o];

            if (_typeof(changerArg.arguments) != undefinedString) {
                if (!Array.isArray(changerArg.arguments)) error('\'arguments\' must be an array for \'' + _o + '\' in partitionName = ' + entry.partitionName + '.');
            }
            if ((typeof changerArg === 'undefined' ? 'undefined' : _typeof(changerArg)) == undefinedString) error('Changer definition argument for ' + _o + ' must be defined');
            if (isArrayOperation(changerArg.operation)) {
                if (_typeof(changerArg.keyIndexerName) != undefinedString && _typeof(changerArg.keyName) == undefinedString) error('The keyIndexerName is defined in ' + _o + ' but keyName is not defined.');
                if (_typeof(entry.defaultState[changerArg.arrayName]) == undefinedString) error('Missing the \'arrayName\' definition for entry \'' + _o + '\' in partitionName = ' + entry.partitionName + '.');else if (!Array.isArray(entry.defaultState[changerArg.arrayName])) error(changerArg.arrayName + ' is not an array for entry \'' + _o + '\' in partitionName = ' + entry.partitionName + '.');
            } else if (changerArg.operation == _operations.STATE_TOGGLE) {
                if (_typeof(changerArg.impliedArguments) == undefinedString || changerArg.impliedArguments.length == 0) error('impliedArguments is required for \'' + _o + '\' in partitionName = ' + entry.partitionName + '.');
                changerArg.impliedArguments.forEach(function (e) {
                    if (objectType(entry.defaultState[e]) != 'Boolean') error('The impliedArgument ' + e + ' is not Boolean as required by the Toggle operation in \'' + _o + '\' of partitionName = ' + entry.partitionName + '.');
                });
            } else if (changerArg.operation == _operations.STATE_INCREMENT || changerArg.operation == _operations.STATE_DECREMENT) {
                if (_typeof(changerArg.impliedArguments) == undefinedString || changerArg.impliedArguments.length != 1) error('impliedArguments with 1 entry is required for \'' + _o + '\' in stateName = ' + entry.stateName + '.');
                changerArg.impliedArguments.forEach(function (e) {
                    if (objectType(entry.defaultState[e]) != 'Number') error('The impliedArgument ' + e + ' is not a Number as required by the ' + changerArg.operation + ' operation in \'' + _o + '\' of partitionName = ' + entry.partitionName + '.');
                });
            } else if (changerArg.operation == _operations.STATE_OBJECT_MERGE) {
                if (_typeof(changerArg.arguments) == undefinedString || changerArg.arguments.length == 0) error('\'arguments\' is required for \'' + _o + '\' in partitionName = ' + entry.partitionName + '.');
                if (changerArg.arguments.length != 1) error('STATE_OBJECT_MERGE allows only 1 argument for \'' + _o + '\' in partitionName = ' + entry.partitionName + '.');
            } else if (changerArg.operation == _operations.STATE_SETTODEFAULTS) {
                if (_typeof(changerArg.impliedArguments) == undefinedString || changerArg.impliedArguments.length == 0) error('\'impliedArguments\' is required for \'' + _o + '\' in partitionName = ' + entry.partitionName + '.');
            }
            entry.changers[_o] = function (partitionName, changerName, changerArg) {
                return function () {
                    for (var _len = arguments.length, theirArgs = Array(_len), _key = 0; _key < _len; _key++) {
                        theirArgs[_key] = arguments[_key];
                    }

                    if (changerArg.operation == _operations.STATE_FUNCTION_CALL) {
                        var listenersToCall = [];
                        listeners.forEach(function (listenerEntry) {
                            if (!Array.isArray(listenerEntry.stateEntries)) error('Listenername=' + listenerEntry.listenerName + ', partitionName=' + listenerEntry.partitionName + ' is not an array.');

                            listenerEntry.stateEntries.forEach(function (e) {
                                if (e == changerName) listenersToCall.push(listenerEntry);
                            });
                        });
                        if (listenersToCall.length == 0) error('There is no subscriber to ' + changerName + ' in ' + partitionName + '.');
                        var theArgs = [].concat(theirArgs);
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
                        indicateStateChange(partitionName, changerName, changerArg.operation, {}, nextState);
                        listenersToCall.forEach(function (listener) {
                            indicateListener(partitionName, nextState, listener.listenerName);
                            listener.listener.apply(listener, _toConsumableArray(theArgs));
                        });
                        return undefined;
                    }
                    var obj = {};
                    obj.type = changerName;
                    if (_typeof(changerArg.type) != undefinedString) obj.type = changerArg.type;
                    obj.arguments = _typeof(changerArg.arguments) == undefinedString ? [] : changerArg.arguments;
                    obj.impliedArguments = _typeof(changerArg.impliedArguments) == undefinedString ? [] : changerArg.impliedArguments;
                    obj.operation = _typeof(changerArg.operation) == undefinedString ? _operations.STATE_COPY : changerArg.operation;
                    obj.partitionName = partitionName;

                    if (isArrayOperation(changerArg.operation)) {
                        if (changerArg.operation == _operations.STATE_ARRAY_ADD) {
                            if (objectType(theirArgs[0]) != 'Object') error('STATE_ARRAY_ADD can only accept pure base objects. You must define your own changers and reducers for this object.');
                        }

                        if (changerArg.operation == _operations.STATE_ARRAY_ADD || changerArg.operation == _operations.STATE_ARRAY_DELETE) {
                            if (theirArgs.length != 1) error('Only one argument is allowed with ' + changerArg.operation + ' for entry \'' + changerName + '\' in partitionName = ' + entry.partitionName + '.');

                            if (changerArg.operation == _operations.STATE_ARRAY_ADD && _typeof(changerArg.arrayArgShape) != undefinedString) {
                                var str = compareArrayArgTypesForArray(changerArg.arrayArgShape, theirArgs[0]);
                                if (str != '') error(str + ' for ' + changerName);
                            }
                        } else {
                            if (theirArgs.length != 2) error('Two arguments are required with ' + changerArg.operation + ' for entry \'' + changerName + '\' in partitionName = ' + entry.partitionName + '.');
                            if (_typeof(changerArg.arrayArgShape) != undefinedString) {
                                var _str = compareArrayArgTypesForArray(changerArg.arrayArgShape, theirArgs[1]);
                                if (_str != '') error(_str + ' for ' + changerName);
                            }
                        }

                        obj.arrayArg = theirArgs[0];
                        obj.arrayEntryArg = theirArgs[1];
                        obj.arrayName = changerArg.arrayName;
                        obj.keyIndexerName = changerArg.keyIndexerName;
                        obj.keyName = changerArg.keyName;
                    } else if (changerArg.operation == _operations.STATE_OBJECT_MERGE) {
                        if (theirArgs.length != 1) error('STATE_OBJECT_MERGE allows only 1 argument for ' + changerName);
                        obj[obj.arguments[0]] = theirArgs[0];
                    } else if (changerArg.operation == _operations.STATE_SETTODEFAULTS || changerArg.operation == _operations.STATE_TOGGLE) {
                        if (theirArgs.length != 0) error(changerArg.operation + ' allows only 0 arguments for ' + changerName);
                    } else if (changerArg.operation == _operations.STATE_FUNCTION_CALL) {
                        obj.theirArgs = theirArgs;
                    } else {
                        checkArguments(entry.defaultState, changerName, obj.arguments, theirArgs);
                        if (theirArgs.length > 0) {
                            for (var i = 0; i < theirArgs.length; ++i) {
                                obj[obj.arguments[i]] = theirArgs[i];
                            }
                        }
                    }

                    return obj;
                };
            }(entry.partitionName, _o, changerArg);

            var reducerName = _o + 'Reducer';
            var reducer = undefined;
            if (_typeof(entry.reducers) != undefinedString) reducer = entry.reducers[reducerName];
            if ((typeof reducer === 'undefined' ? 'undefined' : _typeof(reducer)) != undefinedString) {
                entry.reducers[reducerName] = function (reducer) {
                    return function (state, action) {
                        var args = [state];
                        action.arguments.forEach(function (entry) {
                            args.push(action[entry]);
                        });
                        return reducer.apply(null, args);
                    };
                }(reducer);
            } else {
                if (_typeof(entry.reducers) == undefinedString) entry.reducers = {};
                entry.reducers[reducerName] = function (changerName) {
                    return function (state, action) {
                        var retObj = _merge({}, state);
                        if (_typeof(action.operation) == undefinedString) action.operation = _operations.STATE_COPY;

                        switch (action.operation) {
                            case _operations.STATE_COPY:
                                action.arguments.forEach(function (entry) {
                                    retObj[entry] = action[entry];
                                });
                                break;
                            case _operations.STATE_TOGGLE:
                                action.impliedArguments.forEach(function (entry) {
                                    retObj[entry] = !retObj[entry];
                                });
                                break;
                            case _operations.STATE_INCREMENT:
                                action.impliedArguments.forEach(function (entry) {
                                    retObj[entry] = retObj[entry] + 1;
                                });
                                break;
                            case _operations.STATE_DECREMENT:
                                action.impliedArguments.forEach(function (entry) {
                                    retObj[entry] = retObj[entry] - 1;
                                });
                                break;
                            case _operations.STATE_SETTODEFAULTS:
                                changerArg.impliedArguments.forEach(function (argEntry) {
                                    retObj[argEntry] = _defaultState[action.partitionName][argEntry];
                                });
                                break;
                            case _operations.STATE_ARRAY_ADD:
                                var arr = [].concat(_toConsumableArray(retObj[action.arrayName]));
                                if (action.keyIndexerName) {
                                    var nextIndex = parseInt(retObj[action.keyIndexerName]) || 0;
                                    action.arrayArg[action.keyName] = nextIndex.toString();
                                    ++nextIndex;
                                    retObj[action.keyIndexerName] = nextIndex.toString();
                                }
                                arr.push(action.arrayArg);
                                retObj[action.arrayName] = arr;
                                break;
                            case _operations.STATE_ARRAY_DELETE:
                                var newArray = retObj[action.arrayName].filter(function (entry) {
                                    return entry[action.keyName] != action.arrayArg;
                                });
                                retObj[action.arrayName] = newArray;
                                break;
                            case _operations.STATE_ARRAY_ENTRY_MERGE:
                                var arr2 = [].concat(_toConsumableArray(retObj[action.arrayName]));
                                var index = retObj[action.arrayName].findIndex(function (entry) {
                                    return entry[action.keyName] == action.arrayArg;
                                });
                                if (index >= 0) {
                                    arr2[index] = _merge(arr2[index], action.arrayEntryArg);
                                    retObj[action.arrayName] = arr2;
                                }
                                break;
                            case _operations.STATE_OBJECT_MERGE:
                                var tag = action.arguments[0];
                                retObj[tag] = _merge(retObj[tag], action[tag]);
                                break;
                            default:
                                error('Unknown operation entry in ' + changerName + '.');
                        }
                        return retObj;
                    };
                }(_o);
            }
        };

        for (var _o in entry.changerDefinitions) {
            _loop2(_o);
        }
    };

    function addPartitionInternal(partitionDefinition) {
        var partitionDefinitions = [partitionDefinition];
        _partitionDefinitions = _partitionDefinitions.concat(partitionDefinitions);
        partitionDefinitions.forEach(function (stateEntry) {
            stateEntryRequiredKeys.forEach(function (entry) {
                if (_typeof(stateEntry[entry]) == undefinedString) {
                    error(entry + ' is a required entry in ' + stateEntry.partitionName + '.');
                }
            });

            var _loop3 = function _loop3(o) {
                var isvalid = stateEntryValidKeys.some(function (entry) {
                    return o == entry;
                });
                if (!isvalid) error(o + ' is not a valid entry in ' + stateEntry.partitionName + '.');
            };

            for (var o in stateEntry) {
                _loop3(o);
            }

            buildStateEntryChangersAndReducers(stateEntry);
            setupStateEntry(_store, stateEntry);
        });
    }

    function init(partitionDefinitions, preloadedState, enhancer) {
        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        if ((typeof partitionDefinitions === 'undefined' ? 'undefined' : _typeof(partitionDefinitions)) == undefinedString) error('Missing first parameter partitionDefinitions.');
        _options = _merge({}, options);
        if (_options.onStateChange) {
            if (typeof _options.onStateChange != 'function') error('options.onStateChange must be a function.');
            _onStateChange = _options.onStateChange;
        }
        if (_options.onListener) {
            if (typeof _options.onListener != 'function') error('options.onListener must be a function.');
            _onListener = _options.onListener;
        }

        var generalReducer = function generalReducer() {
            var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _defaultState;
            var action = arguments[1];

            if (!startState) startState = state;
            if (typeof action.reducer != 'function') return state;

            var newState = {};
            _partitionDefinitions.forEach(function (entry) {
                newState[entry.partitionName] = state[entry.partitionName];
            });
            newState[action.partitionName] = action.reducer(state[action.partitionName], action);

            if (_shallowEqual(newState[action.partitionName], state[action.partitionName])) return state;

            indicateStateChange(action.partitionName, action.type, action.operation, state[action.partitionName], newState[action.partitionName]);

            changes[action.partitionName] = true;
            return newState;
        };

        var generalListener = function generalListener() {
            var state = _store.getState();

            var _loop4 = function _loop4(o) {
                listeners.forEach(function (item) {
                    if (o == item.partitionName) {
                        if (item.stateEntries.length == 0) {
                            indicateListener(o, state[o], item.listenerName);
                            item.listener(state[o]);
                        } else {
                            var areEqual = true;
                            if (_typeof(item.prevState) == undefinedString) {
                                item.stateEntries.forEach(function (se) {
                                    areEqual = areEqual && state[o][se] === startState[o][se];
                                });
                            } else {
                                item.stateEntries.forEach(function (entry) {
                                    areEqual = areEqual && state[o][entry] === item.prevState[entry];
                                });
                            }
                            if (!areEqual) {
                                var nextState = {};
                                item.stateEntries.forEach(function (entry) {
                                    nextState[entry] = state[o][entry];
                                });
                                item.prevState = nextState;

                                indicateListener(o, nextState, item.listenerName);
                                item.listener(nextState);
                            }
                        }
                    }
                });
            };

            for (var o in changes) {
                _loop4(o);
            }
            changes = {};
        };

        partitionDefinitions.forEach(function (entry) {
            _defaultState[entry.partitionName] = _merge({}, entry.defaultState);
        });

        var newObj = {};
        if ((typeof preloadedState === 'undefined' ? 'undefined' : _typeof(preloadedState)) != undefinedString) {
            var defaultStateKeys = Object.keys(_defaultState);
            defaultStateKeys.forEach(function (key) {
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

    return {
        createStore: function createStore() {
            var partitionDefinitions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
            var preloadedState = arguments[1];
            var enhancer = arguments[2];
            var options = arguments[3];

            if (_store != null) error('CausalityRedux is already initialized.');
            var p = _partitionDefinitions.concat(partitionDefinitions);
            _partitionDefinitions = [];
            _store = init(p, preloadedState, enhancer, options);
            completionListeners.forEach(function (e) {
                return e();
            });
            completionListeners = [];
            subscribers.forEach(function (e) {
                _store[e.partitionName].subscribe(e.listener, e.arrKeys, e.listenerName);
            });
            subscribers = [];
            return _store;
        },
        addPartitions: function addPartitions(partitionDefinitions) {
            if (_store != null) error('CausalityRedux has already been initialized. This addPartition will not work.');
            if (!Array.isArray(partitionDefinitions)) partitionDefinitions = [partitionDefinitions];
            _partitionDefinitions = _partitionDefinitions.concat(partitionDefinitions);
        },
        subscribe: function subscribe(partitionName, listener, arrKeys, listenerName) {
            if (typeof listener != 'function') error('subscribe listener argument is not a function.');
            if (!Array.isArray(arrKeys)) error('subscribe: the 3rd argument must be an array of keys to listen on.');
            if (_store != null) _store[partitionName].subscribe(listener, arrKeys, listenerName);else subscribers.push({ partitionName: partitionName, listener: listener, arrKeys: arrKeys, listenerName: listenerName });
        },
        onStoreCreated: function onStoreCreated(completionListener) {
            if (typeof completionListener != 'function') error('onStoreCreated argument is not a function.');
            if (_store != null) completionListener();else completionListeners.push(completionListener);
        },

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

if (typeof window != 'undefined') window['CausalityRedux'] = CausalityRedux;
module.exports = CausalityRedux;

/***/ })
/******/ ]);