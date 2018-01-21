/** @preserve © 2017 Andrew Banks ALL RIGHTS RESERVED */
/* eslint valid-typeof:0 */
import { createStore as reduxCreateStore } from 'redux'
import { error, handleAddKeysToProxyObject, getPartitionProxy, merge, getKeys, shallowEqual, shallowCopy } from './util'
import combineReducers from './combineReducers'

const invalidUIServiceFunctionKeys = [
  'setState',
  'getState',
  'subscribe',
  'partitionState'
]

const stateEntryValidKeys = [
  'partitionName',
  'defaultState',
  'controllerFunctions',
  'uiServiceFunctions'
]

const stateEntryRequiredKeys = [
  'partitionName',
  'defaultState'
]

const undefinedString = 'undefined'

const _defaultState = {}

const internalActionType = '@@causality-redux/INIT'
const internalReduxActionType = '@@causality-redux/Redux/INIT'

const setStateChangerName = 'setState'

let _store = null
let _reduxStore = null
let _partitionsThatChanged = {}
let _listeners = []
let _subscriberId = 0
let _partitionDefinitions = []
let _reduxReducers = {}
const _onStateChangeListeners = []
const _onGlobalStateChangeListeners = []
const _onListenerListeners = []
let _startState = null
let _subscribers = []
const uniqueKeys = {}
const _storeVersionKey = '@@@@@storeVersionKey@@@@@'
const _globalDataKey = '@@@@@globalDataKey@@@@@'
const _storeHistoryKey = '@@@@@history@@@@@'
const _uniqueKeyTemplate = '@@@@@causalityredux'
const _causalityreduxAction = '@@@@@causalityreduxAction@@@@@'

let createReduxStore
if (typeof reduxCreateStore !== undefinedString) {
  createReduxStore = reduxCreateStore
}

/* eslint-disable */
if (typeof createReduxStore === undefinedString) {
    if (typeof Redux !== undefinedString) {
        createReduxStore = Redux.createStore;
    } else
        error('Redux is undefined.');
}
/* eslint-enable */

const objectType = obj => Object.prototype.toString.call(obj).slice(8, -1)

const isObjectType = obj => objectType(obj) === 'Object'

const findPartition = partitionName => {
  const partition = CausalityRedux.partitionDefinitions.find(e =>
    partitionName === e.partitionName
  )
  return partition
}

const discloseToListeners = obj => {
  _onListenerListeners.forEach(e => {
    e(obj)
  })
}

const discloseStateChange = obj => {
  _onStateChangeListeners.forEach(e => {
    e(obj)
  })
}

// Called when a state change occurs on a partition.
const indicateStateChange = (partitionName, type, operation, prevState, nextState, changerName, reducerName, theirArgs, storeVersion) => {
  if (_onStateChangeListeners.length > 0) {
    if (changerName === setStateChangerName) {
      operation = setStateChangerName
    }
    const obj = {
      partitionName: partitionName.toString(),
      type: type,
      operation: typeof operation === undefinedString ? 'User defined' : operation,
      prevState,
      nextState,
      changerName,
      reducerName,
      args: theirArgs,
      [_storeVersionKey]: storeVersion
    }
    discloseStateChange(obj)
  }
}

//
// Any state change regardless of the partition is disclosed with this.
//
const indicateGlobalStateChange = (newState, isCopyState) => {
  if (_onGlobalStateChangeListeners.length > 0) {
    _onGlobalStateChangeListeners.forEach(e => {
      e({ newState, isCopyState })
    })
  }
}

const indicateListener = (partitionName, nextState, listenerName) => {
  if (_onListenerListeners.length > 0) {
    const obj = {
      partitionName: partitionName.toString(),
      nextState: nextState,
      listenerName: listenerName
    }
    discloseToListeners(obj)
  }
}

const internalDispatch = action => {
  action[_causalityreduxAction] = true
  // redux dispatch
  _store.dispatch(action)
}

// Can only subscribe as a listener on a partition.
const internalSubscriber = (listener, partitionName, stateEntries, listenerName) => {
  const arr = [...stateEntries]
  const obj = { id: _subscriberId++, listener, partitionName, stateEntries: arr, listenerName }
  _listeners.push(obj)
  return obj.id
}

const internalUnsubscriber = id => {
  _listeners = _listeners.filter(item => item.id !== id)
}

