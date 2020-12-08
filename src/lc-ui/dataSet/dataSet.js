import Record from './record'
import Field from './field'
import formeField from './public/formeField'
import arrayProto from './public/arrayPrototype'
import Vue from 'vue'
import {
  http
} from '../../utils/index.ts'
import {
  Notification
} from 'element-ui'

class DataSets {
  constructor() {
    this.dataset = {}
  }
  getDs( config ) {
    if ( typeof ( config ) === 'string' ) {
      return this.dataset[ config ]
    }
    if ( config.id && this.dataset[ config.id ] ) {
      return this.dataset[ config.id ]
    }
    let ds = new DataSet( config )
    if ( config.id ) {
      this.dataset[ config.id ] = ds
    }
    return ds
  }
  delete( key ) {
    if ( this.dataset[ key ] ) {
      delete this.dataset[ key ]
    }
  }
}

class DataSet {
  constructor( config ) {
    this.config = config
    this.queryUrl = config.queryUrl
    this.queryType = config.queryType || 'post'
    this.saveUrl = config.saveUrl
    this.visibleCtr = config.visibleCtr
    this.records = []
    this.fieldConfig = config.fields || []
    this.fields = []
    if ( config.fields ) {
      this.isArray = false
      this._value = {}
    } else {
      this.isArray = true
      this._value = []
    }
    this.id = this.config.id
    this.dirtyStack = new Set()
    this._funStack = {}
    this.title = config.title
    this.hasQuery = false
    this.params = config.params || {}
    this.selected = undefined
    this.autoCreate = false
    this.queryFilter = config.queryFilter
    this.saveTip = config.saveTip === false ? false : true
    this.queryTip = config.queryTip
    if ( config.page ) {
      let page = config.page
      this.currentPage = 1
      if ( page instanceof Boolean ) {
        this.size = 10
        this.sizes = [ 10, 20, 30, 50, 100, 200 ]
      } else {
        this.sizes = page.sizes || [ 10, 20, 30, 50, 100, 200 ]
        this.size = page.size || this.sizes[ 0 ]
      }
    }
    if ( config.data ) {
      this._value = config.data
    }
    // 额外增加的数据长度
    this._addLength = 0
  }
  get value() {
    return this._value
  }
  set value( val ) {
    this._value = val
    if ( this.isArray ) {
      // field无record配置，无需生成record对象
      if ( !this.config.record ) {
        return
      }
      let records = []
      val.forEach( record => {
        this.config.record.fields.forEach( field => {
          formeField( field, record )
        } )
        let _record = new Record( this, record, this.config.record, this.autoCreate )
        records.push( _record )
      } )
      this.records = records
      this._value.__proto__ = arrayProto( this )
    } else {
      this.fields = []
      this.fieldConfig.forEach( field => {
        formeField( field, this._value )
        let _field = new Field( this, field )
        this.fields.push( _field )
      } )
    }
  }
  get total() {
    return this._total !== undefined ? ( this._total + this._addLength ) : this.records.length
  }
  getField( key ) {
    return this.fields.find( field => field.key === key )
  }
  create( obj = {} ) {
    this._value.push( obj )
    this.config.record.fields.forEach( field => {
      formeField( field, obj )
    } )
    let record = new Record( this, obj, this.config.record, false )
    this.records.push( record )
    this._addLength++
  }
  query( params = {} ) {
    if ( !this.queryUrl ) {
      return
    }
    this.hasQuery = true
    let queryParams = {
      ...params,
      ...this.params
    }
    if ( this.config.page ) {
      queryParams = {
        start: ( this.currentPage - 1 ) * this.size,
        num: this.size,
        ...queryParams
      }
    }
    if ( this.queryDs ) {
      this.queryDs.fields.forEach( field => {
        if ( field.hasValue ) {
          queryParams[ field.key ] = field.value
        }
      } )
    }
    if ( this.queryTip ) {
      queryParams = {
        ...queryParams,
        broadcast: true
      }
    }
    http( this.queryUrl, queryParams ).then( ( {
      data
    } ) => {
      let resData = this.queryFilter ? this.queryFilter( data ) : data.data
      if ( this.isArray ) {
        this.autoCreate = true
        if ( Array.isArray( resData ) ) {
          this.value = resData
          this._total = resData.length
        } else {
          this.value = resData.list
          this._total = resData.total
        }
        this.autoCreate = false
      } else {
        this.value = resData
      }
      this.emit( 'querySuccess', data )
    } )
  }
  reset() {
    this.value = {}
  }
  checkRules() {
    let flag = true
    // field规则校验
    for ( let field of this.fields ) {
      if ( field.error !== '' ) {
        return false
      }
    }
    // field必输校验
    this.fields.forEach( field => {
      if ( field.required && !field.hasValue ) {
        field.error = `${field.name}必输`
        flag = false
      }
    } )
    if ( !flag ) {
      return flag
    }
    // 行规则校验
    for ( let record of this.records ) {
      if ( !record.checkRules() ) {
        return false
      }
    }
    // 整单规则校验
    let rules = this.config.rules
    if ( rules ) {
      for ( let rule of rules ) {
        if ( rule.check( this ) ) {
          Notification( {
            type: 'error',
            message: rule.error
          } )
          return false
        }
      }
    }
    return true
  }
  async save( params ) {
    if ( !this.checkRules() ) {
      return false
    }
    try {
      let res = await http( this.saveUrl, {
        ...this.value,
        ...params,
        broadcast: this.saveTip
      } )
      this.emit( 'saveSuccess', res )
      return res
    } catch ( error ) {
      return false
    }
  }
  _addDirty( record ) {
    this.dirtyStack.add( record )
  }
  _deleteDirty( record ) {
    this.dirtyStack.delete( record )
  }
  emit( name, ...arg ) {
    let funs = this._funStack[ name ]
    if ( funs && funs.length > 0 ) {
      for ( let fun of funs ) {
        fun( ...arg )
      }
    }
  }
  on( name, fun ) {
    if ( !this._funStack[ name ] ) {
      this._funStack[ name ] = []
    }
    this._funStack[ name ].push( fun )
  }
  get dirty() {
    return this.dirtyStack.size > 0
  }
  set dirty( val ) {}
}

export default DataSets
