//
// Handle mocha testing.
//
const assert = require('assert');
const isEqual = require('lodash/isEqual');
const merge = require('lodash/merge');

let CausalityRedux;
// Use the source when testing with the debugger. This is "Debug Mocha Tests" entry.
if (process.env.NODE_ENV === 'debugTesting')
    CausalityRedux = require('../src/causality-redux.js').default;
// Test the minimized version. "Run Production Tests" entry.
else if (process.env.NODE_ENV === 'production') {
    global['Redux'] = require('redux'); 
    require('../dist/causality-redux.min'); 
    CausalityRedux = global['CausalityRedux'];
    delete global['CausalityRedux'];
// Test the lib version. "Run Mocha Tests" entry.
} else
    CausalityRedux = require('../lib/causality-redux.js').default;

describe('CausalityRedux definition', function(){
  it('CausalityRedux should exist', function(){
    assert(typeof CausalityRedux !== 'undefined' );
  });
  it('CausalityRedux.createStore should exist', function(){
    assert(typeof CausalityRedux.createStore !== 'undefined' );
  });
});

const COMMENTS_STATE = 'Comments';

const onAddComment2 = (comment={author: '', text:''}) => {
    return( 
        {
            type: 'onAddComment2',
            comment
        }
    );
};
const onAddComment2Reducer = (state, action) =>
    merge({}, state, { items: [...state.items, action.comment] });
    
const onAddComment3 = (comment = { author: '', text: '' }) => {
    comment;
    return 1;
};
const onAddComment3Reducer = (state, action) =>
    merge({}, state, { items: [...state.items, action.comment] });
    

// Comment state entry
const reduxComments = {
    partitionName: COMMENTS_STATE,
    // No type checking of obj
    defaultState: {items:[], author:'', text: '', idToDelete:'', idToChange:'', authorToChange:'', nextIndex:'', obj:{}},
    changerDefinitions: {
        'onResetAuthorToDefault': { operation : CausalityRedux.operations.STATE_SETTODEFAULTS, impliedArguments: ['author'] },
        'onAuthorChange': { arguments: ['author'] },
        'onTextChange': { arguments: ['text'] }, 
        'onObjectCopy': { arguments: ['obj'] }, 
        'onObjectMerge': { operation: CausalityRedux.operations.STATE_OBJECT_MERGE, arguments:['obj'] },
        'onIdChange': { arguments: ['idToDelete'] }, 
        'onIdChangeForChange': { arguments: ['idToChange'] },
        'onAuthorChangeForChange': { arguments: ['authorToChange'] },
        'onArrayChange': { arguments: ['items'] },         
        'onAddComment': { operation: CausalityRedux.operations.STATE_ARRAY_ADD, arrayName:'items', keyName:'id', keyIndexerName:'nextIndex', arrayArgShape:{author:'String', text:'String'} },   
        'onChangeComment': { operation: CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE, arrayName:'items', keyName: 'id', arrayArgShape:{author:'String'} },
        'onDeleteComment': {  operation: CausalityRedux.operations.STATE_ARRAY_DELETE, arrayName:'items', keyName: 'id' }, 
        'onSetVideoUserDimensions': { operation: CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE, arrayName:'items', keyName: 'id'}
    },
    changers:   {
        onAddComment2,
        onAddComment3
    },
    reducers:   {
        onAddComment2Reducer,
        onAddComment3Reducer
    }           
};

const DEMO_STATE = 'Demo';
const reduxDemo = {
    partitionName: DEMO_STATE,
    defaultState: {isLess: true},
    changerDefinitions:{
        'onToggleIsLess': { operation: CausalityRedux.operations.STATE_TOGGLE, impliedArguments: ['isLess'] }  
    }
};
    
const COUNTER_STATE = 'Counter';
const reduxCounter = {
    partitionName: COUNTER_STATE,
    defaultState: {counter: 0},
    changerDefinitions:{
        'onIncrement': { operation: CausalityRedux.operations.STATE_INCREMENT, impliedArguments: ['counter'] },
        'onDecrement': { operation: CausalityRedux.operations.STATE_DECREMENT, impliedArguments: ['counter'] }
    }
};

