var assert = require('assert');
var isEqual = require('lodash/isEqual');
var merge = require('lodash/merge');
var Redux = require('redux');

var CausalityRedux = require('../lib/causality-redux.js');

describe('CausalityRedux definition', function(){
  it('CausalityRedux should exist', function(){
    assert(typeof CausalityRedux !== 'undefined' );
  });
  it('CausalityRedux.createStore should exist', function(){
    assert(typeof CausalityRedux.createStore !== 'undefined' );
  });
});


const COMMENTS_STATE = "Comments";

const onAddComment2 = (comment={author: "", text:''}) => {
    return( 
        {
            type: 'onAddComment2',
            comment
        }
    );
};
const onAddComment2Reducer = (state, action) =>
    merge({}, state, {items: [...state.items, action.comment]});

// Comment state entry
const reduxComments = {
    partitionName: COMMENTS_STATE,
    // No type checking of obj
    defaultState: {items:[], author:'', text: '', idToDelete:"", idToChange:"", authorToChange:"", nextIndex:"", obj:{}},
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
                    onAddComment2
                },
    reducers:   {
                    onAddComment2Reducer
                }           
};

const DEMO_STATE = "Demo";
const reduxDemo = {
    partitionName: DEMO_STATE,
    defaultState: {isLess: true},
    changerDefinitions:{
        'onToggleIsLess': { operation: CausalityRedux.operations.STATE_TOGGLE, impliedArguments: ['isLess'] }  
    }
};
    
const COUNTER_STATE = "Counter";
const reduxCounter = {
    partitionName: COUNTER_STATE,
    defaultState: {counter: 0},
    changerDefinitions:{
        'onIncrement': { operation: CausalityRedux.operations.STATE_INCREMENT, impliedArguments: ['counter'] },
        'onDecrement': { operation: CausalityRedux.operations.STATE_DECREMENT, impliedArguments: ['counter'] }
    }
};

const OUTSIDE_EVENT = "OUTSIDE_EVENT";
const causalityChain = {
    partitionName: OUTSIDE_EVENT,
    defaultState: {event:0},
    changerDefinitions: {
        'onOutside':    {operation: CausalityRedux.operations.STATE_FUNCTION_CALL, impliedArguments: ['event'] }
    }
};

// If simpleReduxState is in scope, CausalityRedux will be automatically setup using it
const simpleReduxStateDefinition = [
    reduxComments,
    reduxCounter,
    causalityChain,
    reduxDemo
];



//
// Test initial state
//
let hydrateState = {Demo:{isLess: false}, Counter: {counter: 1}, Comments: {items:[], author:'', text: 'xxxx', idToDelete:"zzz", idToChange:"", authorToChange:"", nextIndex:"", obj:{}}};
     
const store = CausalityRedux.createStore(simpleReduxStateDefinition, hydrateState);

describe('CausalityRedux.createStore called.', function(){
  it('store should exist', function(){
    assert(store !== 'undefined' && store !== null);
  });
});

let stateObj = {};
let defaultState = CausalityRedux.defaultState;
let defaultStateKeys = Object.keys(defaultState);
    defaultStateKeys.forEach( key => {
        stateObj[key] = CausalityRedux.merge({}, defaultState[key], hydrateState[key]);
});

let theState = CausalityRedux.reduxStore.getState();
let hydrateStateOK = isEqual(theState, stateObj);


describe('Test that initial state can be set.', function(){
  it('State should hydrated correctly.', function(){
      assert(hydrateStateOK);
  });
});


let shouldFail = (label, func, ...rest) => {
    try {
        func.apply(null, rest);
        return label + ' failed to detect error condition.';
    } catch(m) {
        return '';
    }
};

function testArgument(...rest) {
    var errorStr =  shouldFail.apply( null, rest );
    it(rest[0] + ' detected', function(){
        assert(errorStr ==='');
    });
}

function subscriberTest() {
}

