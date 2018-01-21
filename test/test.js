/* eslint no-console: 0 */
//
// Handle mocha testing.
//
import { createStore as reduxCreateStore } from 'redux'
const assert = require('assert')
const isEqual = require('lodash/isEqual')
const merge = require('lodash/merge')

let testRedux = false
let CausalityRedux
// Use the source when testing with the debugger. This is "Debug Mocha Tests" entry.
if (process.env.NODE_ENV === 'debugTesting') {
  CausalityRedux = require('../src/causality-redux.js').default
  // Test the minimized version. "Run Production Tests" entry.
} else if (process.env.NODE_ENV === 'production') {
  global['Redux'] = require('redux')
  require('../dist/causality-redux.min')
  CausalityRedux = global['CausalityRedux']
  delete global['CausalityRedux']
  // Test the lib version. "Run Mocha Tests" entry.
} else {
  CausalityRedux = require('../lib/causality-redux.js').default
}

if (process.env.WHICH_ENV === 'isredux') {
  testRedux = true
  console.log('Testing redux co-existence integration.')
}

describe('CausalityRedux definition', function () {
  it('CausalityRedux should exist', function () {
    assert(typeof CausalityRedux !== 'undefined')
  })
  it('CausalityRedux.createStore should exist', function () {
    assert(typeof CausalityRedux.createStore !== 'undefined')
  })
})

let commentsPartitionState
let commentsSetState
const COMMENTS_STATE = 'Comments'

// Comment state entry
const reduxComments = {
  partitionName: COMMENTS_STATE,
  // No type checking of obj
  defaultState: {items: [], author: '', text: '', idToDelete: '', idToChange: '', authorToChange: '', nextIndex: 0, obj: {}},
  controllerFunctions: {
    'onResetAuthorToDefault': () => {
      commentsPartitionState.author = ''
    },
    'onAuthorChange': author => {
      if (typeof author !== 'string') {
        throw new Error()
      }
      commentsPartitionState.author = author
    },
    'onTextChange': text => {
      if (typeof text !== 'string') {
        throw new Error()
      }
      commentsPartitionState.text = text
    },
    'onObjectCopy': obj => {
      commentsPartitionState.obj = obj
    },
    'onObjectMerge': obj => {
      if (typeof obj === 'undefined') {
        throw new Error()
      }
      let o = CausalityRedux.merge({}, commentsPartitionState.obj, obj)
      commentsSetState({ obj: o })
    },
    'onIdChange': idToDelete => {
      commentsPartitionState.idToDelete = idToDelete
    },
    'onIdChangeForChange': idToChange => {
      commentsPartitionState.idToChange = idToChange
    },
    'onAuthorChangeForChange': authorToChange => {
      commentsPartitionState.authorToChange = authorToChange
    },
    'onArrayChange': items => {
      if (!Array.isArray(items)) {
        throw new Error()
      }
      commentsPartitionState.items = items
    },
    'onAddComment': obj => {
      if (typeof obj.author !== 'string') {
        throw new Error()
      }
      if (typeof obj.text !== 'string') {
        throw new Error()
      }
      if (Object.keys(obj).length !== 2) {
        throw new Error()
      }
      obj.id = commentsPartitionState.nextIndex++
      const arr = commentsPartitionState.items
      arr.push(obj)
      commentsPartitionState.items = arr
    },
    'onChangeComment': (id, obj) => {
      if (typeof id === 'undefined') {
        throw new Error()
      }
      if (typeof obj === 'undefined') {
        throw new Error()
      }
      if (typeof obj.author !== 'string') {
        throw new Error()
      }
      if (Object.keys(obj).length !== 1) {
        throw new Error()
      }
      const arr = commentsPartitionState.items
      const index = arr.findIndex(element =>
        element.id === id
      )
      arr[index] = CausalityRedux.merge({}, arr[index], obj)
      commentsPartitionState.items = arr
    },
    'onDeleteComment': id => {
      if (typeof id === 'undefined') {
        throw new Error()
      }
      const arr = commentsPartitionState.items
      commentsPartitionState.items = arr.filter(element =>
        element.id !== id
      )
    },
    'onSetVideoUserDimensions': (id, obj) => {
      if (typeof id === 'undefined') {
        throw new Error()
      }
      if (typeof obj === 'undefined') {
        throw new Error()
      }
      const arr = commentsPartitionState.items
      const index = arr.findIndex(element =>
        element.id === id
      )
      arr[index] = CausalityRedux.merge({}, arr[index], obj)
      commentsPartitionState.items = arr
    }
  }
}