const OUTSIDE_EVENT = 'OUTSIDE_EVENT';
const causalityChain = {
    partitionName: OUTSIDE_EVENT,
    defaultState: {event:0},
    changerDefinitions: {
        'onOutside':    {operation: CausalityRedux.operations.STATE_FUNCTION_CALL, impliedArguments: ['event'] }
    }
};

//
// Test initial state
//
const hydrateState = {Demo:{isLess: false}, Counter: {counter: 1}, Comments: {items:[], author:'', text: 'xxxx', idToDelete:'zzz', idToChange:'', authorToChange:'', nextIndex:'', obj:{}}};
     
const store = CausalityRedux.createStore([reduxComments, reduxCounter], hydrateState);

CausalityRedux.addPartitions([causalityChain, reduxDemo]);

describe('CausalityRedux.createStore called.', function(){
  it('store should exist', function(){
    assert(store !== 'undefined' && store !== null);
  });
});

const stateObj = {};
const defaultState = CausalityRedux.defaultState;
Object.keys(defaultState).forEach( key => {
    stateObj[key] = CausalityRedux.merge({}, defaultState[key]);
});

Object.keys(hydrateState).forEach( key => {
    stateObj[key] = CausalityRedux.merge(stateObj[key], hydrateState[key]);
});
const theState = CausalityRedux.reduxStore.getState();
const hydrateStateOK = isEqual(theState, stateObj);


describe('Test that initial state can be set.', function(){
  it('State should hydrated correctly.', function(){
      assert(hydrateStateOK);
  });
});


const shouldFail = (label, func, ...rest) => {
    try {
        func(...rest);
        return `${label  } failed to detect error condition.`;
    } catch(m) {
        return '';
    }
};

function testArgument(...rest) {
    const errorStr =  shouldFail(...rest);
    it(`${rest[0]  } detected`, function(){
        assert(errorStr ==='');
    });
}

function subscriberTest() {
}

describe('Verify argument errors are detected.', function(){
    testArgument( 'onResetAuthorToDefault invalid args, should be 0 and had 1', store[COMMENTS_STATE].onResetAuthorToDefault, '');
    testArgument( 'onToggleIsLess invalid args, should be 0 and had 1', store[DEMO_STATE].onToggleIsLess, false);
    testArgument( 'onAddComment1 missing text argument', store[COMMENTS_STATE].onAddComment, {'author': 'this'} );
    testArgument( 'onAddComment2 author wrong type', store[COMMENTS_STATE].onAddComment, {'author': 0, 'text':'ooo'} );
    testArgument('onAddComment3 invalid "that" argument', store[COMMENTS_STATE].onAddComment, { 'author': 'author', 'text': 'str', 'that': 0 });
    testArgument('onAddComment3 invalid "obj" argument', store[COMMENTS_STATE].onAddComment, { 'author': 'author', 'text': 'str', obj: { 'that': 0 } } );

    testArgument( 'onDeleteComment no args and should be 1', store[COMMENTS_STATE].onDeleteComment);
    testArgument( 'onChangeComment no args and should be 2', store[COMMENTS_STATE].onChangeComment);
    testArgument( 'onChangeComment 1 args and should be 2', store[COMMENTS_STATE].onChangeComment, 0);
    testArgument( 'onChangeComment empty 2nd arg', store[COMMENTS_STATE].onChangeComment, 0, {});
    testArgument( 'onChangeComment 2nd arg author wrong type', store[COMMENTS_STATE].onChangeComment, 0, {'author':0});
    testArgument( 'onChangeComment 2nd arg "this" invalid', store[COMMENTS_STATE].onChangeComment, 0, {'author':'string', 'this':'this'});

    testArgument( 'onAuthorChange 2nd author invalid type', store[COMMENTS_STATE].onAuthorChange, 0);
    testArgument( 'onTextChange missing text argument', store[COMMENTS_STATE].onTextChange);
    testArgument( 'onArrayChange invalid type argument', store[COMMENTS_STATE].onArrayChange, {});
    testArgument('onAddComment3 invalid return', store[COMMENTS_STATE].onAddComment3, {});
    
    testArgument('onObjectMerge invalid must have 1 argument has 0', store[COMMENTS_STATE].onObjectMerge);
    testArgument('onObjectMerge invalid must have 1 argument has 2', store[COMMENTS_STATE].onObjectMerge, {}, {});
    
    testArgument( 'onOutside no subscriber', store[OUTSIDE_EVENT].onOutside, 6);
    
    testArgument( 'subscriber did not provide a listener', store[OUTSIDE_EVENT].subscribe);
    testArgument('subscriber provided invalid key.', store[OUTSIDE_EVENT].subscribe, subscriberTest, ['event1']);

    testArgument('Invalid subscribe no listener.', CausalityRedux.subscribe);
    testArgument('Invalid subscribe no keys.', CausalityRedux.subscribe, subscriberTest);
    testArgument('Invalid subscribe invalid key.', CausalityRedux.subscribe, subscriberTest, ['event1']);
    
    testArgument('Invalid onStoreCreated no listener.', CausalityRedux.onStoreCreated);
});

