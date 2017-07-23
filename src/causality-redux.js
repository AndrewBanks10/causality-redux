/** @preserve © 2017 Andrew Banks ALL RIGHTS RESERVED */
import { createStore as reduxCreateStore } from 'redux';
import { handleAddKeysToProxyObject, getPartitionProxy, merge, getKeys, shallowEqual } from './util';

const operations = {
    STATE_COPY:                 1,
    STATE_ARRAY_ADD:            2,
    STATE_ARRAY_DELETE:         3,
    STATE_ARRAY_ENTRY_MERGE:    4,
    STATE_OBJECT_MERGE:         5,
    STATE_TOGGLE:               6,
    STATE_FUNCTION_CALL:        7,
    STATE_SETTODEFAULTS:        8,
    STATE_INCREMENT:            9,
    STATE_DECREMENT:            10
};

const changerDefinitionKeys = [
    'arguments',
    'impliedArguments',
    'type',
    'operation',
    'arrayName',
    'keyIndexerName',
    'keyName',
    'arrayArgShape',
    'pluginId'
];

const invalidChangerKeys = [
    'setState',
    'getState',
    'subscribe',
    'partitionState'
];

const stateEntryValidKeys = [
    'partitionName',
    'defaultState',
    'changers',
    'reducers',
    'changerDefinitions'
];

const stateEntryRequiredKeys = [
    'partitionName',
    'defaultState'
];

const pluginRequiredKeys = [
    'pluginId'
];

const undefinedString = 'undefined';

const _defaultState = {};

const internalActionType = '@@causality-redux/INIT';

const setStateChangerName = 'setState';

let _store = null;
let _reduxStore = null;
let _partitionsThatChanged = {};
let _listeners = [];
let _subscriberId = 0;
let _partitionDefinitions = [];
const _onStateChangeListeners = [];
const _onListenerListeners = [];
let _startState = null;
let _completionListeners = [];
let _subscribers = [];
const _plugins = [];
let uniqueKeys = {};

let createReduxStore;
if (typeof reduxCreateStore !== undefinedString) {
    createReduxStore = reduxCreateStore;
}

/*eslint-disable */
if (typeof createReduxStore === undefinedString) {
    if (typeof Redux !== undefinedString) {
        createReduxStore = Redux.createStore;
    } else
        error('Redux is undefined');
}
/*eslint-enable */

const error = (msg) => { throw new Error(`CausalityRedux: ${msg}`); };

const objectType = (obj) => Object.prototype.toString.call(obj).slice(8, -1);

const makeReducerName = changerName => `${changerName}Reducer`;

const findPartition = (partitionName) => {
    const partition = CausalityRedux.partitionDefinitions.find(e =>
        partitionName === e.partitionName
    );
    return partition;
};

const findPlugin = (pluginId) => {
    const plugin = _plugins.find(e =>
        pluginId === e.pluginId
    );
    return plugin;
};

const discloseToListeners = (obj) => {
    _onListenerListeners.forEach(e => {
        e(obj);
    });
};

const discloseStateChange = (obj) => {
    _onStateChangeListeners.forEach(e => {
        e(obj);
    });
};

const indicateStateChange = (partitionName, type, operation, prevState, nextState, changerName, reducerName, theirArgs) => {
    if (_onStateChangeListeners.length > 0) {
        if (changerName === setStateChangerName)
            operation = setStateChangerName;
        const obj = {
            partitionName: partitionName.toString(),
            type: type,
            operation: typeof operation === undefinedString ? 'User defined' : operation,
            prevState,
            nextState,
            changerName,
            reducerName,
            args: theirArgs
        };
        discloseStateChange(obj);
    }
};

const indicateListener = (partitionName, nextState, listenerName) => {
    if (_onListenerListeners.length > 0) {
        const obj = {
            partitionName: partitionName.toString(),
            nextState: nextState,
            listenerName: listenerName
        };
        discloseToListeners(obj);
    }
};

// Can only subscribe as a listener on a partition.  
const internalSubscriber = (listener, partitionName, stateEntries, listenerName) => {
    const arr = [...stateEntries];
    const obj = { id: _subscriberId++, listener, partitionName, stateEntries: arr, listenerName };
    _listeners.push(obj);
    return obj.id;
};

