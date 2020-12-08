import Field from './field'
import {
  http
} from '../../utils/index.ts'
import {
  Notification
} from 'element-ui'
class Record {
  constructor( parent, value, config, auto ) {
    this.parent = parent
    this.value = value
    this.config = config
    this.template = config.template || 'default'
    this.fields = []
    this.checked = false
    this.dirtyStack = new Set()
    if ( this.config.fields ) {
      this.config.fields.forEach( field => {
        let _field = new Field( this, field )
        this.fields.push( _field )
      } )
    }
    this.auto = auto
    if ( !auto ) {
      this.parent._addDirty( this )
    }
  }
  checkRules() {
    // field规则校验
    for ( let field of this.fields ) {
      if ( field.required && !field.hasValue ) {
        Notification( {
          type: 'error',
          message: `第${this.index+1}行：${field.name}必输`
        } )
        return false
      }
      if ( field.error !== '' ) {
        Notification( {
          type: 'error',
          message: `第${this.index+1}行：${field.error}`
        } )
        return false
      }
    }
    const rules = this.config.rules
    if ( !rules ) {
      return true
    }
    for ( let rule of rules ) {
      if ( rule.check( this ) ) {
        Notification( {
          type: 'error',
          message: `第${this.index+1}行：${rule.error}`
        } )
        return false
      }
    }
    return true
  }
  get index() {
    let length = this.parent.records.length
    for ( let i = 0; i < length; i++ ) {
      if ( this === this.parent.records[ i ] )
        return i
    }
  }
  _addDirty( field ) {
    this.dirtyStack.add( field )
    this.dirty = true
  }
  _deleteDirty( field ) {
    this.dirtyStack.delete( field )
    if ( this.dirtyStack.size === 0 ) {
      this.dirty = false
    } else {
      this.dirty = true
    }
  }
  set dirty( val ) {
    if ( val ) {
      this.parent._addDirty( this )
    } else {
      this.parent._deleteDirty( this )
    }
  }
  get dirty() {
    return this.dirtyStack.size > 0
  }
  getField( key ) {
    return this.fields.find( field => field.key === key )
  }
  delete( params = {} ) {
    if ( this.auto ) {
      if ( this.deleteUrl ) {
        http( this.deleteUrl, {
          ...this.value,
          ...params,
          broadcast: true
        } ).then( ( {
          data
        } ) => {
          // 请求之后
          this.parent.value.splice( this.index, 1 )
          this.parent._addLength--
        } )
      } else {
        this.parent.value.splice( this.index, 1 )
        this.parent._addDirty( true )
        this.parent._addLength--
      }
    } else {
      this.parent.value.splice( this.index, 1 )
      this.parent._deleteDirty( this )
      this.parent._addLength--
    }
  }
}

export default Record