const commentsState = store[COMMENTS_STATE];
const outsideEvent = store[OUTSIDE_EVENT];
const demoState = store[DEMO_STATE];
const counterState = store[COUNTER_STATE];

let listenersCalled = [];

function resetListeners() {
    listenersCalled = [];
}

function verifyListeners(expectedListeners) {
    expectedListeners.forEach( entry1 => {
        const isIn = listenersCalled.some( entry2 => 
            entry1 === entry2
        );
        if ( !isIn )
            return `The listener ${entry1} was not called and should have been.`;
    });
    
    listenersCalled.forEach( entry1 => {
        const isIn = expectedListeners.some( entry2 => 
            entry1 === entry2
        );
        if ( !isIn )
            return `The listener ${entry1} was not called and should not have been.`;
    });
    resetListeners();
    
    return '';
}

function verifyStateAction( description, actionArg, toCompare, strListener, strToCompareError) {
    const compareOK = isEqual(actionArg, toCompare);
    describe(description, function(){
        it(strToCompareError, function(){
            assert(compareOK);
        });
    }); 

    describe(`Verifying only the listener ${strListener} was called.`, function(){
        const errStr = verifyListeners([strListener]);
        it(`Only the listener ${strListener} was called.`, function(){
            assert(errStr === '');
        });
    });    
} 

function verifyStateAction2( description, actionArg, toCompare, strToCompareError) {
    const compareOK = isEqual(actionArg, toCompare);
    it(strToCompareError, function(){
        assert(compareOK);
    });
}  

//
// Listeners. It will be verified that the apporopriate listener was called based on the state change.
//
let gotItems;
function listenerCommentItems(state) {
    listenersCalled.push('listenerCommentItems');
    gotItems = state.items;
}
const unsubscriber1 = commentsState.subscribe(listenerCommentItems, ['items']); 

let author;
function listenerCommentAuthor(state) {
    listenersCalled.push('listenerCommentAuthor');
    author = state.author;
}
const unsubscriber2 = commentsState.subscribe(listenerCommentAuthor, ['author']); 
 
let text;
function listenerCommentText(state) {
    listenersCalled.push('listenerCommentText');
    text = state.text;
}
const unsubscriber3 = commentsState.subscribe(listenerCommentText, ['text']); 

let idToDelete;
function listenerCommentidToDelete(state) {
    listenersCalled.push('listenerCommentidToDelete');
    idToDelete = state.idToDelete;
}
const unsubscriber4 = commentsState.subscribe(listenerCommentidToDelete, ['idToDelete']); 

let idToChange;
function listenerCommentidToChange(state) {
    listenersCalled.push('listenerCommentidToChange');
    idToChange = state.idToChange;
}
const unsubscriber5 = commentsState.subscribe(listenerCommentidToChange, ['idToChange']); 

let authorToChange;
function listenerCommentauthorToChange(state) {
    listenersCalled.push('listenerCommentauthorToChange');
    authorToChange = state.authorToChange;
}
const unsubscriber6 = commentsState.subscribe(listenerCommentauthorToChange, ['authorToChange']); 

let obj;
function listenerCommentobj(state) {
    listenersCalled.push('listenerCommentobj');
    obj = state.obj;
}
const unsubscriber7 = commentsState.subscribe(listenerCommentobj, ['obj']); 

let isLess;
function listenerIsLess(state) {
    listenersCalled.push('listenerIsLess');
    isLess = state.isLess;
}
const unsubscriber8 = demoState.subscribe(listenerIsLess, ['isLess']); 