//
// This is called in the store partition to subscribe to changes to the partition.
//
const internalPartitionSubscriber = partitionName => {
  return (
  // If stateEntries == [] or undefined, listen to all keys in the partition.
    function (listener, stateEntries = [], listenerName = '') {
      if (typeof listener !== 'function') {
        error('subscribe: first argument must be a function.')
      }
      if (!Array.isArray(stateEntries)) {
        stateEntries = [stateEntries]
      }

      const partition = findPartition(partitionName)
      stateEntries.forEach(se => {
        if (typeof partition.defaultState[se] === undefinedString) {
          error(`${se} is not a valid key in the state partition ${partitionName}.`)
        }
      })

      const id = internalSubscriber(listener, partitionName, stateEntries, listenerName)
      // Return an unsubscriber function
      return (function (id) {
        return function () {
          internalUnsubscriber(id)
        }
      })(id)
    }
  )
}

// getState for the partiton
const internalPartitionGetState = (store, partitionName) => {
  return function () {
    return store.getState()[partitionName]
  }
}

const executeSetState = (partitionName, theArg, noCheckCompare) => {
  if (!isObjectType(theArg)) {
    error('The Argument to setState must be an object.')
  }
  const actionObj = {
    theirArgs: [theArg],
    isSetState: true,
    noCheckCompare,
    arguments: [],
    type: setStateChangerName,
    changerName: setStateChangerName,
    partitionName,
    [_causalityreduxAction]: true
  }
  internalDispatch(actionObj)
}

// Copies stateToCopy to the entire redux store.
const copyState = stateToCopy => {
  if (!isObjectType(stateToCopy)) {
    error('The Argument to copyState must be an object.')
  }
  internalDispatch({ stateToCopy, type: '' })
}

// setState for the partiton
const internalPartitionSetState = partitionName => {
  return function (theObjectArg, noCheckCompare) {
    executeSetState(partitionName, theObjectArg, noCheckCompare)
  }
}

//
// Each partition has access to the ui service functions and its own subscribe, getState and setState functions
// with a partitionState proxy.
//
const setupPartition = (store, stateEntry) => {
  const partitionName = stateEntry.partitionName
  store[partitionName] = {}
  const partitionStoreObject = store[partitionName]
  // Put all of the uiServiceFunctions in the store.
  if (typeof stateEntry.uiServiceFunctions !== undefinedString) {
    getKeys(stateEntry.uiServiceFunctions).forEach(o => {
      partitionStoreObject[o] = stateEntry.uiServiceFunctions[o]
    })
  }

  partitionStoreObject.subscribe = internalPartitionSubscriber(partitionName)
  partitionStoreObject.getState = internalPartitionGetState(store, partitionName)
  partitionStoreObject.setState = internalPartitionSetState(partitionName)
  partitionStoreObject.partitionState = getPartitionProxy(partitionName, store[partitionName], stateEntry.defaultState)
}

function validatePartition (stateEntry) {
  if (process.env.NODE_ENV !== 'production') {
    // Handle deprecation
    if (stateEntry.changerDefinitions) {
      error('changerDefinitions is deprecated. Use uiServiceFunctions and define your functions there.')
    }
    if (stateEntry.changers) {
      error('changers is deprecated. Use uiServiceFunctions and define your functions there.')
    }
    if (stateEntry.reducers) {
      error('reducers is deprecated. Use uiServiceFunctions and define your functions there.')
    }
    if (stateEntry.controllerFunctions) {
      console.warn(`${stateEntry.partitionName} partition, controllerFunctions is deprecated. Use uiServiceFunctions instead.`)
    }

    // Verify uiServiceFunctions
    if (typeof stateEntry.uiServiceFunctions !== undefinedString) {
      if (!isObjectType(stateEntry.uiServiceFunctions)) {
        error(`uiServiceFunctions must be an object in ${stateEntry.partitionName}.`)
      }
      getKeys(stateEntry.uiServiceFunctions).forEach(o => {
        invalidUIServiceFunctionKeys.forEach(key => {
          if (key === o) {
            error(`Illegal uiServiceFunction key=${key}.`)
          }
        })
        if (typeof stateEntry.uiServiceFunctions[o] !== 'function') {
          error(`uiServiceFunction ${o} must be a function in ${stateEntry.partitionName}.`)
        }
      })
    }
    // Verify required keys.
    stateEntryRequiredKeys.forEach(entry => {
      if (typeof stateEntry[entry] === undefinedString) {
        error(`${entry} is a required entry in ${stateEntry.partitionName}.`)
      }
    })

    // Verify that they do not use forbidden keys.
    getKeys(stateEntry).forEach(o => {
      const isvalid = stateEntryValidKeys.some(entry =>
        o === entry
      )
      if (!isvalid) {
        error(`${o} is not a valid entry in ${stateEntry.partitionName}.`)
      }
    })
  }
}