let reduxDemoPartitionState
const DEMO_STATE = 'Demo'
const reduxDemo = {
  partitionName: DEMO_STATE,
  defaultState: {isLess: true},
  uiServiceFunctions: {
    'onToggleIsLess': () => {
      reduxDemoPartitionState.isLess = !reduxDemoPartitionState.isLess
    }
  }
}

let reduxCounterPartitionState
const COUNTER_STATE = 'Counter'
const reduxCounter = {
  partitionName: COUNTER_STATE,
  defaultState: {counter: 0},
  uiServiceFunctions: {
    'onIncrement': () => {
      reduxCounterPartitionState.counter++
    },
    'onDecrement': () => {
      reduxCounterPartitionState.counter--
    }
  }
}

let causalityChainPartitionState
const OUTSIDE_EVENT = 'OUTSIDE_EVENT'
const causalityChain = {
  partitionName: OUTSIDE_EVENT,
  defaultState: {event: 0},
  uiServiceFunctions: {
    'onOutside': event =>
      (causalityChainPartitionState.event = event)
  }
}

const failArg1 = {
  partitionName: 'FAILARG1',
  defaultState: {arg: 0},
  uiServiceFunctions: {
    'setState': arg =>
      (causalityChainPartitionState.arg = arg)
  }
}

const failArg2 = {
  partitionName: 'FAILARG2',
  defaultState: {arg: 0},
  uiServiceFunctions: {
    'getState': arg =>
      (causalityChainPartitionState.arg = arg)
  }
}

const failArg3 = {
  partitionName: 'FAILARG3',
  defaultState: {arg: 0},
  uiServiceFunctions: {
    'partitionState': arg =>
      (causalityChainPartitionState.arg = arg)
  }
}

const failArg4 = {
  partitionName: 'FAILARG4',
  defaultState: {arg: 0},
  uiServiceFunctions: {
    'subscribe': arg =>
      (causalityChainPartitionState.arg = arg)
  }
}

const failArg5 = {
  partitionName: 'FAILARG5',
  defaultState: {arg: 0},
  uiServiceFunctions: {
    'testing': {}
  }
}

const failArg6 = {
  partitionName: 'FAILARG6',
  defaultState: {arg: 0},
  uiServiceFunctions: 0
}

//
// Test initial state
//
const hydrateState = {Demo: {isLess: false}, Counter: {counter: 1}, Comments: {items: [], author: '', text: 'xxxx', idToDelete: 'zzz', idToChange: '', authorToChange: '', nextIndex: '', obj: {}}}

const ACTION1 = 'ACTION1'
function action1 (val) {
  return {
    type: ACTION1,
    val
  }
}
function reducer1 (state = '', action) {
  switch (action.type) {
    case ACTION1:
      return action.val
    default:
      return state
  }
}

const ACTION2 = 'ACTION2'
function action2 (val) {
  return {
    type: ACTION2,
    val
  }
}
function reducer2 (state = '', action) {
  switch (action.type) {
    case ACTION2:
      return action.val
    default:
      return state
  }
}

const ACTION3 = 'ACTION3'
function action3 (val) {
  return {
    type: ACTION3,
    val
  }
}
function reducer3 (state = '', action) {
  switch (action.type) {
    case ACTION3:
      return action.val
    default:
      return state
  }
}

const reduxReducer = {
  reduxStoreKey1: reducer1,
  reduxStoreKey2: reducer2
}

