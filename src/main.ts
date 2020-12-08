// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import router from './router'

import elementUI, { Notification } from 'element-ui'
Vue.use( elementUI )

if ( process.env.NODE_ENV !== 'production' ) {
  Vue.config.devtools = true
}

import 'element-ui/lib/theme-default/index.css'
import 'normalize.css'
import './assets/index.stylus'

// import './hook'
import store from './vuex/index'
/* eslint-disable no-new */

import { formatMyDate } from './utils/index'

import { Component, Provide } from 'vue-property-decorator'

import LcUi from './lc-ui'
Vue.use( LcUi )

import './libs/'
import './directives/'
import './filters'
@Component<ETRADE>( {
  name: 'etrade-manage',
  router,
  store,
  render: h => h( App )
} )
class ETRADE extends Vue {
  @Provide() formatMyDate = formatMyDate
}
const vm = new ETRADE()

vm.$mount( '#app' )


import nprogress from 'nprogress'
import 'nprogress/nprogress.css'

router.beforeEach( ( to, from, next ) => {
  nprogress.start()
  next()
} )

router.afterEach( route => {
  nprogress.done()
} )

