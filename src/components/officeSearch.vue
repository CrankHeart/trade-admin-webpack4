<template>
  <div class="office-search">
    <tenant-search :text="user.tenantName" @broadcast="broadCastTenant"></tenant-search>
    <el-select v-model="officeId" @input="officeChange" clearable>
      <el-option v-for="(office,index) in officeList" :key="index" :label="office.name" :value="office.id" :title="office.name"></el-option>
    </el-select>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import tenantSearch from './tenantSearch/index.vue'
import API from '../API/'
interface User {
  tenantName?: string,
  tenantId?: string,
  officeName?: string,
  officeId?: number
}
@Component( {
  name: 'OfficeSearch',
  components: {
    tenantSearch
  }
} )
export default class OfficeSearch extends Vue {
  @Prop( { default: () => { } } )
  user: User
  officeList: any[] = []
  officeId: any = null
  officeChange ( officeId ) {
    let office = this.officeList.filter( v => v.id == officeId )[ 0 ] || {}
    this.$emit( 'broadcast', {
      ...this.user,
      officeId: officeId,
      officeName: office.name
    } )
  }
  @Watch( 'user', { deep: true } )
  userIdWatcher ( v, o ) {
    this.officeId = v.officeId
    if ( !this.officeList.length ) {
      this.officeList.push( {
        id: v.officeId,
        name: v.officeName
      } )
    }
  }
  broadCastTenant ( { id, name } ) {
    this.$emit( 'broadcast', {
      tenantName: name,
      tenantId: id
    } )
    this.officeList = []
    if ( id ) {
      this.getOfficesByTenantId( id )
    }
  }
  getOfficesByTenantId ( tenantId ) {
    this.$http( API.getOfficesByTenantId, { tenantId } ).then( ( { data } ) => {
      let { officeList = [] } = data && data.data || {}
      this.officeList = officeList
    } )
  }
}
</script>
<style lang="stylus" >
.office-search
  display flex
  .el-select
    flex-grow 1
  .tenant-search
    .el-input__inner
      border-right none
      border-top-right-radius 0
      border-bottom-right-radius 0
  .el-select
    .el-input__inner
      border-top-left-radius 0
      border-bottom-left-radius 0
      
</style>