let store
let reduxStore
if (testRedux) {
  reduxStore = reduxCreateStore(CausalityRedux.combineReducers(reduxReducer), hydrateState)
  store = CausalityRedux.setReduxStore(reduxStore, reduxReducer, hydrateState)
  CausalityRedux.addPartitions([reduxComments, reduxCounter])
} else {
  store = CausalityRedux.createStore([reduxComments, reduxCounter], hydrateState)
}
commentsPartitionState = CausalityRedux.store[COMMENTS_STATE].partitionState
commentsSetState = CausalityRedux.store[COMMENTS_STATE].setState
reduxCounterPartitionState = CausalityRedux.store[COUNTER_STATE].partitionState

function changeAction1 (val) {
  reduxStore.dispatch(action1(val))
}

function changeAction2 (val) {
  reduxStore.dispatch(action2(val))
}

function changeAction3 (val) {
  reduxStore.dispatch(action3(val))
}

CausalityRedux.addPartitions([causalityChain, reduxDemo])
reduxDemoPartitionState = CausalityRedux.store[DEMO_STATE].partitionState
causalityChainPartitionState = CausalityRedux.store[OUTSIDE_EVENT].partitionState

if (testRedux) {
  const numIterations = 100
  describe('Test redux compatability.', function () {
    it('The CausalityRedux.setReduxStore returned store should exist', function () {
      assert(store !== 'undefined' && store !== null)
    })
    it('changeAction1 should work.', function () {
      for (let i = 0; i < numIterations; ++i) {
        const val = `action${parseInt(Math.random() * 1000)}`
        changeAction1(val)
        assert(reduxStore.getState()['reduxStoreKey1'] === val)
      }
    })
    it('changeAction2 should work.', function () {
      for (let i = 0; i < numIterations; ++i) {
        const val = `action${parseInt(Math.random() * 1000)}`
        changeAction2(val)
        assert(reduxStore.getState()['reduxStoreKey2'] === val)
      }
    })
    CausalityRedux.addReducers({ reduxStoreKey3: reducer3 })
    it('changeAction3 should work which shows CausalityRedux.addReducers works.', function () {
      for (let i = 0; i < numIterations; ++i) {
        const val = `action${parseInt(Math.random() * 1000)}`
        changeAction3(val)
        assert(reduxStore.getState()['reduxStoreKey3'] === val)
      }
    })
    it('changeAction1 should work after addReducers.', function () {
      for (let i = 0; i < numIterations; ++i) {
        const val = `action${parseInt(Math.random() * 1000)}`
        changeAction1(val)
        assert(reduxStore.getState()['reduxStoreKey1'] === val)
      }
    })
    it('changeAction2 should work after addReducers.', function () {
      for (let i = 0; i < numIterations; ++i) {
        const val = `action${parseInt(Math.random() * 1000)}`
        changeAction2(val)
        assert(reduxStore.getState()['reduxStoreKey2'] === val)
      }
    })
  })
}

if (!testRedux) {
  describe('CausalityRedux.createStore called.', function () {
    it('store should exist', function () {
      assert(store !== 'undefined' && store !== null)
    })
  })
}

const stateObj = {}
const defaultState = CausalityRedux.defaultState
Object.keys(defaultState).forEach(key => {
  stateObj[key] = CausalityRedux.merge({}, defaultState[key])
})

Object.keys(hydrateState).forEach(key => {
  stateObj[key] = CausalityRedux.merge(stateObj[key], hydrateState[key])
})
const theState = CausalityRedux.reduxStore.getState()
stateObj[CausalityRedux.storeVersionKey] = theState[CausalityRedux.storeVersionKey]
// Prove stateObj is a substate of theState
let hydrateStateOK = true
Object.keys(stateObj).forEach(key => {
  hydrateStateOK = hydrateStateOK && isEqual(theState[key], stateObj[key])
})

describe('Test that initial state can be set.', function () {
  it('State should hydrated correctly.', function () {
    assert(hydrateStateOK)
  })
})