function addPartitionInternal (partitionDefinition) {
  // Backward compability.
  if (typeof partitionDefinition.controllerFunctions !== undefinedString) {
    if (typeof partitionDefinition.uiServiceFunctions === undefinedString) {
      partitionDefinition.uiServiceFunctions = partitionDefinition.controllerFunctions
    }
  }
  validatePartition(partitionDefinition)
  setupPartition(_store, partitionDefinition)
  _partitionDefinitions.push(partitionDefinition)
}

//
// Do not call this in hot reloadedable code.
// The listener would be called for each time the module is loaded.
//
function setOptions (options = {}) {
  if (options.onStateChange) {
    if (typeof options.onStateChange !== 'function') {
      error('options.onStateChange must be a function.')
    }
    _onStateChangeListeners.push(options.onStateChange)
  }

  if (options.onGlobalStateChange) {
    if (typeof options.onGlobalStateChange !== 'function') {
      error('options.onGlobalStateChange must be a function.')
    }
    _onGlobalStateChangeListeners.push(options.onGlobalStateChange)
  }

  if (options.onListener) {
    if (typeof options.onListener !== 'function') {
      error('options.onListener must be a function.')
    }
    _onListenerListeners.push(options.onListener)
  }
}

//
// This is the general reducer for redux.
//
const generalReducer = (state = _defaultState, action) => {
  //
  // The _startState is needed for the base case of listeners to determine whether a change occurred to some value in the partition.
  // We can't just use _defaultState because of possible hydration.
  //
  if (!_startState) {
    _startState = shallowCopy(state)
  }

  // Change to the entire redux store.
  if (action.stateToCopy) {
    indicateGlobalStateChange(action.stateToCopy, true)
    return action.stateToCopy
  }

  //
  // Redux assumes a change occurred if a new state object is returned from this reducer.
  // Essentially, this means a new pointer.
  // So, set up a new one in case something changes.
  //
  const newState = shallowCopy(state)

  // This handles correcting the redux store for partitions defined after the redux store is created.
  if (action.type === internalActionType) {
    if (typeof newState[action.partitionName] === undefinedString) {
      newState[action.partitionName] = shallowCopy(action.defaultState)
    } else {
      // This is for a pre-hydrated state.
      getKeys(action.defaultState).forEach(key => {
        if (typeof newState[action.partitionName][key] === undefinedString) {
          newState[action.partitionName][key] = action.defaultState[key]
        }
      })
    }
    if (typeof _startState[action.partitionName] === undefinedString) {
      _startState[action.partitionName] = shallowCopy(action.defaultState)
    } else {
      // This is for a pre-hydrated state.
      getKeys(action.defaultState).forEach(key => {
        if (typeof _startState[action.partitionName][key] === undefinedString) {
          _startState[action.partitionName][key] = action.defaultState[key]
        }
      })
    }
    if (typeof newState[_storeVersionKey] === undefinedString) {
      newState[_storeVersionKey] = 0
    }
    return newState
  }
  // This handles a redux hydration.
  if (action.type === internalReduxActionType) {
    return merge({}, state, action.defaultState)
  }

  // Set state.
  if (action.isSetState) {
    newState[action.partitionName] = merge({}, state[action.partitionName], action.theirArgs[0])
  } else {
    return state // This is for the redux init.
  }

  //
  // Check to see if anything is different. If not, just return the original state.
  // This is shallow equal. It determines equality only on the keys of state.
  // So, if a state entry at a key is a basic type, then equality is performed.
  // If the entry is an object, only pointer equality is checked. Lower objects may be different
  // and an array that had an element pushed directly in the redux store object  will not regester as a change.
  // A noCheckCompare on setState is allowed to proceed unchecked.
  //
  if (!action.noCheckCompare && shallowEqual(newState[action.partitionName], state[action.partitionName])) {
    return state
  }

  // This only applies to ancient browsers.
  handleAddKeysToProxyObject(_store, action.partitionName, state, newState)

  _partitionsThatChanged[action.partitionName] = true

  if (typeof newState[_storeVersionKey] === undefinedString) {
    newState[_storeVersionKey] = 0
  }
  ++newState[_storeVersionKey]

  // For all listeners on this partition, disclose a state change.
  indicateStateChange(action.partitionName, action.type, action.operation, state[action.partitionName], newState[action.partitionName], action.changerName, action.reducerName, action.theirArgs, newState[_storeVersionKey])

  // For any global listener disclose a state change.
  indicateGlobalStateChange(newState, false)
  return newState
}

