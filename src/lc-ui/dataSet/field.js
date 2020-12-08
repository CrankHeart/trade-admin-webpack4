import pickerOptions from './public/pickerOptions'
import Vue from 'vue'
class Field {
  constructor( parent, config ) {
    this.parent = parent
    this.root = parent.parent ? parent.parent : parent
    this.editor = config.editor
    this.key = config.key
    this.name = config.name
    this.required = config.required
    this.readOnly = config.readOnly
    this.disabled = config.disabled
    this.maxlength = config.maxlength
    this.editable = config.editable
    this.clearable = config.clearable
    this.filterable = config.filterable
    this.multiple = config.multiple
    this.type = config.type
    this.placeholder = config.placeholder
    this.fixed = config.fixed
    this.template = config.template
    this.error = ''
    this.map = config.config && config.config.map
    this.config = config
    this.dirty = false
    this.oldValue = this.value
    this.originValue = this.value
    if ( this.editor === 'inputNumber' ) {
      this.min = Number.isFinite( config.min ) ? config.min : -Infinity
      this.max = Number.isFinite( config.max ) ? config.max : Infinity
    }
    this.formatTooltip = config.formatTooltip || ( val => val )
    this._watchers = new Set()
    this.params = this._initParams()
    if ( this.type === 'daterange' ) {
      this._bindFieldKeys = config.key.split( ',' )
      this.pickerOptions = config.pickerOptions || pickerOptions
    }
  }
  get value() {
    if ( Field.target ) {
      this._watchers.add( Field.target )
    }
    if ( this.type === 'daterange' && this._bindFieldKeys ) {
      let val = []
      this._bindFieldKeys.forEach( key => val.push( this.parent.value[ key ] ) )
      return val
    }
    return this.parent.value[ this.config.key ]
  }
  get hasValue() {
    if ( this.value === '' || this.value === undefined || this.value === null ) {
      return false
    }
    if ( Array.isArray( this.value ) && this.value.length === 0 ) {
      return false
    }
    return true
  }
  set value( val ) {
    if ( this.value === val ) {
      return
    }
    if ( this.editor === 'date' && val instanceof Array ) {
      if ( this.type === 'daterange' ) {
        this._bindFieldKeys.forEach( ( key, i ) => {
          Vue.set( this.parent.value, key, val[ i ] )
        } )
      }
    } else {
      this.parent.value[ this.config.key ] = val
    }
    if ( this.hasValue && this.error ) {
      this.error = ''
    }
    if ( this.originValue === val ) {
      this.dirty = false
      this.parent._deleteDirty( this )
    } else {
      this.dirty = true
      this.parent._addDirty( this )
    }
    if ( this._watchers ) {
      this._watchers.forEach( field => {
        field.oldValue = field.value
        field.value = undefined
      } )
    }
    this.root.emit( 'fieldChange', this )
  }
  checkRules() {
    let rules = this.config.rules
    if ( !rules ) {
      this.oldValue = this.value
      return true
    }
    for ( let rule of rules ) {
      if ( rule.check( this ) ) {
        this.error = rule.error
        // this.value = this.oldValue
        return false
      }
    }
    this.oldValue = this.value
    return true
  }
  _initParams() {
    let params = this.config.params
    if ( !params ) {
      return
    }
    Field.target = this
    let para = {}
    if ( params instanceof Array ) {
      for ( let key of params ) {
        para[ key ] = this.parent.fields[ key ]
      }
    } else if ( params instanceof Function ) {
      para = params( this.parent )
      this._recursionObj( para )
    } else {
      para = params
    }
    Field.target = null
    return para
  }
  _recursionObj( obj ) {
    if ( obj instanceof Object ) {
      for ( let key in obj ) {
        let field = this.parent.fields[ key ]
        if ( field ) {
          let val = field.value
        }
        this._recursionObj( obj[ key ] )
      }
    }
  }
}

export default Field