let counter;
function listenerCounter(state) {
    listenersCalled.push('listenerCounter');
    counter = state.counter;
}
const unsubscriber9 = counterState.subscribe(listenerCounter, ['counter']); 

let outside_event;
function listenerOutsideEvent(...args) {
    listenersCalled.push('listenerOutsideEvent');
    outside_event = args;
}
const unsubscriber10 = outsideEvent.subscribe(listenerOutsideEvent, ['onOutside'], 'listenerOutsideEvent');  
//
// End Listeners
//


//
// test CausalityRedux.operations.STATE_FUNCTION_CALL 
//
let argument = [4, {event:0}];
outsideEvent.onOutside(argument[0]);
verifyStateAction( 'test CausalityRedux.operations.STATE_FUNCTION_CALL on OUTSIDE_EVENT count', argument, outside_event, 'listenerOutsideEvent', 'outside_event set to correct result');

//
// test setState on author
//
argument = 'author2';
commentsState.setState({ author: argument });
verifyStateAction( 'test setState', argument, author, 'listenerCommentAuthor', 'author set to correct result');

//
// Test the setState and getState proxies.
//
argument = 'author3';
commentsState.partitionState.author = argument;

verifyStateAction( 'test getState/setState proxies', commentsState.partitionState.author, argument, 'listenerCommentAuthor', 'author set to correct result');

//
// test CausalityRedux.operations.STATE_COPY on author
//
argument = 'author1';
commentsState.onAuthorChange(argument);
verifyStateAction( 'test CausalityRedux.operations.STATE_COPY on author', argument, author, 'listenerCommentAuthor', 'author set to correct result');
    

//
// test CausalityRedux.operations.STATE_COPY on text
//
argument = 'text1';
commentsState.onTextChange(argument);
verifyStateAction( 'test CausalityRedux.operations.STATE_COPY on text', argument, text, 'listenerCommentText', 'text set to correct result');

    
//
// test CausalityRedux.operations.STATE_COPY on idToDelete
//
argument = 'id1';
commentsState.onIdChange(argument);
verifyStateAction( 'test CausalityRedux.operations.STATE_COPY on idToDelete', argument, idToDelete, 'listenerCommentidToDelete', 'idToDelete set to correct result');
   
    
//
// test CausalityRedux.operations.STATE_COPY on idToChange
//
argument = 'id1';
commentsState.onIdChangeForChange(argument);
verifyStateAction( 'test CausalityRedux.operations.STATE_COPY on idToChange', argument, idToChange, 'listenerCommentidToChange', 'idToChange set to correct result');

    
//
// test CausalityRedux.operations.STATE_COPY on authorToChange
//
argument = 'authorx';
commentsState.onAuthorChangeForChange(argument);
verifyStateAction( 'test CausalityRedux.operations.STATE_COPY on authorToChange', argument, authorToChange, 'listenerCommentauthorToChange', 'authorToChange set to correct result');

   
//
// test CausalityRedux.operations.STATE_COPY on obj
//
argument = {item: 'authorx1'};
commentsState.onObjectCopy(argument);
verifyStateAction( 'test CausalityRedux.operations.STATE_COPY on obj', argument, obj, 'listenerCommentobj', 'obj set to correct result');

//
// test CausalityRedux.operations.STATE_COPY on obj
//
argument = {item: 'authorx1', anotherArg: 'anotherArg'};
commentsState.onObjectCopy(argument);
verifyStateAction( 'test CausalityRedux.operations.STATE_COPY on obj, 2nd arg new', argument, obj, 'listenerCommentobj', 'obj set to correct result');
 
//
// test CausalityRedux.operations.STATE_COPY on obj
//
argument = {item: 'authorx1', anotherArg: 'anotherArg2'};
commentsState.onObjectCopy(argument);
verifyStateAction( 'test CausalityRedux.operations.STATE_COPY on obj, 2nd arg change', argument, obj, 'listenerCommentobj', 'obj set to correct result');