// Initialize partitions.
function init (partitionDefinitions, preloadedState, enhancer, options = {}) {
  if (typeof partitionDefinitions === undefinedString) {
    error('Missing first parameter partitionDefinitions.')
  }
  setOptions(options)

  //
  // One listener for redux
  //
  const generalListener = () => {
    const state = _store.getState()
    // Determine what listeners to call. First, only partitions that have changed will be examined.
    getKeys(_partitionsThatChanged).forEach(o => {
      _listeners.forEach((item) => {
        if (o === item.partitionName) {
          const partitionState = state[o]
          // This listener wants to be called for any changes on the partition.
          if (item.stateEntries.length === 0) {
            indicateListener(o, partitionState, item.listenerName)
            item.listener(partitionState)
            // This listener wants to be called only when specific entries in the partition are changed.
          } else {
            let areEqual = true
            // Determine what entries in the partition changed.
            if (typeof item.prevState === undefinedString) {
              item.stateEntries.forEach(se => {
                areEqual = areEqual && partitionState[se] === _startState[o][se]
              })
            } else {
              item.stateEntries.forEach(entry => {
                areEqual = areEqual && partitionState[entry] === item.prevState[entry]
              })
            }
            //
            // There are changed entries. Build an object that contains all those entries that this listener wants.
            // This object will be sent in as an argument to the listener.
            //
            if (!areEqual) {
              const nextState = {}
              item.stateEntries.forEach(entry => {
                nextState[entry] = partitionState[entry]
              })

              // Set prevstate so that we know if partition values for this listener
              // changed on the next partition change.
              item.prevState = nextState

              indicateListener(o, nextState, item.listenerName)
              item.listener(nextState)
            }
          }
        }
      })
    })
    _partitionsThatChanged = {}
  }

  partitionDefinitions.forEach(entry => {
    _defaultState[entry.partitionName] = shallowCopy(entry.defaultState)
  })

  // handle initial hydration of the redux store.
  let newObj = {}
  if (typeof preloadedState !== undefinedString) {
    const stateKeys = [...getKeys(_defaultState), ...getKeys(preloadedState)]
    stateKeys.forEach(key => {
      newObj[key] = merge({}, _defaultState[key], preloadedState[key])
    })
  } else {
    newObj = undefined
  }

  if (!_reduxStore) {
    _reduxStore = createReduxStore(generalReducer, newObj, enhancer)
  } else {
    if (newObj) {
      _startState = newObj
      const action = {
        type: internalReduxActionType,
        defaultState: newObj
      }
      _store = _reduxStore
      internalDispatch(action)
    }
  }

  // Oop the redux stope.
  _store = Object.create(_reduxStore)
  _store.subscribe(generalListener)

  partitionDefinitions.forEach(entry => {
    addPartitionInternal(entry)
  })
}

// creates the causality-redux store.
function createStore (partitionDefinitions = [], preloadedState, enhancer, options) {
  if (!Array.isArray(partitionDefinitions)) {
    partitionDefinitions = [partitionDefinitions]
  }
  // This allows createStore to be called more than once for hot re-loading or other reasons.
  if (_store !== null) {
    addPartitions(partitionDefinitions)
    setOptions(options)
    return _store
  }

  partitionDefinitions = partitionDefinitions.filter(entry =>
    typeof findPartition(entry.partitionName) === undefinedString
  )
  const p = _partitionDefinitions.concat(partitionDefinitions)
  _partitionDefinitions = []
  init(p, preloadedState, enhancer, options)
  // Add the subscribers that had subscribed before the store was created.
  _subscribers.forEach(e => {
    if (typeof _store[e.partitionName] === undefinedString) {
      error(`${e.partitionName} is an invalid partition.`)
    }
    _store[e.partitionName].subscribe(e.listener, e.arrKeys, e.listenerName)
  })
  _subscribers = []
  return _store
}

