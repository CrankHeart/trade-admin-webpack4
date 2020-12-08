import Vue from 'vue'
import DataSets from './dataSet'

const DS = new DataSets()

Vue.prototype.$dataSet = function ( config ) {
  return DS.getDs( config )
}
Vue.prototype.$deleteDataSet = function ( key ) {
  return DS.delete( key )
}
