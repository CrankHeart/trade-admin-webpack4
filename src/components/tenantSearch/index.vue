<template>
  <div class="tenant-search">
    <el-select v-if="twoWay" v-model="checkType">
      <el-option value="tenantName" label="企业名称"></el-option>
      <el-option value="tenantId" label="企业Id"></el-option>
    </el-select>

    <el-autocomplete
      v-model="tenantName"
      @input="handlerFocus"
      key="tenantName"
      v-if="checkType=='tenantName'"
      ref="autocomplete"
      :fetch-suggestions="querySearchAsync"
      placeholder="请输入企业名称"
      @select="handleSelect"
      @keydown.enter.stop="stopSubmit"
      :custom-item="customItem"
    ></el-autocomplete>

    <el-input
      v-model.trim="tenantId"
      @change="$emit('broadcast',{id: tenantId})"
      placeholder="请输入企业Id"
      v-else
      key="tenantId"
    ></el-input>
    <el-button @click="submit" v-if="hasSubmitBtn">提交</el-button>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject, Watch, Model } from 'vue-property-decorator'
import { debounce } from '../../utils'

import API from '../../API'
import { State, Getter, Mutation } from 'vuex-class'

Vue.component( 'tenantSearchItem', {
  props: [ 'item' ],
  template: `<li :title="item.name" @click="$emit('click',item)">{{item.name}}</li>`
} )
@Component( {
  name: 'tenant-search'
} )
export default class TenantSearch extends Vue {
  @Prop( { default: '' } )
  text: string
  customItem = 'tenantSearchItem'
  @Watch( 'text' )
  textWatcher ( v ) {
    this.tenantName = v
    if ( !v ) {
      this.tenantId = ''
      this.tenantName = ''
    }
  }
  checkType: 'tenantName' | 'tenantId' = 'tenantName'
  @Prop() labelWidth: number
  @Prop( { default: false } )
  twoWay: boolean

  @Prop( { default: false } )
  hasSubmitBtn: boolean
  @Model() tenantName: string = ''
  tenantId: string = ''
  // get tenantId(): string {
  //   let curTenant: any = this.curTenant
  //   return (curTenant && curTenant.id) || ''
  // }
  curTenant: object = null
  clearTenant () {
    this.tenantName = ''
    this.tenantId = ''
  }
  legalTenantName: object = {}
  @State( state => state.tenant.tenantNameStore ) tenantNameStore
  @Getter( 'tenant/tenantIdStore' ) tenantIdStore
  @Mutation( 'tenant/setTenantNameStoreList' ) setTenantNameStoreList
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
    this.getTenantNames( queryString, cb )
  }
  handleSelect ( item ) {
    // this.curTenant = item
    item = Object.assign( {}, item )
    this.curTenant = item
    // console.log(item, 1)
    this.$emit( 'broadcast', item )
  }

  stopSubmit () {
    return false
  }

  submitTenantById () {
    if ( !this.tenantId ) return
    if ( this.tenantIdStore[ this.tenantId ] ) {
      this.curTenant = this.tenantIdStore[ this.tenantId ]
      // console.log(this.curTenant, 2)
      this.$emit( 'broadcast', this.curTenant )
      return
    }
    this.curTenant = null
    this.$http( API.getOfficesByTenantId, {
      tenantId: this.tenantId
    } ).then( ( { data } ) => {
      let officeList = data.data && data.data.officeList || []
      let names = officeList.map( v => v.name )
      this.curTenant = {
        id: this.tenantId,
        name: names.join( ' / ' )
      }
      // console.log(this.curTenant, 3)
      this.$emit( 'broadcast', this.curTenant )
    } )
  }
  submitTenantByName () {
    if ( this.tenantNameStore[ this.tenantName ] ) {
      this.curTenant = this.tenantNameStore[ this.tenantName ]
      // console.log(this.curTenant, 4)
      this.$emit( 'broadcast', this.curTenant )
      return
    }
    this.curTenant = null
    this.$notify( {
      type: 'error',
      message: '企业名称输入不正确'
    } )
  }
  submit () {
    if ( this.checkType == 'tenantName' ) {
      this.submitTenantByName()
    } else {
      this.submitTenantById()
    }
  }
  getTenantNames: ( queryString: string, cb: string ) => void = debounce(
    function ( queryString, cb ) {
      if ( this.legalTenantName[ queryString ] ) {
        cb( this.legalTenantName[ queryString ] )
        return
      }
      this.$http( API.getTenantsInfoDetail, {
        tenantName: queryString,
        pageIndex: 0,
        pageSize: 100
      } ).then(
        ( { data } ) => {
          if ( !data.hasOwnProperty( 'data' ) || data.data.items.length == 0 ) {
            cb( [] )
            return false
          }
          let arr = this.formatList( data.data.items )
          cb( arr )

          this.$set( this.legalTenantName, queryString, arr )
          this.setTenantNameStoreList( arr )
        },
        rej => {
          cb( [] )
        }
      )
    },
    900,
    true
  )

  formatList ( item ) {
    let arr = []
    item.forEach( v => {
      arr.push( {
        ...v,
        id: v.tenantId,
        value: v.tenantName,
        name: v.tenantName
      } )
    } )
    return arr
  }
  deactivated () {
    // if (!this.curTenant) {
    // this.tenantName = ''
    // this.tenantId = ''
    // }
    this.clearTenant()
    this.$emit( 'broadcast', {} )
  }
}
</script>
<style lang="stylus" >
.tenant-search
  display flex !important
  .el-autocomplete
    flex-grow 1
  .el-select, .el-button
    flex-shrink 0
  .el-select
    width 150px
    margin-right 10px
  .el-button
    margin-left 10pxt 4
</style>