//
// test CausalityRedux.operations.STATE_OBJECT_MERGE on obj
//
argument = {item: 'authorx1', anotherArg: 'anotherArg2', anotherArg2: 'anotherArg3'};
commentsState.onObjectMerge({anotherArg2: 'anotherArg3'});
verifyStateAction( 'test CausalityRedux.operations.STATE_OBJECT_MERGE on obj, 2nd arg change', argument, obj, 'listenerCommentobj', 'obj set to correct result');

//
// test CausalityRedux.operations.STATE_INCREMENT on COUNTER_STATE counter
//
argument = counterState.getState().counter + 1;
counterState.onIncrement();
verifyStateAction( 'test CausalityRedux.operations.STATE_INCREMENT on COUNTER_STATE ', argument, counter, 'listenerCounter', 'counter set to correct result');


//
// test CausalityRedux.operations.STATE_DECREMENT on COUNTER_STATE counter
//
argument = counterState.getState().counter - 1;
counterState.onDecrement();
verifyStateAction( 'test CausalityRedux.operations.STATE_DECREMENT on COUNTER_STATE ', argument, counter, 'listenerCounter', 'counter set to correct result');

//
// test CausalityRedux.operations.STATE_TOGGLE on DEMO_STATE isLess
//
argument = !demoState.getState().isLess;
demoState.onToggleIsLess();
verifyStateAction( 'test CausalityRedux.operations.STATE_TOGGLE on DEMO_STATE isLess', argument, isLess, 'listenerIsLess', 'isLess set to correct result');


//
// test CausalityRedux.operations.STATE_ARRAY_ADD
//
let expectedItems = [...commentsState.getState().items];
expectedItems.push({'author': 'author', 'text':'text', id:'0'});
argument = {'author': 'author', 'text':'text'};
commentsState.onAddComment(argument);
verifyStateAction( 'test CausalityRedux.operations.STATE_ARRAY_ADD', expectedItems, gotItems, 'listenerCommentItems', 'items array are equal');


  
//
// test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE
//
expectedItems = [...commentsState.getState().items];
expectedItems[0] = {author: 'authorx', text: 'text', id: '0'};
argument = {'author': 'authorx'};
commentsState.onChangeComment('0', argument);

verifyStateAction( 'test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE', expectedItems, gotItems, 'listenerCommentItems', 'items array are equal');  

//
// test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE new merge
//
expectedItems = [...commentsState.getState().items];
argument = {'x': 200};
merge(expectedItems[0], argument);
commentsState.onSetVideoUserDimensions(0, argument);
verifyStateAction( 'test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE new merge', expectedItems, gotItems, 'listenerCommentItems', 'items array are equal'); 

//
// test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE existing merge
//
expectedItems = [...commentsState.getState().items];
argument = {'x': 300};
merge(expectedItems[0], argument);
commentsState.onSetVideoUserDimensions(0, argument);
verifyStateAction( 'test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE existing merge', expectedItems, gotItems, 'listenerCommentItems', 'items array are equal');    

//
// test CausalityRedux.operations.STATE_ARRAY_DELETE
//
expectedItems = [...commentsState.getState().items];
expectedItems.splice(0, 1);
commentsState.onDeleteComment(0);
verifyStateAction( 'test CausalityRedux.operations.STATE_ARRAY_DELETE', expectedItems, gotItems, 'listenerCommentItems', 'items array not are equal');
  
//
// test CausalityRedux.operations.STATE_ARRAY_ADD on custom changer and reducer
//
expectedItems = [...commentsState.getState().items];
expectedItems.push({'author': 'author', 'text':'text', id:'1'});
argument = {'author': 'author', 'text':'text', id:'1'};
commentsState.onAddComment2(argument);
verifyStateAction( 'test CausalityRedux.operations.STATE_ARRAY_ADD on custom changer and reducer', expectedItems, gotItems, 'listenerCommentItems', 'items array are equal');


//
// test CausalityRedux.operations.STATE_COPY on array
//
expectedItems = [{id:0,'author': 'authorx123'}];
commentsState.onArrayChange(expectedItems);
verifyStateAction( 'test CausalityRedux.operations.STATE_COPY', expectedItems, gotItems, 'listenerCommentItems', 'items array are equal');
 

//
// test CausalityRedux.operations.STATE_SETTODEFAULTS
//
argument = '';
commentsState.onResetAuthorToDefault();
verifyStateAction( 'test CausalityRedux.operations.STATE_SETTODEFAULTS on author', argument, author, 'listenerCommentAuthor', 'author set to default');