// Add partitions. This allows partitions to be added before and after createStore.
// It also does not allow the same partition name to be included twice.
function addPartitions (partitionDefinitions) {
  if (!Array.isArray(partitionDefinitions)) {
    partitionDefinitions = [partitionDefinitions]
  }

  partitionDefinitions.forEach(entry => {
    if (entry.partitionName === _storeVersionKey) {
      error('Invalid partition name.')
    }
  })

  // This is hot hot reloading.
  // We want to include new definitions in defaultState and new controller function definitions.
  const existingPartitionDefinitions = partitionDefinitions.filter(entry =>
    typeof findPartition(entry.partitionName) !== undefinedString
  )

  // Do not allow a partition with the same name as an existing partition.
  partitionDefinitions = partitionDefinitions.filter(entry =>
    typeof findPartition(entry.partitionName) === undefinedString
  )
  if (_store !== null) {
    // Hot reload.
    // Handle any new keys defined in defaultState
    // Handle any new controller functions also.
    existingPartitionDefinitions.forEach(entry => {
      // Handle new uiServiceFunctions.
      const p = findPartition(entry.partitionName)
      if (!shallowEqual(p.uiServiceFunctions, entry.uiServiceFunctions)) {
        // Remove all the prior functions from the store.
        getKeys(p.uiServiceFunctions).forEach(o => {
          delete _store[p.partitionName][o]
        })
        p.uiServiceFunctions = entry.uiServiceFunctions
        // All ui service functions are made available in the partition store.
        // This way other modules can call them.
        getKeys(p.uiServiceFunctions).forEach(o => {
          _store[p.partitionName][o] = p.uiServiceFunctions[o]
        })
      }
      const newObj = {}
      // New keys
      getKeys(entry.defaultState).forEach(key => {
        // Found a newly defined key in entry.defaultState
        if (typeof _defaultState[entry.partitionName][key] === undefinedString) {
          const val = entry.defaultState[key]
          p.defaultState[key] = val
          _defaultState[entry.partitionName][key] = val
          newObj[key] = val
        }
      })
      // Add the news keys and their initial values to the store
      if (getKeys(newObj).length > 0) {
        executeSetState(entry.partitionName, newObj, true)
      }
    })
    partitionDefinitions.forEach(entry => {
      _defaultState[entry.partitionName] = shallowCopy(entry.defaultState)
      const action = {
        type: internalActionType,
        defaultState: entry.defaultState,
        partitionName: entry.partitionName
      }

      addPartitionInternal(entry)
      internalDispatch(action)
    })
  } else {
    _partitionDefinitions = _partitionDefinitions.concat(partitionDefinitions)
  }
}

// Subscribe to changes in a partition of the store. This can be done before and after createStore.
function subscribe (partitionName, listener, arrKeys, listenerName) {
  if (typeof listener !== 'function') {
    error('subscribe listener argument is not a function.')
  }
  if (!Array.isArray(arrKeys)) {
    arrKeys = [arrKeys]
  }
  if (_store !== null) {
    if (typeof _store[partitionName] === undefinedString) {
      error(`${partitionName} is an invalid partition.`)
    }
    _store[partitionName].subscribe(listener, arrKeys, listenerName)
  } else {
    _subscribers.push({ partitionName, listener, arrKeys, listenerName })
  }
}

function uniqueKey (templateName) {
  if (!templateName) {
    templateName = _uniqueKeyTemplate
  }
  let id = 0
  let key = templateName
  while (uniqueKeys[key]) {
    key = templateName + id.toString()
    ++id
  }
  uniqueKeys[key] = true
  return key
}