const internalUnsubscriber = (id) => {
    _listeners = _listeners.filter((item) => item.id !== id);
};

const internalExecuteChanger = (store, stateEntry, changerName, reducerName, changerArguments) => {
    const action = stateEntry.changers[changerName](...changerArguments);
    // User defined changer. Check validity of the returned action object.
    if (typeof stateEntry.changerDefinitions[changerName] === undefinedString) {
        if (typeof action === undefinedString || objectType(action) !== 'Object') {
            error(`Changer ${changerName} must return an action object.`);
            return;
        }
    // This is operations.STATE_FUNCTION_CALL. No dispatch action is to be taken.
    } else if (typeof action === undefinedString)
        return;
    action.type = typeof action.type === undefinedString ? '' : action.type;
    // Set the reducer so that it can be called in the generalReducer.
    action.reducer = stateEntry.reducers[reducerName];
    action.partitionName = stateEntry.partitionName;
    action.reducerName = reducerName;
    // redux dispatch
    store.dispatch(action);
};

//
// Whenever a changer is called, this is actually what executes.
// It calls the actual changer and then stores info in the action object returned by the changer.
// The associated reducer is saved also so that the generalReducer can call it.
// Then redux dispatch is called.
//
const internalPartitionChanger = (store, stateEntry, changerName, reducerName) => {
    return function () {
        internalExecuteChanger(store, stateEntry, changerName, reducerName, arguments);
    };
};

//
// This is called in the store partition to subscribe to changes to the partition.
//
const internalPartitionSubscriber = (partitionName) => {
    return (
        // If stateEntries == [] or undefined, listen to all keys in the partition.
        function (listener, stateEntries = [], listenerName = '') {
            if ( typeof listener !== 'function')
                error('subscribe: first argument must be a function.');
            if (!Array.isArray(stateEntries))
                stateEntries = [stateEntries];
            
            const partition = findPartition(partitionName);
            stateEntries.forEach(se => {
                let found = false;
                if (typeof partition.defaultState[se] !== undefinedString)
                    found = true;
                else {
                    getKeys(partition.changerDefinitions).forEach(key => {
                        if (key === se) {
                            if (stateEntries.length > 1)
                                error('Can only subscribe to one changer event.');
                            found = true;
                        }
                    });
                }
                if (!found)
                    throw `${se} is not a valid key in the state partition ${partitionName}.`;
            });
                
            const id = internalSubscriber(listener, partitionName, stateEntries, listenerName);
            // Return an unsubscriber function
            return (function (id) {
                return function () {
                    internalUnsubscriber(id);
                };
            })(id);
        }
    );
};

// getState for the partiton    
const internalPartitionGetState = (store, partitionName) => {
    return function () {
        return store.getState()[partitionName];
    };
};

const executeSetState = (partitionName, theArg, noCheckCompare) => {
    if (!objectType(theArg))
        error('The Argument to setState must be an object.');
    const actionObj = {
        theirArgs: [theArg],
        isSetState: true,
        noCheckCompare,
        arguments: [],
        type: setStateChangerName,
        changerName: setStateChangerName,
        partitionName
    };    
    _store.dispatch(actionObj);
};

// setState for the partiton    
const internalPartitionSetState = (partitionName) => {
    return function (theObjectArg, noCheckCompare) {
        executeSetState(partitionName, theObjectArg, noCheckCompare);
    };
};

const validateStateEntry = (stateEntry) => {
    if (typeof stateEntry.partitionName === undefinedString)
        error('partitionName not found.');
    if (typeof stateEntry.defaultState === undefinedString)
        error(`defaultState missing from entry: ${stateEntry.partitionName}`);
};