//
// Test that all unsubscribers work
//

resetListeners();

unsubscriber1();
unsubscriber2();
unsubscriber3();
unsubscriber4();
unsubscriber5();
unsubscriber6();
unsubscriber7();
unsubscriber8();
unsubscriber9();
unsubscriber10();

function subscriberTestPassedString(subscriberName) {
    return `Subscriber ${subscriberName} is not called, passed.`;
}

describe('Testing unsubscribers', function(){
    it(subscriberTestPassedString('listenerCommentAuthor'), function(){
        commentsState.onAuthorChange('author11');
        assert(listenersCalled.length === 0);
    });
    it(subscriberTestPassedString('listenerCommentText'), function(){
        commentsState.onTextChange('test11');
        assert(listenersCalled.length === 0);
    });
    it(subscriberTestPassedString('listenerCommentidToDelete'), function(){
        commentsState.onIdChange('id11');
        assert(listenersCalled.length === 0);
    });
    it(subscriberTestPassedString('listenerCommentidToChange'), function(){
        commentsState.onIdChangeForChange('id12');
        assert(listenersCalled.length === 0);
    });
    it(subscriberTestPassedString('listenerCommentauthorToChange'), function(){
        commentsState.onAuthorChangeForChange('authorx11');
        assert(listenersCalled.length === 0);
    });
    it(subscriberTestPassedString('listenerCommentobj'), function(){
        commentsState.onObjectCopy({item11: 'authorx1'});
        assert(listenersCalled.length === 0);
    });
    it(subscriberTestPassedString('listenerCounter'), function(){
        counterState.onIncrement();
        assert(listenersCalled.length === 0);
    });
    it(subscriberTestPassedString('listenerIsLess'), function(){
        demoState.onToggleIsLess();
        assert(listenersCalled.length === 0);
    });

    it(subscriberTestPassedString('listenerCommentItems'), function () {
        commentsState.onChangeComment(0, {'author': 'authorx1234'});
        assert(listenersCalled.length === 0);
    });
   
});

//
// Plugin test
//

// Use a symbol so there is no clashing with other plugins.
const incrementPluginId = Symbol('incrementPluginId');

let incrementValidateChangerArgumentsCalled = false;
const incrementValidateChangerArguments = (...theirArgs) => {
    incrementValidateChangerArgumentsCalled = true;
    // Verify arguments if there are any
    if (theirArgs.length !== 0)
        throw new Error(`Invalid arguments for pluginId ${incrementPluginId.toString()}.`);
};

const incrementReducer = (state, action) => {
    const newState = CausalityRedux.merge({}, state);
    action.impliedArguments.forEach((entry) => {
        newState[entry] = newState[entry] + 1;
    });
    return newState;
};

let incrementValidatePartitionEntryCalled = false;
const incrementValidatePartitionEntry = partitionEntry => {
    incrementValidatePartitionEntryCalled = true;
    if (typeof partitionEntry.impliedArguments === 'undefined')
        throw new Error(`impliedArguments is missing for pluginId ${incrementPluginId.toString()}.`);
};

const incrementPlugin = {
    pluginId: incrementPluginId,
    validateChangerArguments: incrementValidateChangerArguments,
    reducer: incrementReducer,
    validatePartitionEntry: incrementValidatePartitionEntry
};

CausalityRedux.addPlugins(incrementPlugin);

const COUNTER_STATE_PLUGIN = 'COUNTER_STATE_PLUGIN';
const reduxPluginCounter = {
    partitionName: COUNTER_STATE_PLUGIN,
    defaultState: { counter: 0, counter2: 1 },
    changerDefinitions: {
        'onIncrement': { pluginId: incrementPluginId, impliedArguments: ['counter2'] }
    }
};

