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

## Causality-redux/React project creator.
Causality-redux is an extension to redux that significantly reduces redux and react-redux coding and debugging. See this 
[react project creator](https://github.com/AndrewBanks10/create-react-project) for the simplest way to use causality-redux with react.

## Documentation

You can find documentation at <https://cazec.com/causalityredux/causalityredux.html>

## Demo with source code.
[General set of demos](https://github.com/AndrewBanks10/react-causality-redux-vscode-template)

## NPM links

[npm causality-redux](https://www.npmjs.com/package/causality-redux)

[npm causality-redux react extension](https://www.npmjs.com/package/react-causality-redux)

[npm react-causality-redux-router](https://www.npmjs.com/package/react-causality-redux-router)

## Github links

[Github causality-redux](https://github.com/AndrewBanks10/causality-redux)

[Github causality-redux react extension](https://github.com/AndrewBanks10/react-causality-redux)

[Github react-causality-redux-router](https://github.com/AndrewBanks10/react-causality-redux-router)

[Github React project creator](https://github.com/AndrewBanks10/create-react-project)

