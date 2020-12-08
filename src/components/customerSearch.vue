<template>
  <div class="customer-search">
    <el-autocomplete
      v-model="customerName"
      @input="handlerFocus"
      ref="autocomplete"
      :fetch-suggestions="querySearchAsync"
      placeholder="请输入客户名称"
      @select="handleSelect"
      @keydown.enter.stop="stopSubmit"
      :custom-item="customItem"
    ></el-autocomplete>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Model, Watch } from 'vue-property-decorator'

import { debounce } from '../utils'
import API from '../API'

Vue.component( 'customSearchItem', {
  props: [ 'item' ],
  template: `<li :title="item.name" @click="$emit('click',item)">{{item.name}}</li>`
} )

@Component
export default class CustomerSearch extends Vue {
  @Prop( { default: '' } )
  text: string
  customItem = 'customSearchItem'
  @Watch( 'text' )
  textWatcher ( v ) {
    this.customerName = v
    if ( !v ) {
      this.customerId = ''
      this.customerName = ''
    }
  }
  // @Model() customerName: string = ''
  customerName: string = ''
  customerId: string = ''
  curCustomer: any = null
  handlerFocus ( text ) {
    // 修复bug select失效
    let autocomplete: any = this.$refs[ 'autocomplete' ]
    autocomplete.isFocus = true
    if ( text.trim() == '' ) {
      this.$emit( 'broadcast', {} )
    }
  }
  querySearchAsync ( queryString, cb ) {
    queryString = queryString.split( '(' )[ 0 ]
    if ( !queryString || !( queryString = queryString.trim() ) ) {
      return cb( [] )
    }
    this.getCustomer( queryString, cb )
  }
  customerCache: any = {}
  getCustomer: ( queryString: string, cb: string ) => void = debounce( function ( queryString, cb ) {
    if ( this.customerCache[ queryString ] ) {
      return cb( this.customerCache[ queryString ] )
    }
    this.$http( API.getOfficeInfoByCustomerName, {
      customerName: this.customerName,
      start: 0,
      num: 100
    } ).then( ( { data } ) => {
      let arr = ( data.data && data.data.items || [] ).map( v => ( {
        ...v,
        id: v.customerId,
        value: v.customerName,
        name: v.customerName
      } ) )
      cb( arr )
      this.$set( this.customerCache, queryString, arr )
    } ).catch( err => {
      console.log( err )
    } )
  }, 300, true )
  handleSelect ( item ) {
    item = Object.assign( {}, item )
    this.curCustomer = item
    this.$emit( 'broadcast', item )
  }
  stopSubmit () {
    return false
  }
  clearCustomer () {
    this.customerName = ''
    this.customerId = ''
  }
  deactivated () {

    this.clearCustomer()
    this.$emit( 'broadcast', {} )
  }

}
</script>
<style lang="stylus" scoped>
.el-autocomplete
  width 100%
</style>
