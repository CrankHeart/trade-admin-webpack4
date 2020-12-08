
import { Component } from 'vue-property-decorator'

Component.registerHooks( [
  'created',
  'beforeRouteEnter',
  'beforeRouteLeave'
] )