//
// Each partition has access to the changers and its own subscribe, getState and setState functions
// with a partitionState proxy.
//
const setupPartition = (store, stateEntry) => {
    validateStateEntry(stateEntry);
    const partitionName = stateEntry.partitionName;
    store[partitionName] = {};
    const partitionStoreObject = store[partitionName];
    getKeys(stateEntry.changers).forEach(o => {
        const reducerName = makeReducerName(o);
        const isPlugin = typeof stateEntry.changerDefinitions[o] !== undefinedString && typeof stateEntry.changerDefinitions[o].pluginId !== undefinedString;
        if (!isPlugin) {
            if (typeof stateEntry.reducers[reducerName] === undefinedString)
                error(`'Reducer: ${reducerName} not found.`);
        }
        partitionStoreObject[o] = internalPartitionChanger(store, stateEntry, o, reducerName);
    });

    partitionStoreObject.subscribe = internalPartitionSubscriber(partitionName);
    partitionStoreObject.getState = internalPartitionGetState(store, partitionName);
    partitionStoreObject.setState = internalPartitionSetState(partitionName);
    partitionStoreObject.partitionState = getPartitionProxy(partitionName, store[partitionName]);
};

const buildStateEntryChangersAndReducers = (entry) => {
    if (!entry.changerDefinitions)
        return;
    
    const isArrayOperation = (arg) =>
        arg === operations.STATE_ARRAY_ADD || arg === operations.STATE_ARRAY_DELETE || arg === operations.STATE_ARRAY_ENTRY_MERGE;

    const checkArguments = (defaultState, changerName, changerArgs, theirArgs) => {
        if (theirArgs.length !== changerArgs.length)
            error(`Incorrect number of arguments for ${changerName} call.`);

        for (let i = 0; i < theirArgs.length; ++i) {
            if (typeof defaultState[changerArgs[i]] === undefinedString)
                error(`Invalid argument name "${changerArgs[i]}" for ${changerName} call.`);
            else {
                if (objectType(defaultState[changerArgs[i]]) !== 'Object') {
                    if (objectType(defaultState[changerArgs[i]]) !== objectType(theirArgs[i]))
                        error(`Incorrect argument type for argument #${i + 1} for ${changerName} call.`);
                }
            }
        }
    };

    const compareArrayArgTypesForArray = (o1, o2) => {
        const k1 = getKeys(o1);
        const k2 = getKeys(o2);
        let str = '';
        k1.some(key => {
            if (typeof o2[key] === undefinedString)
                str = `${key} is missing in the first argument`;
            else if (o1[key] !== objectType(o2[key]))
                str = `Invalid type for ${key} in the first argument`;

            return str !== '';
        });
        if (str === '') {
            k2.some(key => {
                if (typeof o1[key] === undefinedString)
                    str = `'${key}' is an invalid field in the first argument`;
                return str !== '';
            });
        }
        return str;
    };

    // Validates a changer entry in a partition definition.        
    const validateChangerArg = (o, changerArg) => {
        getKeys(changerArg).forEach(tag => {
            const valid = changerDefinitionKeys.some(keyName =>
                tag === keyName
            );
            if (!valid)
                error(`${tag} is an invalid entry in ${entry.partitionName}.`);
        });

        if (typeof changerArg.arguments !== undefinedString) {
            if (!Array.isArray(changerArg.arguments))
                error(`'arguments' must be an array for '${o}' in partitionName = ${entry.partitionName}.`);
        }

        if (isArrayOperation(changerArg.operation)) {
            if (typeof changerArg.keyIndexerName !== undefinedString && typeof changerArg.keyName === undefinedString)
                error(`The keyIndexerName is defined in ${o} but keyName is not defined.`);
            if (typeof entry.defaultState[changerArg.arrayName] === undefinedString)
                error(`Missing the 'arrayName' definition for entry '${o}' in partitionName = ${entry.partitionName}.`);
            else if (!Array.isArray(entry.defaultState[changerArg.arrayName]))
                error(`${changerArg.arrayName} is not an array for entry '${o}' in partitionName = ${entry.partitionName}.`);
        } else if (changerArg.operation === operations.STATE_TOGGLE) {
            if (typeof changerArg.impliedArguments === undefinedString || changerArg.impliedArguments.length === 0)
                error(`impliedArguments is required for '${o}' in partitionName = ${entry.partitionName}.`);
            changerArg.impliedArguments.forEach(e => {
                if (objectType(entry.defaultState[e]) !== 'Boolean')
                    error(`The impliedArgument ${e} is not Boolean as required by the Toggle operation in '${o}' of partitionName = ${entry.partitionName}.`);
            });
        } else if (changerArg.operation === operations.STATE_INCREMENT || changerArg.operation === operations.STATE_DECREMENT) {
            if (typeof changerArg.impliedArguments === undefinedString || changerArg.impliedArguments.length !== 1)
                error(`impliedArguments with 1 entry is required for '${o}' in stateName = ${entry.stateName}.`);
            changerArg.impliedArguments.forEach(e => {
                if (objectType(entry.defaultState[e]) !== 'Number')
                    error(`The impliedArgument ${e} is not a Number as required by the ${changerArg.operation} operation in '${o}' of partitionName = ${entry.partitionName}.`);
            });
        } else if (changerArg.operation === operations.STATE_OBJECT_MERGE) {
            if (typeof changerArg.arguments === undefinedString || changerArg.arguments.length === 0)
                error(`'arguments' is required for '${o}' in partitionName = ${entry.partitionName}.`);
            if (changerArg.arguments.length !== 1)
                error(`STATE_OBJECT_MERGE allows only 1 argument for '${o}' in partitionName = ${entry.partitionName}.`);
        } else if (changerArg.operation === operations.STATE_SETTODEFAULTS) {
            if (typeof changerArg.impliedArguments === undefinedString || changerArg.impliedArguments.length === 0)
                error(`'impliedArguments' is required for '${o}' in partitionName = ${entry.partitionName}.`);
        }
    };

    const buildChanger = (partitionName, changerName, changerArg) => {
        return (
            function (...theirArgs) {
                const theArgs = [...theirArgs];
                // This simply calls all those listening to the name of the changer
                if (changerArg.operation === operations.STATE_FUNCTION_CALL) {
                    const listenersToCall = [];
                    _listeners.forEach(listenerEntry => {
                        if (!Array.isArray(listenerEntry.stateEntries))
                            error(`Listenername=${listenerEntry.listenerName}, partitionName=${listenerEntry.partitionName} is not an array.`);

                        listenerEntry.stateEntries.forEach(e => {
                            if (e === changerName)
                                listenersToCall.push(listenerEntry);
                        });
                    });
                    if (listenersToCall.length === 0)
                        error(`There is no subscriber to ${changerName} in ${partitionName}.`);
                    if (changerArg.impliedArguments) {
                        const state = _store[partitionName].getState();
                        if (state) {
                            const argObj = {};
                            changerArg.impliedArguments.forEach(entry => {
                                argObj[entry] = state[entry];
                            });
                            theArgs.push(argObj);
                        }
                    }
                    const nextState = { crFunctionCall: changerName, args: theArgs };
                    indicateStateChange(partitionName, changerName, changerArg.operation, {}, nextState, changerName, changerArg.reducerName, theArgs);
                    listenersToCall.forEach(listener => {
                        indicateListener(partitionName, nextState, listener.listenerName);
                        listener.listener(...theArgs);
                    });
                    // Indicates no reducer should be called and redux dispatch should not be called.
                    return undefined;
                }
                
                // Save important information in the action object
                const actionObj = {
                    changerName,
                    partitionName,
                    theirArgs: theArgs,
                    type: typeof changerArg.type === undefinedString ? changerName : changerArg.type,
                    arguments: typeof changerArg.arguments === undefinedString ? [] : changerArg.arguments,
                    impliedArguments: typeof changerArg.impliedArguments === undefinedString ? [] : changerArg.impliedArguments,
                    operation: typeof changerArg.operation === undefinedString ? operations.STATE_COPY : changerArg.operation,
                    changerDefinition: changerArg
                };    

                // A plugin only validates arguments. Its reducer will be called for the actual change.
                if (typeof changerArg.pluginId !== undefinedString) {
                    const p = findPlugin(changerArg.pluginId);
                    if ( typeof p.validateChangerArguments === 'function')
                        p.validateChangerArguments(...theArgs);
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
                            error(`Only one argument is allowed with ${changerArg.operation} for entry '${changerName}' in partitionName = ${entry.partitionName}.`);

                        if (changerArg.operation === operations.STATE_ARRAY_ADD && typeof changerArg.arrayArgShape !== undefinedString) {
                            const str = compareArrayArgTypesForArray(changerArg.arrayArgShape, theArgs[0]);
                            if (str !== '')
                                error(`${str} for ${changerName}`);
                        }
                    } else {
                        if (theArgs.length !== 2)
                            error(`Two arguments are required with ${changerArg.operation} for entry '${changerName}' in partitionName = ${entry.partitionName}.`);
                        if (typeof changerArg.arrayArgShape !== undefinedString) {
                            const str = compareArrayArgTypesForArray(changerArg.arrayArgShape, theArgs[1]);
                            if (str !== '')
                                error(`${str} for ${changerName}`);
                        }
                    }
                    if (changerArg.operation === operations.STATE_ARRAY_DELETE || changerArg.operation === operations.STATE_ARRAY_ENTRY_MERGE)
                        actionObj.arrayArg = theArgs[0].toString();
                    else
                        actionObj.arrayArg = theArgs[0];

                    actionObj.arrayEntryArg = theArgs[1];
                    actionObj.arrayName = changerArg.arrayName;
                    actionObj.keyIndexerName = changerArg.keyIndexerName;
                    actionObj.keyName = changerArg.keyName;
                } else if (changerArg.operation === operations.STATE_OBJECT_MERGE) {
                    if (theArgs.length !== 1)
                        error(`STATE_OBJECT_MERGE allows only 1 argument for ${changerName}.`);
                    actionObj[actionObj.arguments[0]] = theArgs[0];
                } else if (changerArg.operation === operations.STATE_SETTODEFAULTS || changerArg.operation === operations.STATE_TOGGLE) {
                    if (theArgs.length !== 0)
                        error(`${changerArg.operation} allows only 0 arguments for ${changerName}`);
                } else if (changerArg.operation !== operations.STATE_FUNCTION_CALL) {
                    checkArguments(entry.defaultState, changerName, actionObj.arguments, theArgs);
                    if (theArgs.length > 0) {
                        for (let i = 0; i < theArgs.length; ++i) {
                            actionObj[actionObj.arguments[i]] = theArgs[i];
                        }
                    }
                }

                return actionObj;
            }
        );
    };

    //
    // Supports internally defined operations.
    //
    const internalDefinedReducer = (changerName, changerArg) => {
        return (
            function (state, action) {
                const newState = merge({}, state);
                let newArray = [];
                let key, index;
                if (typeof action.operation === undefinedString)
                    action.operation = operations.STATE_COPY;

                // Below implements the reducers for the standard operations.
                switch (action.operation) {
                    case operations.STATE_COPY:
                        action.arguments.forEach((entry) => {
                            newState[entry] = action[entry];
                        });
                        break;
                    case operations.STATE_TOGGLE:
                        action.impliedArguments.forEach((entry) => {
                            newState[entry] = !newState[entry];
                        });
                        break;
                    case operations.STATE_INCREMENT:
                        action.impliedArguments.forEach((entry) => {
                            newState[entry] = newState[entry] + 1;
                        });
                        break;
                    case operations.STATE_DECREMENT:
                        action.impliedArguments.forEach((entry) => {
                            newState[entry] = newState[entry] - 1;
                        });
                        break;
                    case operations.STATE_SETTODEFAULTS:
                        changerArg.impliedArguments.forEach(argEntry => {
                            newState[argEntry] = _defaultState[action.partitionName][argEntry];
                        });
                        break;
                    case operations.STATE_ARRAY_ADD:
                        newArray = [...newState[action.arrayName]];
                        if (action.keyIndexerName) {
                            let nextIndex = parseInt(newState[action.keyIndexerName]) || 0;
                            action.arrayArg[action.keyName] = nextIndex.toString();
                            ++nextIndex;
                            newState[action.keyIndexerName] = nextIndex.toString();
                        }
                        newArray.push(action.arrayArg);
                        newState[action.arrayName] = newArray;
                        break;
                    case operations.STATE_ARRAY_DELETE:
                        newArray = newState[action.arrayName].filter(entry => {
                            if (typeof entry[action.keyName] === undefinedString)
                                return false;    
                            return entry[action.keyName].toString() !== action.arrayArg;
                        });
                        newState[action.arrayName] = newArray;
                        break;
                    case operations.STATE_ARRAY_ENTRY_MERGE:
                        newArray = [...newState[action.arrayName]];
                        index = newArray.findIndex(entry => {
                            if (typeof entry[action.keyName] === undefinedString)
                                return false;
                            return entry[action.keyName].toString() === action.arrayArg;
                        });
                        if (index >= 0) {
                            newArray[index] = merge({}, newArray[index], action.arrayEntryArg);
                            newState[action.arrayName] = newArray;
                        }  
                        break;
                    case operations.STATE_OBJECT_MERGE:
                        key = action.arguments[0];
                        newState[key] = merge({}, newState[key], action[key]);
                        break;
                    default:
                        error(`Unknown operation entry in ${changerName}.`);
                }
                return newState;
            }
        );
    };

    if ( typeof entry.changers === undefinedString  )
        entry.changers = {};
    
    if (typeof entry.reducers === undefinedString)
        entry.reducers = {};  
    
    //
    // Setup the internal changers and reducers.
    //
    getKeys(entry.changerDefinitions).forEach( o => {
        const changerArg = entry.changerDefinitions[o];
        if (typeof changerArg === undefinedString)
            error(`Changer definition argument for ${o} must be defined`);
        
        validateChangerArg(o, changerArg);

        // Make the changer            
        entry.changers[o] = buildChanger(entry.partitionName, o, changerArg);

        const reducerName = makeReducerName(o);
        
        // No reducer, define one.
        if (typeof entry.reducers[reducerName] === undefinedString) {
            // Plugin reducer
            if (typeof changerArg.pluginId !== undefinedString)
                entry.reducers[reducerName] = findPlugin(changerArg.pluginId).reducer;
            // Auto build reducer
            else
                entry.reducers[reducerName] = internalDefinedReducer(o, changerArg);
        }
    });
}; 

