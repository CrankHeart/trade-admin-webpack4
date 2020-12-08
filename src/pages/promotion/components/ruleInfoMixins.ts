import Vue from 'vue'

import { Component, Prop, Watch } from 'vue-property-decorator'

@Component( {
  name: 'rule-info-mixins'
} )
export default class RuleInfoMixins extends Vue {

  @Prop( { default: () => { } } )
  value: any
  @Prop()
  disabled: boolean
  isChecked: boolean = true

  get ruleInfo () {
    this.subType = this.value.subType
    return this.value
  }
  set ruleInfo ( v ) {
    this.$emit( 'input', v )
    this.$emit( 'change', v )
  }
  add ( index, ruleList ) {
    ruleList.push( { condition: '', discount: '' } )
  }
  del ( index, ruleList ) {
    if ( ruleList.length == 1 ) {
      ruleList.splice( 0, 1, { condition: '', discount: '' } )
      return
    }
    ruleList.splice( index, 1 )
  }
  fixed ( item, type ) {
    item[ type ] = Number( +item[ type ] || 0 ).toFixed( 2 )
  }

  subType: number | string = ''

  @Watch( 'subType' )
  subTypeWatcher ( v ) {
    let ruleContainer: any = this.ruleInfo,
      // ruleInfo = ruleContainer.ruleInfo,
      subType = ruleContainer.subType
    let ruleInfo = [ { condition: '', discount: [ { lcSkuCode: '', skuNum: '' } ] } ]
    if ( subType !== v ) {
      this.ruleInfo = { ...this.ruleInfo, ruleInfo, subType: v }
    }
  }
} 