const shouldFail = (label, func, ...rest) => {
  try {
    func(...rest)
    return `${label} failed to detect error condition.`
  } catch (m) {
    return ''
  }
}

function testArgument (...rest) {
  const errorStr = shouldFail(...rest)
  it(`${rest[0]} detected`, function () {
    assert(errorStr === '')
  })
}

function subscriberTest () {
}

describe('Verify argument errors are detected.', function () {
  testArgument('CausalityRedux.addPartitions invalid uiServiceFunction key setState', CausalityRedux.addPartitions, [failArg1])
  testArgument('CausalityRedux.addPartitions invalid uiServiceFunction key getState', CausalityRedux.addPartitions, [failArg2])
  testArgument('CausalityRedux.addPartitions invalid uiServiceFunction key partitionState', CausalityRedux.addPartitions, [failArg3])
  testArgument('CausalityRedux.addPartitions invalid uiServiceFunction key subscribe', CausalityRedux.addPartitions, [failArg4])
  testArgument('CausalityRedux.addPartitions invalid uiServiceFunction function', CausalityRedux.addPartitions, [failArg5])
  testArgument('CausalityRedux.addPartitions invalid uiServiceFunction object', CausalityRedux.addPartitions, [failArg6])
  testArgument('onAddComment1 missing text argument', store[COMMENTS_STATE].onAddComment, { 'author': 'this' })
  testArgument('onAddComment2 author wrong type', store[COMMENTS_STATE].onAddComment, {'author': 0, 'text': 'ooo'})
  testArgument('onAddComment3 invalid "that" argument', store[COMMENTS_STATE].onAddComment, { 'author': 'author', 'text': 'str', 'that': 0 })
  testArgument('onAddComment3 invalid "obj" argument', store[COMMENTS_STATE].onAddComment, { 'author': 'author', 'text': 'str', obj: { 'that': 0 } })

  testArgument('onDeleteComment no args and should be 1', store[COMMENTS_STATE].onDeleteComment)
  testArgument('onChangeComment no args and should be 2', store[COMMENTS_STATE].onChangeComment)
  testArgument('onChangeComment 1 args and should be 2', store[COMMENTS_STATE].onChangeComment, 0)
  testArgument('onChangeComment empty 2nd arg', store[COMMENTS_STATE].onChangeComment, 0, {})
  testArgument('onChangeComment 2nd arg author wrong type', store[COMMENTS_STATE].onChangeComment, 0, {'author': 0})
  testArgument('onChangeComment 2nd arg "this" invalid', store[COMMENTS_STATE].onChangeComment, 0, {'author': 'string', 'this': 'this'})

  testArgument('onAuthorChange 2nd author invalid type', store[COMMENTS_STATE].onAuthorChange, 0)
  testArgument('onTextChange missing text argument', store[COMMENTS_STATE].onTextChange)
  testArgument('onArrayChange invalid type argument', store[COMMENTS_STATE].onArrayChange, {})
  testArgument('onAddComment3 invalid return', store[COMMENTS_STATE].onAddComment3, {})

  testArgument('onObjectMerge invalid must have 1 argument has 0', store[COMMENTS_STATE].onObjectMerge)

  testArgument('subscriber did not provide a listener', store[OUTSIDE_EVENT].subscribe)
  testArgument('subscriber provided invalid key.', store[OUTSIDE_EVENT].subscribe, subscriberTest, ['event1'])

  testArgument('Invalid subscribe no listener.', CausalityRedux.subscribe)
  testArgument('Invalid subscribe no keys.', CausalityRedux.subscribe, subscriberTest)
  testArgument('Invalid subscribe invalid key.', CausalityRedux.subscribe, subscriberTest, ['event1'])

  testArgument('Invalid onStoreCreated no listener.', CausalityRedux.onStoreCreated)
})

const commentsState = store[COMMENTS_STATE]
const demoState = store[DEMO_STATE]
const counterState = store[COUNTER_STATE]

let listenersCalled = []

function resetListeners () {
  listenersCalled = []
}

