<template>
  <div class="freight-list">
    <lc-title text="运费模板"></lc-title>
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <!-- <lc-table-config :base-config="baseConfig"></lc-table-config> -->
    <el-button
      class="create-btn"
      type="info"
      @click="addTemplate"
      v-if="$permissionValidate(677)"
    >新增模板</el-button>
    <lc-table
      :config="baseConfig"
      :data="freightData"
      @cur-change="curChange"
      :page="page"
      :key="baseConfig.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop==='control' ">
          <el-button
            type="info"
            size="mini"
            @click="edit(scope.row.id)"
            v-if="$permissionValidate(678)"
          >编辑</el-button>
          <el-button
            type="info"
            size="mini"
            @click="detail(scope.row.id)"
            v-if="$permissionValidate(655)"
          >查看</el-button>
          <el-button
            type="danger"
            size="mini"
            @click="deleteTemplate(scope.row.id)"
            v-if="$permissionValidate(658)"
          >删除</el-button>
        </template>
        <template
          v-else-if="scope.con.prop==='createTime' || scope.con.prop === 'updateTime' "
        >{{formatDate(scope.row[scope.con.prop])}}</template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import lcCondition from '../../components/condition.vue'
import lcTableConfig from '../../components/table/control.vue'
import lcTable from '../../components/table/index'

@Component( {
  name: 'freight-list',
  components: {
    lcTitle,
    lcCondition,
    lcTableConfig,
    lcTable
  }
} )
export default class freightList extends Vue {
  condition = [
    { value: '', key: 'templateName', label: '模板名称', type: 'text' },
    { value: '', key: 'timeRange', label: '创建时间', type: 'daterange' }
  ]
  baseConfig = [
    { prop: 'templateName', label: '模板名称' },
    { prop: 'createTime', label: '创建时间' },
    { prop: 'updateTime', label: '更新时间' },
    { prop: 'control', label: '操作', width: '170px' }
  ]
  page = {
    cur: 1,
    total: 0,
    num: 10
  }

  freightData = [
  ]

  activated () {
    this.search()
  }

  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }

  @Inject() formatMyDate

  formatDate ( date: any = {} ) {
    if ( date && date.time ) {
      return this.formatMyDate( date.time )
    }
    return ''
  }

  search () {
    this.$permissionValidateWithNotify( 655 )
    this.getTemplates( this.formatOptions() )
  }

  getTemplates ( condition = {} ) {
    this.$http( API.getFreightTemplateList, condition ).then( ( { data } ) => {
      this.freightData = data.data.list
      this.page.total = data.data.total
    } ).catch( err => {
      this.freightData = []
      console.log( err )
    } )
  }

  formatOptions () {
    let param: any = {}
    this.condition.forEach( v => {
      if ( v.value !== '' ) {
        param[ v.key ] = v.value
      }
    } )
    if ( param.timeRange && param.timeRange.length > 0 ) {
      param.beginTime = this.formatMyDate( param.timeRange[ 0 ] )
      param.endTime = this.formatMyDate( param.timeRange[ 1 ], void 0, true )
    }
    let { cur, num } = this.page
    param.num = num
    param.start = ( cur - 1 ) * num

    delete param.timeRange

    return param
  }
  addTemplate () {
    this.$router.push( '/freight/create' )
  }
  edit ( id ) {
    this.$router.push( `/freight/edit/${id}` )
  }
  detail ( id ) {
    this.$router.push( `/freight/detail/${id}` )
  }
  deleteTemplate ( id ) {
    this.$confirm( '是否确定删除?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
      closeOnClickModal: false
    } ).then( () => {
      this.$http( API.deleteFreightTemplate, {
        id
      } ).then( ( { data } ) => {
        this.freightData.some( ( v: any, index: number ) => {
          if ( v.id === id ) {
            this.freightData.splice( index, 1 )
            return true
          }
          return false
        } )
      } )
    } )
  }
}
</script>

<style lang="stylus" scoped>
.create-btn
  margin-bottom 10px
</style>