describe('Verify argument errors are detected.', function(){
    testArgument( 'onResetAuthorToDefault invalid args, should be 0 and had 1', store[COMMENTS_STATE].onResetAuthorToDefault, "");
    testArgument( 'onToggleIsLess invalid args, should be 0 and had 1', store[DEMO_STATE].onToggleIsLess, false);
    testArgument( 'onAddComment1 missing text argument', store[COMMENTS_STATE].onAddComment, {'author': 'this'} );
    testArgument( 'onAddComment2 author wrong type', store[COMMENTS_STATE].onAddComment, {'author': 0, 'text':'ooo'} );
    testArgument( 'onAddComment3 invalid "that" argument', store[COMMENTS_STATE].onAddComment, {'author': 'author', 'text':'str', 'that':0} );

    testArgument( 'onDeleteComment no args and should be 1', store[COMMENTS_STATE].onDeleteComment);
    testArgument( 'onChangeComment no args and should be 2', store[COMMENTS_STATE].onChangeComment);
    testArgument( 'onChangeComment 1 args and should be 2', store[COMMENTS_STATE].onChangeComment, 0);
    testArgument( 'onChangeComment empty 2nd arg', store[COMMENTS_STATE].onChangeComment, 0, {});
    testArgument( 'onChangeComment 2nd arg author wrong type', store[COMMENTS_STATE].onChangeComment, 0, {'author':0});
    testArgument( 'onChangeComment 2nd arg "this" invalid', store[COMMENTS_STATE].onChangeComment, 0, {'author':'string', 'this':'this'});

    testArgument( 'onAuthorChange 2nd author invalid type', store[COMMENTS_STATE].onAuthorChange, 0);
    testArgument( 'onTextChange missing text argument', store[COMMENTS_STATE].onTextChange);
    testArgument( 'onArrayChange invalid type argument', store[COMMENTS_STATE].onArrayChange, {});
    
    testArgument( 'onOutside no subscriber', store[OUTSIDE_EVENT].onOutside, 6);
    
    testArgument( 'subscriber did not provide a listener', store[OUTSIDE_EVENT].subscribe);
    testArgument( 'subscriber did not provide an array of keys for listening.', store[OUTSIDE_EVENT].subscribe, subscriberTest);
});

let commentsState = store[COMMENTS_STATE];
let outsideEvent = store[OUTSIDE_EVENT];
let demoState = store[DEMO_STATE];
let counterState = store[COUNTER_STATE];

var listenersCalled = [];

function resetListeners() {
    listenersCalled = [];
}

function verifyListeners(expectedListeners) {
    var str = "";
    expectedListeners.forEach( entry1 => {
        var isIn = listenersCalled.some( entry2 => 
            entry1 === entry2
        );
        if ( !isIn )
            return `The listener ${entry1} was not called and should have been.`;
    });
    
    listenersCalled.forEach( entry1 => {
        var isIn = expectedListeners.some( entry2 => 
            entry1 === entry2
        );
        if ( !isIn )
            return `The listener ${entry1} was not called and should not have been.`;
    });
    resetListeners();
    
    return '';
}

function verifyStateAction( description, actionArg, toCompare, strListener, strToCompareError) {
    let compareOK = isEqual(actionArg, toCompare);
    describe(description, function(){
        it(strToCompareError, function(){
            assert(compareOK);
        });
    }); 

    describe(`Verifying only the listener ${strListener} was called.`, function(){
        let errStr = verifyListeners([strListener]);
        it(`Only the listener ${strListener} was called.`, function(){
            assert(errStr === '');
        });
    });    
}  

//
// Listeners. It will be verified that the apporopriate listener was called based on the state change.
//
var gotItems;
function listenerCommentItems(state) {
    listenersCalled.push('listenerCommentItems');
    gotItems = state.items;
}
var unsubscriber1 = commentsState.subscribe(listenerCommentItems, ['items']); 

var author;
function listenerCommentAuthor(state) {
    listenersCalled.push('listenerCommentAuthor');
    author = state.author;
}
var unsubscriber2 = commentsState.subscribe(listenerCommentAuthor, ['author']); 
 
var text;
function listenerCommentText(state) {
    listenersCalled.push('listenerCommentText');
    text = state.text;
}
var unsubscriber3 = commentsState.subscribe(listenerCommentText, ['text']); 

var idToDelete;
function listenerCommentidToDelete(state) {
    listenersCalled.push('listenerCommentidToDelete');
    idToDelete = state.idToDelete;
}
var unsubscriber4 = commentsState.subscribe(listenerCommentidToDelete, ['idToDelete']); 

var idToChange;
function listenerCommentidToChange(state) {
    listenersCalled.push('listenerCommentidToChange');
    idToChange = state.idToChange;
}
var unsubscriber5 = commentsState.subscribe(listenerCommentidToChange, ['idToChange']); 

var authorToChange;
function listenerCommentauthorToChange(state) {
    listenersCalled.push('listenerCommentauthorToChange');
    authorToChange = state.authorToChange;
}
var unsubscriber6 = commentsState.subscribe(listenerCommentauthorToChange, ['authorToChange']); 

var obj;
function listenerCommentobj(state) {
    listenersCalled.push('listenerCommentobj');
    obj = state.obj;
}
var unsubscriber7 = commentsState.subscribe(listenerCommentobj, ['obj']); 

