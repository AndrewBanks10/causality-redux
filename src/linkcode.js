import CausalityRedux from './causality-redux.js'

if (typeof window !== 'undefined') {
  window['CausalityRedux'] = CausalityRedux
} else if (typeof global !== 'undefined') {
  global['CausalityRedux'] = CausalityRedux
}