function verifyListeners (expectedListeners) {
  expectedListeners.forEach(entry1 => {
    const isIn = listenersCalled.some(entry2 =>
      entry1 === entry2
    )
    if (!isIn) {
      return `The listener ${entry1} was not called and should have been.`
    }
  })

  listenersCalled.forEach(entry1 => {
    const isIn = expectedListeners.some(entry2 =>
      entry1 === entry2
    )
    if (!isIn) {
      return `The listener ${entry1} was not called and should not have been.`
    }
  })
  resetListeners()

  return ''
}

function verifyStateAction (description, actionArg, toCompare, strListener, strToCompareError) {
  const compareOK = isEqual(actionArg, toCompare)
  describe(description, function () {
    it(strToCompareError, function () {
      assert(compareOK)
    })
  })

  describe(`Verifying only the listener ${strListener} was called.`, function () {
    const errStr = verifyListeners([strListener])
    it(`Only the listener ${strListener} was called.`, function () {
      assert(errStr === '')
    })
  })
}

function verifyStateAction2 (description, actionArg, toCompare, strToCompareError) {
  const compareOK = isEqual(actionArg, toCompare)
  it(strToCompareError, function () {
    assert(compareOK)
  })
}

//
// Listeners. It will be verified that the apporopriate listener was called based on the state change.
//
let gotItems
function listenerCommentItems (state) {
  listenersCalled.push('listenerCommentItems')
  gotItems = state.items
}
const unsubscriber1 = commentsState.subscribe(listenerCommentItems, ['items'])

let author
function listenerCommentAuthor (state) {
  listenersCalled.push('listenerCommentAuthor')
  author = state.author
}
const unsubscriber2 = commentsState.subscribe(listenerCommentAuthor, ['author'])

let text
function listenerCommentText (state) {
  listenersCalled.push('listenerCommentText')
  text = state.text
}
const unsubscriber3 = commentsState.subscribe(listenerCommentText, ['text'])

let idToDelete
function listenerCommentidToDelete (state) {
  listenersCalled.push('listenerCommentidToDelete')
  idToDelete = state.idToDelete
}
const unsubscriber4 = commentsState.subscribe(listenerCommentidToDelete, ['idToDelete'])

let idToChange
function listenerCommentidToChange (state) {
  listenersCalled.push('listenerCommentidToChange')
  idToChange = state.idToChange
}
const unsubscriber5 = commentsState.subscribe(listenerCommentidToChange, ['idToChange'])

let authorToChange
function listenerCommentauthorToChange (state) {
  listenersCalled.push('listenerCommentauthorToChange')
  authorToChange = state.authorToChange
}
const unsubscriber6 = commentsState.subscribe(listenerCommentauthorToChange, ['authorToChange'])

let obj
function listenerCommentobj (state) {
  listenersCalled.push('listenerCommentobj')
  obj = state.obj
}
const unsubscriber7 = commentsState.subscribe(listenerCommentobj, ['obj'])

let isLess
function listenerIsLess (state) {
  listenersCalled.push('listenerIsLess')
  isLess = state.isLess
}
const unsubscriber8 = demoState.subscribe(listenerIsLess, ['isLess'])

let counter
function listenerCounter (state) {
  listenersCalled.push('listenerCounter')
  counter = state.counter
}
const unsubscriber9 = counterState.subscribe(listenerCounter, ['counter'])

let argument

//
// test setState on author
//
argument = 'author2'
commentsState.setState({ author: argument })
verifyStateAction('test setState', argument, author, 'listenerCommentAuthor', 'author set to correct result')

//
// Test the setState and getState proxies.
//
argument = 'author3'
commentsState.partitionState.author = argument

verifyStateAction('test getState/setState proxies', commentsState.partitionState.author, argument, 'listenerCommentAuthor', 'author set to correct result')

//
// test CausalityRedux.operations.STATE_COPY on author
//
argument = 'author1'
commentsState.onAuthorChange(argument)
verifyStateAction('test CausalityRedux.operations.STATE_COPY on author', argument, author, 'listenerCommentAuthor', 'author set to correct result')

