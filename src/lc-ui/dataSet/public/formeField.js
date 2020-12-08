import Vue from 'vue'
import formeDate from './formeDate'
export default function formeField( field, obj ) {
  if ( field.type === 'date' || field.editor === 'date' ) {
    let val = obj[ field.key ]
    if ( val && val instanceof Object ) {
      let _val = formeDate( val && val.time )
      Vue.set( obj, field.key, _val )
    } else if ( !isNaN( val ) ) {
      let _val = formeDate( val )
      Vue.set( obj, field.key, _val )
    }
  }
  if ( obj[ field.key ] !== undefined && obj[ field.key ] !== null ) {
    return
  }
  if ( field.editor === 'checkBox' || field.editor === 'cascader' || ( field.editor === 'select' && field.multiple ) ) {
    Vue.set( obj, field.key, [] )
  } else if ( field.editor === 'slider' ) {
    Vue.set( obj, field.key, 0 )
  } else {
    Vue.set( obj, field.key, '' )
  }
}