//
// Allows the creation of module data that is proxied during development.
// This means changes to the data at the top level keys can be tracked by causality-redux and
// indicated to the caller using dataChangeListener.
//
const getModuleData = (DEBUG, defaultState, dataChangeListener) => {
  if (DEBUG) {
    const partitionName = uniqueKey()
    if (typeof defaultState === undefinedString) {
      error('defaultState is undefined.')
    }
    if (CausalityRedux.store === null) {
      error('CausalityRedux not initialized.')
    }

    // Init the store partition
    CausalityRedux.addPartitions({partitionName, defaultState})

    // Get the proxy to the data store.
    const moduleData = CausalityRedux.store[partitionName].partitionState
    let moduleDataUnsubscribe = null
    if (typeof dataChangeListener === 'function') {
      moduleDataUnsubscribe = CausalityRedux.store[partitionName].subscribe(dataChangeListener)
    }
    return { moduleData, moduleDataUnsubscribe, partitionName }
  }

  return { moduleData: defaultState }
}

//
// Shallow copies the entire redux store and shallow copies the partitions.
//
const shallowCopyStorePartitions = () => {
  const store = CausalityRedux.store.getState()
  // Shallow copy the partitions.
  const storeCopy = CausalityRedux.shallowCopy(store)
  // Shallow copy each key in each partition.
  CausalityRedux.getKeys(storeCopy).forEach(key => {
    storeCopy[key] = CausalityRedux.shallowCopy(store[key])
  })
  return storeCopy
}

//
// The functions below allow co-existence with redux.
//
const reduxReducer = (combineReducersFunction, state, action) => {
  if (action[_causalityreduxAction]) {
    return generalReducer(state, action)
  }
  return merge({}, state, combineReducersFunction(state, action))
}

// Call to ad a reducer object for lazy load.
const addReducers = reducers => {
  if (!_reduxStore) {
    error('setReduxStore must be called before calling addReducers.')
  }
  _reduxReducers = merge({}, _reduxReducers, reducers)
  const crReducer = (state, action) => reduxReducer(combineReducers(_reduxReducers), state, action)
  _reduxStore.replaceReducer(crReducer)
}

// Call this just afdter creating the redux store.
const setReduxStore = (store, reducersObject, hydrate, options) => {
  _reduxStore = store
  if (typeof reducersObject === undefined || !isObjectType(reducersObject)) {
    error('Invalid reducers object.')
  }
  addReducers(reducersObject)
  const crStore = createStore([], hydrate, undefined, options)
  return crStore
}

//
// Global store that can be used anywhere in the program.
//
const createGlobalStore = defaultState => {
  const store = createStore({ partitionName: _globalDataKey, defaultState })
  const globalStore = store[_globalDataKey]

  // globalPartitionState - Access and set individual key values in the global store.
  // globalSetState = Set multiple key values in the global store.
  // globalGetState - Get global store object.
  // globalSubscribe - Subscribe to changes to key values in the global store.
  // globalSubscribe(listener: function, globalStoreKeys = [], listenerName = '')
  // If globalStoreKeys == [] or undefined, listen to all keys in the global partition.

  return {
    globalStore,
    globalPartitionState: globalStore.partitionState,
    globalSetState: globalStore.setState,
    globalGetState: globalStore.getState,
    globalSubscribe: globalStore.subscribe
  }
}

const CausalityRedux = {
  createStore,
  createGlobalStore,
  addPartitions,
  subscribe,
  //
  // Do not call setOptions in hot reloadedable code.
  // The listener would be called for each time the module is loaded.
  //
  setOptions,
  shallowEqual,
  shallowCopy,
  merge,
  getKeys,
  getModuleData,
  copyState,
  shallowCopyStorePartitions,
  setReduxStore,
  addReducers,
  combineReducers,
  addPlugins: () =>
    error('addPlugins is deprecated. Use uiServiceFunctions and define a function there to replace addPlugins.'),
  get operations () {
    return {}
  },
  get store () {
    return _store
  },
  get reduxStore () {
    return _reduxStore
  },
  get defaultState () {
    return _defaultState
  },
  get partitionDefinitions () {
    return _partitionDefinitions
  },
  get onListener () {
    return discloseToListeners
  },
  get storeVersionKey () {
    return _storeVersionKey
  },
  get globalDataKey () {
    return _globalDataKey
  },
  get storeHistoryKey () {
    return _storeHistoryKey
  },
  get reducer () {
    return generalReducer
  },
  get globalStore () {
    return _store[_globalDataKey]
  }
}

export default CausalityRedux
