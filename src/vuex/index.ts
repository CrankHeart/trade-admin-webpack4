import Vue from 'vue'
import Vuex from 'vuex'

Vue.use( Vuex )

import { getClientHeight, requireAll } from '../utils/index'

const modules = requireAll( ( <any> require ).context( './modules', true, /\.ts$/ ), function () {
  return this.default
} )

const store = new Vuex.Store( {
  state: {
    clientHeight: getClientHeight(),
    mainMarginLeft: '180px',
    clientType: null
  },
  mutations: {
    fitClient ( state ) {
      window.addEventListener( 'resize', () => {
        state.clientHeight = getClientHeight()
      } )
    },
    setMainMarginLeft ( state, px ) {
      state.mainMarginLeft = px
    },
    setClientType ( state, clientType ) {
      state.clientType = clientType
    }
  },
  modules
} )

export default store