//
// test CausalityRedux.operations.STATE_COPY on text
//
argument = 'text1'
commentsState.onTextChange(argument)
verifyStateAction('test CausalityRedux.operations.STATE_COPY on text', argument, text, 'listenerCommentText', 'text set to correct result')

//
// test CausalityRedux.operations.STATE_COPY on idToDelete
//
argument = 'id1'
commentsState.onIdChange(argument)
verifyStateAction('test CausalityRedux.operations.STATE_COPY on idToDelete', argument, idToDelete, 'listenerCommentidToDelete', 'idToDelete set to correct result')

//
// test CausalityRedux.operations.STATE_COPY on idToChange
//
argument = 'id1'
commentsState.onIdChangeForChange(argument)
verifyStateAction('test CausalityRedux.operations.STATE_COPY on idToChange', argument, idToChange, 'listenerCommentidToChange', 'idToChange set to correct result')

//
// test CausalityRedux.operations.STATE_COPY on authorToChange
//
argument = 'authorx'
commentsState.onAuthorChangeForChange(argument)
verifyStateAction('test CausalityRedux.operations.STATE_COPY on authorToChange', argument, authorToChange, 'listenerCommentauthorToChange', 'authorToChange set to correct result')

//
// test CausalityRedux.operations.STATE_COPY on obj
//
argument = {item: 'authorx1'}
commentsState.onObjectCopy(argument)
verifyStateAction('test CausalityRedux.operations.STATE_COPY on obj', argument, obj, 'listenerCommentobj', 'obj set to correct result')

//
// test CausalityRedux.operations.STATE_COPY on obj
//
argument = {item: 'authorx1', anotherArg: 'anotherArg'}
commentsState.onObjectCopy(argument)
verifyStateAction('test CausalityRedux.operations.STATE_COPY on obj, 2nd arg new', argument, obj, 'listenerCommentobj', 'obj set to correct result')

//
// test CausalityRedux.operations.STATE_COPY on obj
//
argument = {item: 'authorx1', anotherArg: 'anotherArg2'}
commentsState.onObjectCopy(argument)
verifyStateAction('test CausalityRedux.operations.STATE_COPY on obj, 2nd arg change', argument, obj, 'listenerCommentobj', 'obj set to correct result')

//
// test CausalityRedux.operations.STATE_OBJECT_MERGE on obj
//
argument = {item: 'authorx1', anotherArg: 'anotherArg2', anotherArg2: 'anotherArg3'}
commentsState.onObjectMerge({anotherArg2: 'anotherArg3'})
verifyStateAction('test CausalityRedux.operations.STATE_OBJECT_MERGE on obj, 2nd arg change', argument, obj, 'listenerCommentobj', 'obj set to correct result')

//
// test CausalityRedux.operations.STATE_INCREMENT on COUNTER_STATE counter
//
argument = counterState.getState().counter + 1
counterState.onIncrement()
verifyStateAction('test CausalityRedux.operations.STATE_INCREMENT on COUNTER_STATE ', argument, counter, 'listenerCounter', 'counter set to correct result')

//
// test CausalityRedux.operations.STATE_DECREMENT on COUNTER_STATE counter
//
argument = counterState.getState().counter - 1
counterState.onDecrement()
verifyStateAction('test CausalityRedux.operations.STATE_DECREMENT on COUNTER_STATE ', argument, counter, 'listenerCounter', 'counter set to correct result')

//
// test CausalityRedux.operations.STATE_TOGGLE on DEMO_STATE isLess
//
argument = !demoState.getState().isLess
demoState.onToggleIsLess()
verifyStateAction('test CausalityRedux.operations.STATE_TOGGLE on DEMO_STATE isLess', argument, isLess, 'listenerIsLess', 'isLess set to correct result')