var isLess;
function listenerIsLess(state) {
    listenersCalled.push('listenerIsLess');
    isLess = state.isLess;
}
var unsubscriber8 = demoState.subscribe(listenerIsLess, ['isLess']); 

var counter;
function listenerCounter(state) {
    listenersCalled.push('listenerCounter');
    counter = state.counter;
}
var unsubscriber9 = counterState.subscribe(listenerCounter, ['counter']); 

var outside_event;
function listenerOutsideEvent(...args) {
    listenersCalled.push('listenerOutsideEvent');
    outside_event = args;
}
var unsubscriber10 = outsideEvent.subscribe(listenerOutsideEvent, ['onOutside'], 'listenerOutsideEvent');  
//
// End Listeners
//


//
// test CausalityRedux.operations.STATE_FUNCTION_CALL 
//
var argument = [4, {event:0}];
outsideEvent.onOutside(argument[0]);
verifyStateAction( "test CausalityRedux.operations.STATE_FUNCTION_CALL on OUTSIDE_EVENT count", argument, outside_event, 'listenerOutsideEvent', 'outside_event not set to correct result');


//
// test CausalityRedux.operations.STATE_COPY on author
//
argument = 'author1';
commentsState.onAuthorChange(argument);
verifyStateAction( "test CausalityRedux.operations.STATE_COPY on author", argument, author, 'listenerCommentAuthor', 'author not set to correct result');
    

//
// test CausalityRedux.operations.STATE_COPY on text
//
argument = 'text1';
commentsState.onTextChange(argument);
verifyStateAction( "test CausalityRedux.operations.STATE_COPY on text", argument, text, 'listenerCommentText', 'text not set to correct result');

    
//
// test CausalityRedux.operations.STATE_COPY on idToDelete
//
argument = 'id1';
commentsState.onIdChange(argument);
verifyStateAction( "test CausalityRedux.operations.STATE_COPY on idToDelete", argument, idToDelete, 'listenerCommentidToDelete', 'idToDelete not set to correct result');
   
    
//
// test CausalityRedux.operations.STATE_COPY on idToChange
//
argument = 'id1';
commentsState.onIdChangeForChange(argument);
verifyStateAction( "test CausalityRedux.operations.STATE_COPY on idToChange", argument, idToChange, 'listenerCommentidToChange', 'idToChange not set to correct result');

    
//
// test CausalityRedux.operations.STATE_COPY on authorToChange
//
argument = 'authorx';
commentsState.onAuthorChangeForChange(argument);
verifyStateAction( "test CausalityRedux.operations.STATE_COPY on authorToChange", argument, authorToChange, 'listenerCommentauthorToChange', 'authorToChange not set to correct result');

   
//
// test CausalityRedux.operations.STATE_COPY on obj
//
argument = {item: 'authorx1'};
commentsState.onObjectCopy(argument);
verifyStateAction( "test CausalityRedux.operations.STATE_COPY on obj", argument, obj, 'listenerCommentobj', 'obj not set to correct result');

//
// test CausalityRedux.operations.STATE_COPY on obj
//
argument = {item: 'authorx1', anotherArg: 'anotherArg'};
commentsState.onObjectCopy(argument);
verifyStateAction( "test CausalityRedux.operations.STATE_COPY on obj, 2nd arg new", argument, obj, 'listenerCommentobj', 'obj not set to correct result');
 
//
// test CausalityRedux.operations.STATE_COPY on obj
//
argument = {item: 'authorx1', anotherArg: 'anotherArg2'};
commentsState.onObjectCopy(argument);
verifyStateAction( "test CausalityRedux.operations.STATE_COPY on obj, 2nd arg change", argument, obj, 'listenerCommentobj', 'obj not set to correct result');


//
// test CausalityRedux.operations.STATE_OBJECT_MERGE on obj
//
argument = {item: 'authorx1', anotherArg: 'anotherArg2', anotherArg2: 'anotherArg3'};
commentsState.onObjectMerge({anotherArg2: 'anotherArg3'});
verifyStateAction( "test CausalityRedux.operations.STATE_OBJECT_MERGE on obj, 2nd arg change", argument, obj, 'listenerCommentobj', 'obj not equal and should be');

//
// test CausalityRedux.operations.STATE_INCREMENT on COUNTER_STATE counter
//
argument = counterState.getState().counter + 1;
counterState.onIncrement();
verifyStateAction( "test CausalityRedux.operations.STATE_INCREMENT on COUNTER_STATE ", argument, counter, 'listenerCounter', 'counter not set to correct result');


//
// test CausalityRedux.operations.STATE_DECREMENT on COUNTER_STATE counter
//
argument = counterState.getState().counter - 1;
counterState.onDecrement();
verifyStateAction( "test CausalityRedux.operations.STATE_DECREMENT on COUNTER_STATE ", argument, counter, 'listenerCounter', 'counter not set to correct result');

