### Installation
`npm install --save causality-redux`
### Basics
Causality-redux is founded on redux partitions whereas redux with reducers is founded on slices. So, partitions and slices are essentailly the same thing. Each partition is given a key name and that name is how you get to the partition store functions. The following functions are provided in the partition store. They can be accessed using the below.
```javascript
const { getState, setState, partitionState, subscribe } = CausalityRedux.store[partitionName]
```
1. getState() - Gets the current partition state.
2. setState(obj) - Merges obj with the current partition state.
3. partitionState - Proxy used to access and change particular keys in the partition state. See below.
```javascript
partitionState.counter++
```
4. subscribe(listener(obj), [key1, key2, ...]) - The listener is called if and only if any of the keys in the second argument array are changed. Those changed keys/value pairs are passed in as an object to the listener.

Note: with the above primitives, you do not have to write changers and reducers which significantly reduces code complexity.

Also, causality-redux is an extension to redux so you still have access to all the redux primitives with CausalityRedux.store. So, the below gets the entire redux state object for example.
```javascript
const state = CausalityRedux.store.getState()
```
### Integration with existing redux code.
CausalityRedux is capatible with redux in the same project and only requires a few lines of code. This way you can upgrade to CausalityRedux and still leave your existing working redux code base in place.
```javascript
// Create the redux store as normal. These two steps below must be done before any causality-redux react components are imported.
const rStore = createStore(combineReducers(yourCoreReducersObject), hydrateState);
// Call CausalityRedux.setReduxStore as below.
CausalityRedux.setReduxStore(rStore, yourCoreReducersObject);
```
If your hydrateState contains CausalityRedux state then do the below instead.
```javascript
// Create the redux store.
const rStore = createStore(CausalityRedux.combineReducers(yourCoreReducersObject), hydrateState);
// Call CausalityRedux.setReduxStore as below.
CausalityRedux.setReduxStore(rStore, yourCoreReducersObject, hydrateState);
```
If you use redux code splitting or some type of lazy load module based logic for reducers then perform the step below with your additional reducers that are to be added. This will add the additional reducers to the existing redux reducers. Note that this is the reducer object itself and not the combineReducers output.
```javascript
CausalityRedux.addReducers(additionalReducersObject) 
```

### How can you hot reload your business code for easy debugging and also keep it completely separate from the UI code so that future UI platform changes are easy to adjust to? Use causality-redux.

Causality-redux is an extension to redux that significantly reduces redux and react-redux coding and debugging.

To show how easy causality-redux is to use, consider the counter example below.

```
import React from 'react';
import CausalityRedux from 'causality-redux';

// First define the store partition as below.
const COUNTER_STATE = 'COUNTER_STATE';
const reduxCounter = {
    partitionName: COUNTER_STATE,
    defaultState: { counter: 0 } // This is the state object for the COUNTER_STATE partition.
}
CausalityRedux.createStore([reduxCounter]); // Create the causality-redux store and use the store partition above for definitions.
const counterState = CausalityRedux.store[COUNTER_STATE].partitionState;

// To connect this to a react component, here is an example.
const CounterForm = ({counter}) => 
    <div>
        <div>{`The current counter is ${counter}.`}</div>
        <button onClick={() => counterState.counter++}>Up</button> // Causes a detectable state change to counter in the redux store.
        <button onClick={() => counterState.counter--}>Down</button> // Causes a detectable state change to counter in the redux store.
    </div>
// Now wrap the component CounterForm
const CounterFormCausalityRedux = CausalityRedux.connectStateToProps(
    CounterForm, // React component to wrap.
    COUNTER_STATE, // State partition
    ['counter'] // This is an array of values in COUNTER_STATE that you want passed into the props. Whenever counter 
                // changes in the redux store, this component will render with the new value of counter set in the props.
);

const App = () =>
    <Provider store={ CausalityRedux.store}>
        <CounterFormCausalityRedux/>
    </Provider>
```

That is all there is to it.
Note that there are no changers, reducers, dispatching, redux connects or mapStateToProps/mapDispatchToProps definitions.
The buttons are clicked, the counter value is changed in the redux store then CounterForm is rendered with the new value
of counter set in the props. So, the new value is shown to the user.

(Please note, there is a bug in node 6.11 that causes errors when debugging. Please upgrade to a later version.)