//
// test CausalityRedux.operations.STATE_ARRAY_ADD
//
let expectedItems = [...commentsState.getState().items]
expectedItems.push({'author': 'author', 'text': 'text', id: 0})
argument = {'author': 'author', 'text': 'text'}
commentsState.onAddComment(argument)
verifyStateAction('test CausalityRedux.operations.STATE_ARRAY_ADD', expectedItems, gotItems, 'listenerCommentItems', 'items array are equal')

//
// test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE
//
expectedItems = [...commentsState.getState().items]
expectedItems[0] = {author: 'authorx', text: 'text', id: 0}
argument = {'author': 'authorx'}
commentsState.onChangeComment(0, argument)

verifyStateAction('test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE', expectedItems, gotItems, 'listenerCommentItems', 'items array are equal')

//
// test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE new merge
//
expectedItems = [...commentsState.getState().items]
argument = {'x': 200}
merge(expectedItems[0], argument)
commentsState.onSetVideoUserDimensions(0, argument)
verifyStateAction('test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE new merge', expectedItems, gotItems, 'listenerCommentItems', 'items array are equal')

//
// test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE existing merge
//
expectedItems = [...commentsState.getState().items]
argument = {'x': 300}
merge(expectedItems[0], argument)
commentsState.onSetVideoUserDimensions(0, argument)
verifyStateAction('test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE existing merge', expectedItems, gotItems, 'listenerCommentItems', 'items array are equal')

//
// test CausalityRedux.operations.STATE_ARRAY_DELETE
//
expectedItems = [...commentsState.getState().items]
expectedItems.splice(0, 1)
commentsState.onDeleteComment(0)
verifyStateAction('test CausalityRedux.operations.STATE_ARRAY_DELETE', expectedItems, gotItems, 'listenerCommentItems', 'items array not are equal')

//
// test CausalityRedux.operations.STATE_COPY on array
//
expectedItems = [{id: 0, 'author': 'authorx123'}]
commentsState.onArrayChange(expectedItems)
verifyStateAction('test CausalityRedux.operations.STATE_COPY', expectedItems, gotItems, 'listenerCommentItems', 'items array are equal')

//
// test CausalityRedux.operations.STATE_SETTODEFAULTS
//
argument = ''
commentsState.onResetAuthorToDefault()
verifyStateAction('test CausalityRedux.operations.STATE_SETTODEFAULTS on author', argument, author, 'listenerCommentAuthor', 'author set to default')

//
// Test that all unsubscribers work
//

resetListeners()

unsubscriber1()
unsubscriber2()
unsubscriber3()
unsubscriber4()
unsubscriber5()
unsubscriber6()
unsubscriber7()
unsubscriber8()
unsubscriber9()

function subscriberTestPassedString (subscriberName) {
  return `Subscriber ${subscriberName} is not called, passed.`
}

describe('Testing unsubscribers', function () {
  it(subscriberTestPassedString('listenerCommentAuthor'), function () {
    commentsState.onAuthorChange('author11')
    assert(listenersCalled.length === 0)
  })
  it(subscriberTestPassedString('listenerCommentText'), function () {
    commentsState.onTextChange('test11')
    assert(listenersCalled.length === 0)
  })
  it(subscriberTestPassedString('listenerCommentidToDelete'), function () {
    commentsState.onIdChange('id11')
    assert(listenersCalled.length === 0)
  })
  it(subscriberTestPassedString('listenerCommentidToChange'), function () {
    commentsState.onIdChangeForChange('id12')
    assert(listenersCalled.length === 0)
  })
  it(subscriberTestPassedString('listenerCommentauthorToChange'), function () {
    commentsState.onAuthorChangeForChange('authorx11')
    assert(listenersCalled.length === 0)
  })
  it(subscriberTestPassedString('listenerCommentobj'), function () {
    commentsState.onObjectCopy({item11: 'authorx1'})
    assert(listenersCalled.length === 0)
  })
  it(subscriberTestPassedString('listenerCounter'), function () {
    counterState.onIncrement()
    assert(listenersCalled.length === 0)
  })
  it(subscriberTestPassedString('listenerIsLess'), function () {
    demoState.onToggleIsLess()
    assert(listenersCalled.length === 0)
  })

  it(subscriberTestPassedString('listenerCommentItems'), function () {
    commentsState.onChangeComment(0, {'author': 'authorx1234'})
    assert(listenersCalled.length === 0)
  })
})