//
// test CausalityRedux.operations.STATE_TOGGLE on DEMO_STATE isLess
//
argument = !demoState.getState().isLess;
demoState.onToggleIsLess();
verifyStateAction( "test CausalityRedux.operations.STATE_TOGGLE on DEMO_STATE isLess", argument, isLess, 'listenerIsLess', 'isLess set not to correct result');


//
// test CausalityRedux.operations.STATE_ARRAY_ADD
//
let expectedItems = [...commentsState.getState().items];
expectedItems.push({'author': 'author', 'text':'text', id:"0"});
argument = {'author': 'author', 'text':'text'};
commentsState.onAddComment(argument);
verifyStateAction( "test CausalityRedux.operations.STATE_ARRAY_ADD", expectedItems, gotItems, 'listenerCommentItems', 'items array are not equal');


  
//
// test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE
//
expectedItems = [...commentsState.getState().items];
expectedItems[0] = {author: 'authorx', text: 'text', id: '0'};
argument = {'author': 'authorx'};
commentsState.onChangeComment('0', argument);
verifyStateAction( "test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE", expectedItems, gotItems, 'listenerCommentItems', 'items array are not equal');  

//
// test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE new merge
//
expectedItems = [...commentsState.getState().items];
argument = {'x': 200};
merge(expectedItems[0], argument);
commentsState.onSetVideoUserDimensions(0, argument);
verifyStateAction( "test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE new merge", expectedItems, gotItems, 'listenerCommentItems', 'items array are not equal'); 

//
// test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE existing merge
//
expectedItems = [...commentsState.getState().items];
argument = {'x': 300};
merge(expectedItems[0], argument);
commentsState.onSetVideoUserDimensions(0, argument);
verifyStateAction( "test CausalityRedux.operations.STATE_ARRAY_ENTRY_MERGE existing merge", expectedItems, gotItems, 'listenerCommentItems', 'items array are not equal');    

//
// test CausalityRedux.operations.STATE_ARRAY_DELETE
//
expectedItems = [...commentsState.getState().items];
expectedItems.splice(0, 1);
commentsState.onDeleteComment(0);
verifyStateAction( "test CausalityRedux.operations.STATE_ARRAY_DELETE", expectedItems, gotItems, 'listenerCommentItems', 'items array not are not equal');
  
//
// test CausalityRedux.operations.STATE_ARRAY_ADD on custom changer and reducer
//
expectedItems = [...commentsState.getState().items];
expectedItems.push({'author': 'author', 'text':'text', id:"1"});
argument = {'author': 'author', 'text':'text', id:"1"};
commentsState.onAddComment2(argument);
verifyStateAction( "test CausalityRedux.operations.STATE_ARRAY_ADD on custom changer and reducer", expectedItems, gotItems, 'listenerCommentItems', 'items array are not equal');


//
// test CausalityRedux.operations.STATE_COPY on array
//
expectedItems = [0];
commentsState.onArrayChange(expectedItems);
verifyStateAction( "test CausalityRedux.operations.STATE_COPY", expectedItems, gotItems, 'listenerCommentItems', 'items array are not equal');
 

//
// test CausalityRedux.operations.STATE_SETTODEFAULTS
//
argument = '';
commentsState.onResetAuthorToDefault();
verifyStateAction( "test CausalityRedux.operations.STATE_SETTODEFAULTS on author", argument, author, 'listenerCommentAuthor', 'author not set to default');


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

describe('Testiing unsubscribers', function(){
    it(subscriberTestPassedString('listenerCommentAuthor'), function(){
        commentsState.onAuthorChange("author11");
        assert(listenersCalled.length === 0);
    });
    it(subscriberTestPassedString('listenerCommentText'), function(){
        commentsState.onTextChange("test11");
        assert(listenersCalled.length === 0);
    });
    it(subscriberTestPassedString('listenerCommentidToDelete'), function(){
        commentsState.onIdChange("id11");
        assert(listenersCalled.length === 0);
    });
    it(subscriberTestPassedString('listenerCommentidToChange'), function(){
        commentsState.onIdChangeForChange("id12");
        assert(listenersCalled.length === 0);
    });
    it(subscriberTestPassedString('listenerCommentauthorToChange'), function(){
        commentsState.onAuthorChangeForChange("authorx11");
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
    it(subscriberTestPassedString('listenerCommentItems'), function(){
        commentsState.onChangeComment(0, {'author': 'authorx123'});
        assert(listenersCalled.length === 0);
    });
    
});






