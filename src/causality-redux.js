/** @preserve © 2017 Andrew Banks ALL RIGHTS RESERVED */

/**
 * @constructor
 */

import { createStore } from 'redux'

const CausalityRedux = (function () {
    const _operations = {
        STATE_COPY              : 1,
        STATE_ARRAY_ADD         : 2,
        STATE_ARRAY_DELETE      : 3,
        STATE_ARRAY_ENTRY_MERGE : 4,
        STATE_OBJECT_MERGE      : 5,
        STATE_TOGGLE            : 6,
        STATE_FUNCTION_CALL     : 7,
        STATE_SETTODEFAULTS     : 8,
        STATE_INCREMENT         : 9,
        STATE_DECREMENT         : 10
    }
    
    const changerDefinitionKeys = [
        'arguments',
        'impliedArguments',
        'type',
        'operation',
        'arrayName',
        'keyIndexerName',
        'keyName',
        'arrayArgShape'
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

    const undefinedString = 'undefined';
    
    const _defaultState = {};

    let _store = null;
    let _reduxStore = null;
    let changes = {};
    let listeners = [];
    let subscriberId = 0;
    let _partitionDefinitions = [];
    let _options = {};
    let _onStateChange = null;
    let _onListener = null;
    let startState = null;
    let completionListeners = [];
    let subscribers = [];

    const error = (msg) => {throw new Error(`CausalityRedux: ${msg}`);};

    const _merge = Object.assign;

    let createReduxStore;
    if ( typeof createStore !== undefinedString ) {
        createReduxStore = createStore;
    }

    if ( typeof createReduxStore === undefinedString ) {
        if ( typeof Redux === undefinedString ) {
            error('Redux is undefined');
        }
        createReduxStore = Redux.createStore;
    }

    const objectType = (obj) => Object.prototype.toString.call(obj).slice(8, -1);
    
	function _shallowEqual(objA, objB) {
        if (objA === objB) {
            return true;
        }

        const keysA = Object.keys(objA);
        const keysB = Object.keys(objB);

        if (keysA.length !== keysB.length) {
            return false;
        }

        const hasOwn = Object.prototype.hasOwnProperty;
        for (let i = 0; i < keysA.length; i++) {
            if (!hasOwn.call(objB, keysA[i]) || objA[keysA[i]] !== objB[keysA[i]]) {
                return false;
            }
        }

        return true;
	}
    
    const findPartition = (partitionName) => {
        const partition = CausalityRedux.partitionDefinitions.find( e =>
            partitionName === e.partitionName
        );
        return partition;
    };
    
    const indicateStateChange = (partitionName, type, operation, prevState, nextState, changerName, theirArgs) => {
        if ( typeof _onStateChange === 'function') {
            const obj = {
                partitionName: partitionName,
                type: type,
                operation: typeof operation === undefinedString ? 'User defined' : operation,
                prevState,
                nextState,
                changerName,
                args: theirArgs
            };
            _onStateChange(obj);
        }
    };
    
    const indicateListener = (partitionName, nextState, listenerName) => {
        if ( typeof _onListener === 'function') {
            const obj = {
                partitionName: partitionName,
                nextState: nextState,
                listenerName: listenerName
            };
            _onListener(obj);
        }
    };

    const generalUnsubscriber = (id) => {
        listeners = listeners.filter((item) => item.id !== id);
    };
    
    const generalSubscriber = (listener, partitionName, stateEntries=[], listenerName) => {
        const arr = _merge([], stateEntries);
        const obj = {id: subscriberId++, listener, partitionName, stateEntries: arr, listenerName: listenerName};
        listeners.push(obj);
        return obj.id;
    };
    
    function setupStateEntry(store, stateEntry) {
        if ( typeof stateEntry.partitionName === undefinedString  )
            error('partitionName not found.');
        if ( typeof stateEntry.defaultState === undefinedString  )
            error(`defaultState missing from entry: ${stateEntry.partitionName}`);
        if ( typeof stateEntry.changers === undefinedString  )
            error(`changers missing from entry: ${stateEntry.partitionName}`);
        if ( typeof stateEntry.reducers === undefinedString  )
            error(`reducers missing from entry: ${stateEntry.partitionName}`);
        store[stateEntry.partitionName] = {};
        for ( const o in stateEntry.changers ) {
            const reducerName = `${o}Reducer`;
            if ( typeof stateEntry.reducers[reducerName] === undefinedString )
                error(`'Reducer: ${reducerName} not found.`);
            store[stateEntry.partitionName][o] = (function(o,reducerName) {
                return function() {
                    const x = stateEntry.changers[o](...arguments);
                    if ( typeof x === undefinedString )
                        return;
                    x.type = typeof x.type === undefinedString ? '' : x.type;
                    x.reducer = stateEntry.reducers[reducerName];
                    x.partitionName = stateEntry.partitionName;
                    x.reducerName = reducerName;
                    store.dispatch( x );
                };
            })(o,reducerName);
        }
        store[stateEntry.partitionName].subscribe = (function (partitionName) {
            return(
                function(listener, stateEntries, listenerName='') {
                    if ( !Array.isArray(stateEntries ) )
                        error('subscribe: the 2nd argument must be an array of keys to listen on.');
                    const partition = findPartition(partitionName);
                    stateEntries.forEach( se => {
                        let found = false;
                        if ( typeof partition.defaultState[se] !== 'undefined' )
                            found = true;
                        else {
                            for ( const key in partition.changerDefinitions ) {
                                if ( key === se ) {
                                    if ( stateEntries.length > 1 ) {
                                        error('Can only subscribe to one changer event.');
                                    }
                                    found = true;
                                }
                            }
                        }
                        if ( !found )
                            throw `${se} is not a valid key in the state partition ${partitionName}.`;
                    });
                    
                    const id = generalSubscriber(listener, partitionName, stateEntries, listenerName);
                    return (function(id) {
                        return  function() {
                            generalUnsubscriber(id);
                        };
                    })(id);
                }
            );
        })(stateEntry.partitionName);
        store[stateEntry.partitionName].getState = (function (store, partitionName) {
            return function(){
                const state = store.getState();
                return state[partitionName];
            };
        })(store, stateEntry.partitionName);
    }
    
    const buildStateEntryChangersAndReducers = (entry) => {
        if ( !entry.changerDefinitions )
            return;

        const checkArguments = (defaultState, changerName, changerArgs, theirArgs) => {
            if ( theirArgs.length !== changerArgs.length )
                error(`Incorrect number of arguments for ${changerName} call.`);

            for ( let i = 0; i < theirArgs.length; ++i ) {
                if ( typeof defaultState[changerArgs[i]] === undefinedString  )
                    error(`Invalid argument name "${changerArgs[i]}" for ${changerName} call.`);
                else {
                    if ( objectType(defaultState[changerArgs[i]]) !== 'Object' ) {
                        if ( objectType(defaultState[changerArgs[i]]) !== objectType(theirArgs[i]) )
                            error(`Incorrect argument type for argument #${i+1} for ${changerName} call.`);
                    }
                }
            }
        };

        const compareArrayArgTypesForArray = ( o1, o2 ) => {
            const k1 = Object.keys(o1);
            const k2 = Object.keys(o2);
            let str = '';
            k1.some( key => {
                if ( typeof o2[key] === undefinedString  )
                    str = `${key} is missing in the first argument`;
                else if ( o1[key] !== objectType(o2[key]) )
                    str = `Invalid type for ${key} in the first argument`;

                return str !== '';
            });
            if ( str === '' ) {
                k2.some( key => {
                    if ( typeof o1[key] === undefinedString  )
                        str = `'${key}' is an invalid field in the first argument`;
                    return str !== '';
                });
            }
            return str;
        };

        const isArrayOperation = (arg) =>
            arg === _operations.STATE_ARRAY_ADD || arg === _operations.STATE_ARRAY_DELETE || arg === _operations.STATE_ARRAY_ENTRY_MERGE; 

        for ( const o in entry.changerDefinitions ) {
            const arg = entry.changerDefinitions[o];
            for ( const tag in arg ) {
                const valid = changerDefinitionKeys.some( keyName =>
                    tag === keyName
                );
                if ( !valid )
                    error(`${tag} is an invalid entry in ${entry.partitionName}.`);
            }
        }

        if ( typeof entry.changers === undefinedString  )
            entry.changers = {};
        for ( const o in entry.changerDefinitions ) {
            const changerArg = entry.changerDefinitions[o];

            if ( typeof changerArg.arguments !== undefinedString ) {
                if ( !Array.isArray(changerArg.arguments) )
                    error(`'arguments' must be an array for '${o}' in partitionName = ${entry.partitionName}.`);
            }
            if ( typeof changerArg === undefinedString  )
                error(`Changer definition argument for ${o} must be defined`);
            if ( isArrayOperation(changerArg.operation) ) {
                 if ( typeof changerArg.keyIndexerName !== undefinedString && typeof changerArg.keyName === undefinedString  )
                    error(`The keyIndexerName is defined in ${o} but keyName is not defined.`);
                if ( typeof entry.defaultState[changerArg.arrayName] === undefinedString )
                    error(`Missing the 'arrayName' definition for entry '${o}' in partitionName = ${entry.partitionName}.`);
                else if ( !Array.isArray(entry.defaultState[changerArg.arrayName]) )
                    error(`${changerArg.arrayName} is not an array for entry '${o}' in partitionName = ${entry.partitionName}.`);
            } else if (changerArg.operation === _operations.STATE_TOGGLE ) {
                if ( typeof changerArg.impliedArguments === undefinedString || changerArg.impliedArguments.length === 0 )
                    error(`impliedArguments is required for '${o}' in partitionName = ${entry.partitionName}.`);
                changerArg.impliedArguments.forEach( e => {
                    if ( objectType(entry.defaultState[e]) !== 'Boolean' )
                        error(`The impliedArgument ${e} is not Boolean as required by the Toggle operation in '${o}' of partitionName = ${entry.partitionName}.`);
                });
            } else if (changerArg.operation === _operations.STATE_INCREMENT || changerArg.operation === _operations.STATE_DECREMENT ){
                if ( typeof changerArg.impliedArguments === undefinedString || changerArg.impliedArguments.length !== 1 )
                    error(`impliedArguments with 1 entry is required for '${o}' in stateName = ${entry.stateName}.`); 
                changerArg.impliedArguments.forEach( e => {
                    if ( objectType(entry.defaultState[e]) !== 'Number' )
                        error(`The impliedArgument ${e} is not a Number as required by the ${changerArg.operation} operation in '${o}' of partitionName = ${entry.partitionName}.`);
                });
            } else if (changerArg.operation === _operations.STATE_OBJECT_MERGE ) {
                if ( typeof changerArg.arguments === undefinedString || changerArg.arguments.length === 0 )
                    error(`'arguments' is required for '${o}' in partitionName = ${entry.partitionName}.`);
                if ( changerArg.arguments.length !== 1 )
                    error(`STATE_OBJECT_MERGE allows only 1 argument for '${o}' in partitionName = ${entry.partitionName}.`);
            } else if (changerArg.operation === _operations.STATE_SETTODEFAULTS ) {
                if ( typeof changerArg.impliedArguments === undefinedString || changerArg.impliedArguments.length === 0 )
                    error(`'impliedArguments' is required for '${o}' in partitionName = ${entry.partitionName}.`);
            }
            entry.changers[o] = (function(partitionName, changerName, changerArg) {
                return (
                    function (...theirArgs) {
                        const theArgs = [...theirArgs];
                        if ( changerArg.operation === _operations.STATE_FUNCTION_CALL ) {
                            const listenersToCall = [];
                            listeners.forEach( listenerEntry => {
                                if ( !Array.isArray(listenerEntry.stateEntries) )
                                    error(`Listenername=${listenerEntry.listenerName}, partitionName=${listenerEntry.partitionName} is not an array.`);

                                listenerEntry.stateEntries.forEach( e => {
                                    if ( e === changerName )
                                        listenersToCall.push(listenerEntry);
                                });
                            });
                            if ( listenersToCall.length === 0 )
                                error(`There is no subscriber to ${changerName} in ${partitionName}.`);
                            if ( changerArg.impliedArguments ) {
                                const state = _store[partitionName].getState();
                                if ( state ) {
                                    const argObj = {};
                                    changerArg.impliedArguments.forEach( entry => {
                                        argObj[entry] = state[entry];
                                    });
                                    theArgs.push(argObj);
                                }
                            }
                            const nextState = {functionArguments: theArgs};
                            indicateStateChange(partitionName, changerName, changerArg.operation, {}, nextState, changerName, theArgs);
                            listenersToCall.forEach( listener => {
                                indicateListener(partitionName, nextState, listener.listenerName);
                                listener.listener(...theArgs);
                            });
                            return undefined;
                        }
                        const obj = {};
                        obj.changerName = changerName;
                        obj.theirArgs = theArgs;
                        obj.type = typeof changerArg.type === undefinedString ? changerName : changerArg.type;
                        obj.arguments = typeof changerArg.arguments === undefinedString ? [] : changerArg.arguments;
                        obj.impliedArguments = typeof changerArg.impliedArguments === undefinedString ? [] : changerArg.impliedArguments;
                        obj.operation = typeof changerArg.operation === undefinedString ? _operations.STATE_COPY: changerArg.operation;
                        obj.partitionName = partitionName;

                        if ( isArrayOperation(changerArg.operation) ) {
                            if ( changerArg.operation === _operations.STATE_ARRAY_ADD ) {
                                if ( objectType(theArgs[0]) !== 'Object' )
                                    error('STATE_ARRAY_ADD can only accept pure base objects. You must define your own changers and reducers for this object.');
                            }

                            if ( changerArg.operation === _operations.STATE_ARRAY_ADD || changerArg.operation === _operations.STATE_ARRAY_DELETE ) {
                                if ( theArgs.length !== 1 )
                                    error(`Only one argument is allowed with ${changerArg.operation} for entry '${changerName}' in partitionName = ${entry.partitionName}.`);

                                if ( changerArg.operation === _operations.STATE_ARRAY_ADD && typeof changerArg.arrayArgShape !== undefinedString ) {
                                    const str = compareArrayArgTypesForArray(changerArg.arrayArgShape, theArgs[0] );
                                    if ( str !== '' )
                                        error(`${str} for ${changerName }`);
                                }
                            } else {
                                if ( theArgs.length !== 2 )
                                    error(`Two arguments are required with ${changerArg.operation} for entry '${changerName}' in partitionName = ${entry.partitionName}.`);
                                if ( typeof changerArg.arrayArgShape !== undefinedString ) {
                                    const str = compareArrayArgTypesForArray(changerArg.arrayArgShape, theArgs[1] );
                                    if ( str !== '' )
                                        error(`${str} for ${changerName }`);
                                }
                            }
                            if ( changerArg.operation === _operations.STATE_ARRAY_DELETE || changerArg.operation === _operations.STATE_ARRAY_ENTRY_MERGE )
                                obj.arrayArg = theArgs[0].toString();
                            else 
                                obj.arrayArg = theArgs[0];

                            obj.arrayEntryArg = theArgs[1];
                            obj.arrayName = changerArg.arrayName;
                            obj.keyIndexerName = changerArg.keyIndexerName;
                            obj.keyName = changerArg.keyName;
                        } else if ( changerArg.operation === _operations.STATE_OBJECT_MERGE ) {
                             if ( theArgs.length !== 1 )
                                error(`STATE_OBJECT_MERGE allows only 1 argument for ${changerName}.`);
                             obj[obj.arguments[0]] = theArgs[0];
                        } else if ( changerArg.operation === _operations.STATE_SETTODEFAULTS || changerArg.operation === _operations.STATE_TOGGLE ) {
                             if ( theArgs.length !== 0 )
                                error(`${changerArg.operation} allows only 0 arguments for ${changerName}`);
                        } else if ( changerArg.operation !== _operations.STATE_FUNCTION_CALL ) {
                            checkArguments(entry.defaultState, changerName, obj.arguments, theArgs);
                            if ( theArgs.length > 0 ) {
                                for ( let i = 0; i < theArgs.length; ++i ) {
                                    obj[obj.arguments[i]] = theArgs[i];
                                }
                            }
                        }

                        return obj;
                    }
                );
            })(entry.partitionName, o, changerArg);

            const reducerName = `${o}Reducer`;
            let reducer = undefined;
            if ( typeof entry.reducers !== undefinedString )
                reducer = entry.reducers[reducerName];
            if ( typeof reducer !== undefinedString ) {
                entry.reducers[reducerName] = (function(reducer) {
                    return (
                        function(state, action) {
                            const args = [state];
                            action.arguments.forEach((entry) => {
                                args.push(action[entry]);
                            });
                            return reducer(...args);
                        }
                    );
                })(reducer);
            } else {
                if ( typeof entry.reducers === undefinedString  )
                    entry.reducers = {};
                entry.reducers[reducerName] = (function(changerName) {
                    return (
                        function(state, action) {
                            const retObj = _merge({}, state);
                            let newArray = [];
                            let key;
                            let index;
                            if ( typeof action.operation === undefinedString  )
                                action.operation = _operations.STATE_COPY;

                            switch (action.operation) {
                                case _operations.STATE_COPY:
                                    action.arguments.forEach((entry) => {
                                        retObj[entry] = action[entry];
                                    });
                                    break;
                                case _operations.STATE_TOGGLE:
                                    action.impliedArguments.forEach((entry) => {
                                        retObj[entry] = !retObj[entry];
                                    });
                                    break;
                                case _operations.STATE_INCREMENT:
                                    action.impliedArguments.forEach((entry) => {
                                        retObj[entry] = retObj[entry] + 1;
                                    });
                                    break;
                                case _operations.STATE_DECREMENT:
                                    action.impliedArguments.forEach((entry) => {
                                        retObj[entry] = retObj[entry] - 1;
                                    });
                                    break;
                                case _operations.STATE_SETTODEFAULTS:
                                    changerArg.impliedArguments.forEach( argEntry => {
                                        retObj[argEntry] = _defaultState[action.partitionName][argEntry];
                                    });
                                    break;
                                case _operations.STATE_ARRAY_ADD:
                                    newArray = [...retObj[action.arrayName]];
                                    if ( action.keyIndexerName ) {
                                        let nextIndex = parseInt(retObj[action.keyIndexerName]) || 0;
                                        action.arrayArg[action.keyName] = nextIndex.toString();
                                        ++nextIndex;
                                        retObj[action.keyIndexerName] = nextIndex.toString();
                                    }
                                    newArray.push(action.arrayArg);
                                    retObj[action.arrayName] = newArray;
                                    break;
                                case _operations.STATE_ARRAY_DELETE:
                                    newArray = retObj[action.arrayName].filter( entry =>
                                        entry[action.keyName] !== action.arrayArg
                                    );
                                    retObj[action.arrayName] = newArray;
                                    break;
                                case _operations.STATE_ARRAY_ENTRY_MERGE:
                                    newArray = [...retObj[action.arrayName]];
                                    index = retObj[action.arrayName].findIndex( entry =>
                                        entry[action.keyName] === action.arrayArg
                                    );
                                    if ( index >= 0 ) {
                                        newArray[index] = _merge(newArray[index], action.arrayEntryArg);
                                        retObj[action.arrayName] = newArray;
                                    }
                                    break;
                                case _operations.STATE_OBJECT_MERGE:
                                    key = action.arguments[0];
                                    retObj[key] = _merge(retObj[key], action[key]);
                                    break;
                                default:
                                    error(`Unknown operation entry in ${changerName}.`);
                            }
                            return retObj;
                        }
                    );
                })(o);
            }
        }
    }; 

    function addPartitionInternal(partitionDefinition) {
        const partitionDefinitions = [partitionDefinition];
        _partitionDefinitions =  _partitionDefinitions.concat(partitionDefinitions);
        partitionDefinitions.forEach( stateEntry => {
            stateEntryRequiredKeys.forEach( entry => {
                if ( typeof stateEntry[entry] === undefinedString  ) {
                    error(`${entry} is a required entry in ${stateEntry.partitionName}.`);
                }
            });

            for ( const o in stateEntry ) {
                const isvalid = stateEntryValidKeys.some( entry =>
                    o === entry
                );
                if ( !isvalid )
                    error(`${o} is not a valid entry in ${stateEntry.partitionName}.`);
            }

            buildStateEntryChangersAndReducers(stateEntry);
            setupStateEntry(_store, stateEntry);
        });
    }
        
    function init(partitionDefinitions, preloadedState, enhancer, options={}) {
        if ( typeof partitionDefinitions === undefinedString )
            error('Missing first parameter partitionDefinitions.');
        _options = _merge({}, options);
        if ( _options.onStateChange ) {
            if ( typeof _options.onStateChange !== 'function' )
                error('options.onStateChange must be a function.');
            _onStateChange = _options.onStateChange;
        }
        if ( _options.onListener ) {
            if ( typeof _options.onListener !== 'function' )
                error('options.onListener must be a function.');
            _onListener = _options.onListener;
        }

        const generalReducer = (state=_defaultState, action) => {
            if ( !startState )
                startState = state;
            if ( typeof action.reducer !== 'function' )
                return state;
           
            const newState = {};
            _partitionDefinitions.forEach( (entry)=>{
                newState[entry.partitionName] = state[entry.partitionName];
            });
            newState[action.partitionName] = action.reducer(state[action.partitionName], action);
            
            if ( _shallowEqual( newState[action.partitionName], state[action.partitionName] ) )
                return state;
            
            indicateStateChange(action.partitionName, action.type, action.operation, state[action.partitionName], newState[action.partitionName], action.changerName, action.theirArgs);
 
            changes[action.partitionName] = true;
            return newState;
        };

        const generalListener = () => {
            const state = _store.getState();
            for ( const o in changes ) {
                listeners.forEach((item) => {
                    if ( o === item.partitionName ) {
                        if ( item.stateEntries.length === 0 ) {
                            indicateListener(o, state[o], item.listenerName);
                            item.listener(state[o]);
                        } else {
                            let areEqual = true;
                            if ( typeof item.prevState === undefinedString ) {
                                item.stateEntries.forEach( se => {
                                    areEqual = areEqual && state[o][se] === startState[o][se];
                                });

                            } else {
                                item.stateEntries.forEach( entry => {
                                    areEqual = areEqual && state[o][entry] === item.prevState[entry];
                                });
                            }
                            if ( !areEqual ) {
                                const nextState = {};
                                item.stateEntries.forEach( entry => {
                                    nextState[entry] = state[o][entry];
                                });
                                item.prevState = nextState;

                                indicateListener(o, nextState, item.listenerName);
                                item.listener(nextState);                                
                            }
                        }
                    }
                });
            }
            changes = {};
        };
        
        partitionDefinitions.forEach( entry => {
            _defaultState[entry.partitionName] = _merge({},entry.defaultState);
        });

        let newObj = {};
        if ( typeof preloadedState !== undefinedString ) {
            const defaultStateKeys = Object.keys(_defaultState);
            defaultStateKeys.forEach( key => {
                newObj[key] = _merge({}, _defaultState[key], preloadedState[key]);
            });
        } else
            newObj = undefined;

        _reduxStore = createReduxStore(generalReducer, newObj, enhancer);
      
        _store = Object.create(_reduxStore);
        _store.subscribe(generalListener);

        partitionDefinitions.forEach( entry => {
            addPartitionInternal(entry);
        });

        return _store;
    }

    return {
        createStore(partitionDefinitions=[], preloadedState, enhancer, options ) {
            if ( _store !== null )
                error('CausalityRedux is already initialized.');
            const p = _partitionDefinitions.concat(partitionDefinitions);
            _partitionDefinitions = [];
            _store = init(p, preloadedState, enhancer, options );
            completionListeners.forEach( e => e() );
            completionListeners = [];
            subscribers.forEach( e => {
                _store[e.partitionName].subscribe(e.listener, e.arrKeys, e.listenerName); 
            });
            subscribers = [];
            return _store;
        },
        addPartitions(partitionDefinitions) {
            if ( _store !== null )
                error('CausalityRedux has already been initialized. This addPartition will not work.');
            if ( !Array.isArray(partitionDefinitions) )
                partitionDefinitions = [partitionDefinitions];
            _partitionDefinitions = _partitionDefinitions.concat(partitionDefinitions);
        },
        subscribe(partitionName, listener, arrKeys, listenerName) {
            if ( typeof listener !== 'function' )
                error('subscribe listener argument is not a function.');
            if ( !Array.isArray(arrKeys) )
                error('subscribe: the 3rd argument must be an array of keys to listen on.');
            if ( _store !== null )
                _store[partitionName].subscribe(listener, arrKeys, listenerName);
            else
                subscribers.push({partitionName, listener, arrKeys, listenerName});
        },
        onStoreCreated(completionListener) {
            if ( typeof completionListener !== 'function' )
                error('onStoreCreated argument is not a function.');
            if ( _store !== null ) 
                completionListener();
            else
                completionListeners.push(completionListener);
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
})();

if ( typeof window !== 'undefined' )
    window['CausalityRedux'] = CausalityRedux;
module.exports = CausalityRedux;