CausalityRedux.addPartitions(reduxPluginCounter);
describe('Plugin test', function(){
 
    verifyStateAction2('test plugin incrementValidatePartitionEntry called', incrementValidatePartitionEntryCalled, true, 'incrementValidatePartitionEntry called.');

    let gotPluginCounter;
    let gotPluginCounter2;
    function testPlugin(obj) {
        gotPluginCounter2 = obj.counter2;
        gotPluginCounter = obj.counter;
    }

    CausalityRedux.store[COUNTER_STATE_PLUGIN].subscribe(testPlugin, ['counter', 'counter2'], 'testPlugin');
    const expectedPluginCounter = 0;
    let expectedPluginCounter2 = 2;
    incrementValidateChangerArgumentsCalled = false;
    CausalityRedux.store[COUNTER_STATE_PLUGIN].onIncrement();
    verifyStateAction2( 'test plugin', expectedPluginCounter2, gotPluginCounter2, 'counter2 set correctly.');
    verifyStateAction2( 'test plugin', expectedPluginCounter, gotPluginCounter, 'counter set correctly.');
    verifyStateAction2('test plugin incrementValidateChangerArguments called', incrementValidateChangerArgumentsCalled, true, 'incrementValidateChangerArguments called.');

    incrementValidateChangerArgumentsCalled = false;
    ++expectedPluginCounter2;
    CausalityRedux.store[COUNTER_STATE_PLUGIN].onIncrement();
    verifyStateAction2( 'test plugin2', expectedPluginCounter2, gotPluginCounter2, 'counter2 set correctly.');
    verifyStateAction2( 'test plugin2', expectedPluginCounter, gotPluginCounter, 'counter set correctly.');
    verifyStateAction2('test plugin incrementValidateChangerArguments called', incrementValidateChangerArgumentsCalled, true, 'incrementValidateChangerArguments called.');
});

//
// Test module data segments used for business code state that is not needed for UI.
//

// Define the data and default values
const defaultData = {
    items: [],
    author: '',
    obj: {}
};

// This is not called in production.
let mdSubscriberCalled = false;
const changeListener = dataChangedObject => {
    mdSubscriberCalled = true;
};

let moduleData = CausalityRedux.getModuleData(true, 'MODULE_DATA_MODULE_NAME', defaultData, changeListener);
const moduleState = store['MODULE_DATA_MODULE_NAME'];

describe('Debug module data test', function () {
    moduleData.author = 'author';
    verifyStateAction2('test author', moduleData.author, 'author', 'author set correctly.');
    verifyStateAction2('test author', moduleState.getState().author, 'author', 'author set correctly.');
    verifyStateAction2('moduleData subscriber called', mdSubscriberCalled, true, 'moduleData subscriber was called.');
    mdSubscriberCalled = false;

    const arr = moduleData.items;
    arr.push(1);
    moduleData.items = arr;

    verifyStateAction2('test items', moduleData.items, [1], 'items set correctly.');
    verifyStateAction2('test items', moduleState.getState().items, [1], 'items set correctly.');
    verifyStateAction2('moduleData subscriber called', mdSubscriberCalled, true, 'moduleData subscriber was called.');
    mdSubscriberCalled = false;

    const obj = moduleData.obj;
    obj.a = 1;
    moduleData.obj = obj;

    verifyStateAction2('test obj', moduleData.obj, { a: 1 }, 'obj set correctly.');
    verifyStateAction2('test obj', moduleState.getState().obj, {a:1}, 'obj set correctly.');
    verifyStateAction2('moduleData subscriber called', mdSubscriberCalled, true, 'moduleData subscriber was called.');
});

moduleData = CausalityRedux.getModuleData(false, 'MODULE_DATA_MODULE_NAME2', defaultData, changeListener);
mdSubscriberCalled = false;
    
describe('Production module data test', function () {
    moduleData.author = 'author';
    verifyStateAction2('test author', moduleData.author, 'author', 'author set correctly.');
    verifyStateAction2('moduleData subscriber not called', mdSubscriberCalled, false, 'moduleData subscriber not called.');

    const arr = moduleData.items;
    arr.push(1);
    moduleData.items = arr;

    verifyStateAction2('test items', moduleData.items, [1], 'items set correctly.');
    verifyStateAction2('moduleData subscriber not called', mdSubscriberCalled, false, 'moduleData subscriber not called.');

    const obj = moduleData.obj;
    obj.a = 1;
    moduleData.obj = obj;

    verifyStateAction2('test obj', moduleData.obj, { a: 1 }, 'obj set correctly.');
    verifyStateAction2('moduleData subscriber not called', mdSubscriberCalled, false, 'moduleData subscriber not called.');
});