//
// Test module data segments used for business code state that is not needed for UI.
//

// Define the data and default values
const defaultData = {
  items: [],
  author: '',
  obj: {}
}

// This is not called in production.
let mdSubscriberCalled = false
const changeListener = () => {
  mdSubscriberCalled = true
}

const ret = CausalityRedux.getModuleData(true, defaultData, changeListener)
let moduleData = ret.moduleData
const moduleState = store[ret.partitionName]

describe('Debug module data test', function () {
  moduleData.author = 'author'
  verifyStateAction2('test author', moduleData.author, 'author', 'author set correctly.')
  verifyStateAction2('test author', moduleState.getState().author, 'author', 'author set correctly.')
  verifyStateAction2('moduleData subscriber called', mdSubscriberCalled, true, 'moduleData subscriber was called.')
  mdSubscriberCalled = false

  const arr = moduleData.items
  arr.push(1)
  moduleData.items = arr

  verifyStateAction2('test items', moduleData.items, [1], 'items set correctly.')
  verifyStateAction2('test items', moduleState.getState().items, [1], 'items set correctly.')
  verifyStateAction2('moduleData subscriber called', mdSubscriberCalled, true, 'moduleData subscriber was called.')
  mdSubscriberCalled = false

  const obj = moduleData.obj
  obj.a = 1
  moduleData.obj = obj

  verifyStateAction2('test obj', moduleData.obj, { a: 1 }, 'obj set correctly.')
  verifyStateAction2('test obj', moduleState.getState().obj, {a: 1}, 'obj set correctly.')
  verifyStateAction2('moduleData subscriber called', mdSubscriberCalled, true, 'moduleData subscriber was called.')
})

moduleData = CausalityRedux.getModuleData(false, defaultData, changeListener).moduleData
mdSubscriberCalled = false

describe('Production module data test', function () {
  moduleData.author = 'author'
  verifyStateAction2('test author', moduleData.author, 'author', 'author set correctly.')
  verifyStateAction2('moduleData subscriber not called', mdSubscriberCalled, false, 'moduleData subscriber not called.')

  const arr = moduleData.items
  arr.push(1)
  moduleData.items = arr

  verifyStateAction2('test items', moduleData.items, [1], 'items set correctly.')
  verifyStateAction2('moduleData subscriber not called', mdSubscriberCalled, false, 'moduleData subscriber not called.')

  const obj = moduleData.obj
  obj.a = 1
  moduleData.obj = obj

  verifyStateAction2('test obj', moduleData.obj, { a: 1 }, 'obj set correctly.')
  verifyStateAction2('moduleData subscriber not called', mdSubscriberCalled, false, 'moduleData subscriber not called.')
})

describe('CausalityRedux storeVersionKey top level key', function () {
  it('storeVersionKey is valid.', function () {
    const state = CausalityRedux.store.getState()
    assert(typeof state[CausalityRedux.storeVersionKey] === 'number')
  })
})

const saveState = CausalityRedux.store.getState()
describe('copyState test', function () {
  it('Current state is not saveState.', function () {
    // Clear out the entire redux store
    CausalityRedux.copyState({})
    const isEq1 = isEqual(saveState, CausalityRedux.store.getState())
    assert(!isEq1)
  })
  it('Current state is the saveState after copyState.', function () {
    CausalityRedux.copyState(saveState)
    const state = CausalityRedux.store.getState()
    const isEq2 = isEqual(state, saveState)
    assert(isEq2)
  })
})

describe('shallowCopyStorePartitions test', function () {
  it('Returned state from shallowCopyStorePartitions is correct.', function () {
    const state1 = CausalityRedux.store.getState()
    const state2 = CausalityRedux.shallowCopyStorePartitions()
    const isEq1 = isEqual(state1, state2)
    assert(isEq1)
  })
})