## Benefits of causality-redux
- You can define multiple partitions within the redux store. This way, one partition can be associated exclusively with a causality chain of a UI component and its business logic. This also allows you to have shared partitions that can be used to change the state of such things as a UI busy loader than can be shared by different causality chains.
- By assigning a partition to a specific UI component and its business logic, you can track changes just on that state partition for easier debugging of a new component and its business logic.
- To implement causality, causality-redux exposes two main concepts, changers which initiate a cause and subscribers that subscribe as an effect to the cause. The programming steps taken by the subscriber as a result of the cause is the effect.
- Specific keys within a partition can be targeted by a subscriber of state changes. So, the subscriber is not called unless one of the targets is changed.
- The subscriber is called with the targeted keys/values that changed as an argument so that it does not need to call getState to figure out if the state changes apply to the subscriber.
- In most cases changers/dispatchers do not need to be defined or coded. They are automatically generated by causality-redux.
- In most cases reducers do not need to be defined or coded. They are automatically generated by causality-redux.           
- Type checking of arguments is performed for most changers in order to catch coding errors early.
- Connecting changers and partition values to react components takes only one line of code. mapStateToProps and mapDispatchToProps definitions are no longer needed.
- React PropType definitions are not needed unless they represent component configurations because causality-redux does all of the type checking of arguments and automatically validates functions that are set to props in react components.
- Business logic functions do not need to be passed down the react UI tree as props. A react component simply binds to a changer string name that causes a state change in which business logic subscribes to the change and implements the causality chain. So a react component can be a fully functional business logic/UI unit without any dependencies on the containing react UI tree.
- UI components do not need to import business logic functions or reference them since the components bind to changer string names instead of business functions. So, neither the business logic nor the UI components need to import anything about the other.
- Allows hot re-loading of business code for easier debugging.
- Provides middleware between business code and UI such as react or another other UI implementation. UI implementations come and go and with causality-redux you do not have to tear out your business code from the UI. There is a clean separation between the two with no importing needed from each other. So, if the UI implementation changes in the future, you only need to worry about the UI.
- Causality-redux supports three types of plugins:
  - Complete self contained react web component plugins that can be simply inserted into the UI. 
  - Business logic plugins that are easily connected to UI components with one line of code.
  - Reducer plugins to supplement built-in causality-redux reducers.
- Causality-redux is very small only 4K gzipped.

If you are using react, see [Github react-causality-redux](https://github.com/AndrewBanks10/react-causality-redux) for the react extension to causality-redux.

## Documentation

You can find documentation at <https://cazec.com/causalityredux/causalityredux.html>

## Demos with source code.
- [General Demo](https://cazec.com/causalityredux/causalityreduxdemo.html) - Demonstates general features of react-causality-redux.
- [Todo Demo](https://cazec.com/causalityredux/todo.htm) - React demo that provides the same functionality as 100 redux lines of code in just 8 lines. 
- [Counter Demo](https://cazec.com/causalityredux/countertest.html) - Show a counter example and also how to access external business logic without any import of the business functions or injecting react props from the top down.

## NPM links

[npm causality-redux](https://www.npmjs.com/package/causality-redux)

[npm causality-redux react extension](https://www.npmjs.com/package/react-causality-redux)

## Github links

[Github causality-redux](https://github.com/AndrewBanks10/causality-redux)

[Github causality-redux react extension](https://github.com/AndrewBanks10/react-causality-redux)

### VS Code template for developing with es6, jsx react and causality-redux.
The template supports the following features.
* es6 and jsx.
* Total separation of react UI components from program state and business code.
* Major extensions and simplifications to redux.
* Can use the assignment operator on causality-redux store values to automatically update the react UI. No changers, reducers, etc are needed.
* Vscode debugging and hot re-loading on a file save within react code or the business code. 
* Css modules.
* Sass, scss and less. 
* Sass, scss, less and css injections into your react components.
* Legacy css code.
* Postcss-loader so you do not have to use vendor prefixes in your css code.
* Url-loader for assets such as images, fonts etc that can be imported into your react components.
* Mocha react/enzyme testing.
* Mocha test vscode debugging that uses webpack to automatically compile changes made to the test code. 
* Dll libraries for fast compiling while debugging and/or for production.
* Minimized production build for both css and js.
* Many code samples that demonstrate the use of causality-redux with react.

[Github causality-redux react vscode hot loading and debug template](https://github.com/AndrewBanks10/react-causality-redux-vscode-template)

