import Record from '../record'
import formeField from './formeField'

function def( obj, key, val, enumerable ) {
  Object.defineProperty( obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  } )
}

function getRecords( ds, values ) {
  let records = []
  values.forEach( record => {
    ds.config.record.fields.forEach( field => {
      formeField( field, record )
    } )
    let _record = new Record( ds, record, ds.config.record, false )
    records.push( _record )
  } )
  return records
}

const arrayProto = Array.prototype
const arrayMethods = Object.create( arrayProto )

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

export default function ( ds ) {
  methodsToPatch.forEach( function ( method ) {
    const original = arrayProto[ method ]
    def( arrayMethods, method, function mutator( ...args ) {
      const result = original.apply( this, args )
      if ( !ds.config.record ) {
        return result
      }
      let records
      switch ( method ) {
        case 'push':
        case 'unshift':
          records = getRecords( ds, args )
          ds.records[ method ]( ...records )
          ds._addLength += records.length
          break
        case 'pop':
        case 'shift':
        case 'reverse':
          ds.records[ method ]()
          ds._addLength--
          break
        case 'splice':
          let arg = args.slice( 0, 2 )
          let inserted = args.slice( 2 )
          records = getRecords( ds, inserted )
          ds.records.splice( ...arg, ...records )
          ds._addLength -= arg[ 1 ]
          break
      }
      return result
    } )
  } )
  return arrayMethods
}