function validatePartition(stateEntry) {
    let changerKeys = [];
    if (typeof stateEntry.changerDefinitions !== undefinedString)
        changerKeys = getKeys(stateEntry.changerDefinitions);
    if (typeof stateEntry.changers !== undefinedString)
        changerKeys = [...changerKeys, ...getKeys(stateEntry.changers)];           

    changerKeys.forEach(e => {
        const found = invalidChangerKeys.some(e2 => e2 === e );
        if ( found ) 
            error(`${e} is an invalid changer name.`);            
    });

    stateEntryRequiredKeys.forEach( entry => {
        if ( typeof stateEntry[entry] === undefinedString )
            error(`${entry} is a required entry in ${stateEntry.partitionName}.`);
    });

    getKeys(stateEntry).forEach( o => {
        const isvalid = stateEntryValidKeys.some(entry =>
            o === entry
        );
        if (!isvalid)
            error(`${o} is not a valid entry in ${stateEntry.partitionName}.`);
    });

    changerKeys.forEach(e => {
        const cd = stateEntry.changerDefinitions[e];
        if (typeof cd !== undefinedString) {
            const pluginId = cd.pluginId;
            if (typeof pluginId !== undefinedString) {
                const p = findPlugin(pluginId);
                if (typeof p === undefinedString)
                    error(`Plugin with id ${pluginId} is not defined`);
                if ( typeof p.validatePartitionEntry === 'function' )
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
function setOptions(options = {}) {
    if ( options.onStateChange ) {
        if ( typeof options.onStateChange !== 'function' )
            error('options.onStateChange must be a function.');
        _onStateChangeListeners.push(options.onStateChange);
    }
    if ( options.onListener ) {
        if ( typeof options.onListener !== 'function' )
            error('options.onListener must be a function.');
        _onListenerListeners.push(options.onListener);
    }
}
    
function init(partitionDefinitions, preloadedState, enhancer, options={}) {
    if ( typeof partitionDefinitions === undefinedString )
        error('Missing first parameter partitionDefinitions.');
    setOptions(options);

    //
    // This is the general reducer for redux. When a changer is called, the reducer for the changer was placed
    // in the action object so it is known what reducer to call in the code below.
    //
    const generalReducer = (state = _defaultState, action) => {
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
        const newState = merge({}, state);

        // This handles correcting the redux store for partitions defined after the redux store is created.            
        if (action.type === internalActionType) {
            if (typeof newState[action.partitionName] === undefinedString) {
                newState[action.partitionName] = merge({}, action.defaultState);
            } else {
                // This is for a pre-hydrated state.
                getKeys(action.defaultState).forEach(key => {
                    if (typeof newState[action.partitionName][key] === undefinedString) 
                        newState[action.partitionName][key] = action.defaultState[key];
                });
            }
            if (typeof _startState[action.partitionName] === undefinedString) {
                _startState[action.partitionName] = merge({}, action.defaultState);
            } else {
                // This is for a pre-hydrated state.
                getKeys(action.defaultState).forEach(key => {
                    if (typeof _startState[action.partitionName][key] === undefinedString) 
                        _startState[action.partitionName][key] = action.defaultState[key];
                });
            }
            return newState;
        }

        // Call the reducer for the associated changer on the partition state.
        if (action.isSetState)
            newState[action.partitionName] = merge({}, state[action.partitionName], action.theirArgs[0]);    
        else if (typeof action.reducer === 'function')
            newState[action.partitionName] = action.reducer(state[action.partitionName], action);
        else if (typeof action.pluginCallback === 'function') {
            // The plugin might set a redux store value which is illegal while in the reducer.
            // So, use a setTimeout so that we are guaranteed to not be in this reducer.
            setTimeout(action.pluginCallback, 1, ...action.theirArgs);
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
        if ( !action.noCheckCompare && shallowEqual( newState[action.partitionName], state[action.partitionName] ) )
            return state;
        
        // This only applies to ancient browsers.
        handleAddKeysToProxyObject(_store, action.partitionName, state, newState);
        
        // For all listeners, disclose a state change.
        indicateStateChange(action.partitionName, action.type, action.operation, state[action.partitionName], newState[action.partitionName], action.changerName, action.reducerName, action.theirArgs);

        // This is used to determine what partition listeners are involved in this change.           
        _partitionsThatChanged[action.partitionName] = true;
        return newState;
    };

    //
    // One listener for redux
    //
    const generalListener = () => {
        const state = _store.getState();
        // Determine what listeners to call. First, only partitions that have changed will be examined.
        getKeys(_partitionsThatChanged).forEach(o => {
            _listeners.forEach((item) => {
                if (o === item.partitionName) {
                    const partitionState = state[o];   
                    // This listener wants to be called for any changes on the partition.
                    if (item.stateEntries.length === 0) {
                        indicateListener(o, partitionState, item.listenerName);
                        item.listener(partitionState);
                    // This listener wants to be called only when specific entries in the partition are changed.
                    } else {
                        let areEqual = true;
                        // Determine what entries in the partition changed.
                        if (typeof item.prevState === undefinedString) {
                            item.stateEntries.forEach(se => {
                                areEqual = areEqual && partitionState[se] === _startState[o][se];
                            });

                        } else {
                            item.stateEntries.forEach(entry => {
                                areEqual = areEqual && partitionState[entry] === item.prevState[entry];
                            });
                        }
                        //
                        // There are changed entries. Build an object that contains all those entries that this listener wants.
                        // This object will be sent in as an argument to the listener. 
                        //
                        if (!areEqual) {
                            const nextState = {};
                            item.stateEntries.forEach(entry => {
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
    
    partitionDefinitions.forEach( entry => {
        _defaultState[entry.partitionName] = merge({},entry.defaultState);
    });

    // handle initial hydration of the redux store.        
    let newObj = {};
    if ( typeof preloadedState !== undefinedString ) {
        const stateKeys = [...getKeys(_defaultState), ...getKeys(preloadedState)];
        stateKeys.forEach( key => {
            newObj[key] = merge({}, _defaultState[key], preloadedState[key]);
        });
    } else
        newObj = undefined;

    _reduxStore = createReduxStore(generalReducer, newObj, enhancer);
    
    _store = Object.create(_reduxStore);
    _store.subscribe(generalListener);

    partitionDefinitions.forEach( entry => {
        addPartitionInternal(entry);
    });
}

// Make sure the plugin has the required keys.    
const verifyPlugin = (plugin) => {
    pluginRequiredKeys.forEach(e => {
        if (typeof plugin[e] === undefinedString)
            error(`Key ${e} is missing from the plugin.`);
        if (typeof plugin.reducer !== 'function' && typeof plugin.pluginCallback !== 'function')
            error('The plugin must have either a reducer function or a pluginCallback function.');    
    });
};

// creates the causality-redux store.
function createStore(partitionDefinitions = [], preloadedState, enhancer, options) {
    if (!Array.isArray(partitionDefinitions))
        partitionDefinitions = [partitionDefinitions];
    // This allows createStore to be called more than once for hot re-loading or other reasons.
    if (_store !== null) {
        addPartitions(partitionDefinitions);
        setOptions(options);
        return _store;
    }

    partitionDefinitions = partitionDefinitions.filter(entry =>
        typeof findPartition(entry.partitionName) === undefinedString
    );
    const p = _partitionDefinitions.concat(partitionDefinitions);
    _partitionDefinitions = [];
    init(p, preloadedState, enhancer, options);
    // call all those that called onStoreCreated with a listener for the store being created.
    _completionListeners.forEach(e => e());
    _completionListeners = [];
    // Add the subscribers that had subscribed before the store was created.
    _subscribers.forEach(e => {
        if (typeof _store[e.partitionName] === undefinedString)
            error('${e.partitionName} is an invalid partition.');
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
    // Do not allow a partition with the same name as an existing partition.
    partitionDefinitions = partitionDefinitions.filter(entry =>
        typeof findPartition(entry.partitionName) === undefinedString
    );
    if (_store !== null) {
        partitionDefinitions.forEach(entry => {
            _defaultState[entry.partitionName] = merge({}, entry.defaultState);
            const action = {};
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
    pluginObjs = pluginObjs.filter(entry =>
        typeof findPlugin(entry.pluginId) === undefinedString
    );
    
    pluginObjs.forEach(pluginObj => {
        verifyPlugin(pluginObj);
        _plugins.push(pluginObj);
        if(typeof pluginObj.partitionDefinitions !== undefinedString)
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
        if (typeof _store[partitionName] === undefinedString)
            error('${partitionName} is an invalid partition.');    
        _store[partitionName].subscribe(listener, arrKeys, listenerName);
    } else
        _subscribers.push({partitionName, listener, arrKeys, listenerName});
}
    
// Use this to initialize your business logic when you don't know when the store is created.
// This way, when the completionListener is called you can guarantee that your store partition is defined. 
function onStoreCreated(completionListener) {
    if ( typeof completionListener !== 'function' )
        error('onStoreCreated argument is not a function.');
    if ( _store !== null ) 
        completionListener();
    else
        _completionListeners.push(completionListener);
}


function uniqueKey(templateName) {
    if (!templateName)
        templateName = 'causalityredux';
    let id = 0;
    let key = templateName;
    while (uniqueKeys[key]) {
        key = templateName + id.toString();
        ++id;
    }
    uniqueKeys[key] = true;
    return (key);
}

//
// Allows the creation of module data that is proxied during development.
// This means changes to the data at the top level keys can be tracked by causality-redux and
// indicated to the caller using dataChangeListener.
//
const getModuleData = (DEBUG, defaultState, dataChangeListener) => {
    if (DEBUG) {
        const partitionName = uniqueKey();
        if ( typeof defaultState === undefinedString)
            error('defaultState is undefined.');
        if (CausalityRedux.store === null)
            error('CausalityRedux not initialized.');

        // Init the store partition
        CausalityRedux.addPartitions({partitionName, defaultState});

        // Get the proxy to the data store.    
        const moduleData = CausalityRedux.store[partitionName].partitionState;
        let unsubscribe = null;
        if (typeof dataChangeListener === 'function')
            unsubscribe = CausalityRedux.store[partitionName].subscribe(dataChangeListener);
        return { moduleData, unsubscribe, partitionName };
    }    
    
    return { moduleData: defaultState };
};

const CausalityRedux = {
    createStore,
    addPartitions,
    addPlugins,
    subscribe,
    onStoreCreated,
    //
    // Do not call setOptions in hot reloadedable code.
    // The listener would be called for each time the module is loaded.
    //
    setOptions,
    shallowEqual,
    merge,
    getKeys,
    operations,
    getModuleData,
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
    }
};

export default CausalityRedux;

