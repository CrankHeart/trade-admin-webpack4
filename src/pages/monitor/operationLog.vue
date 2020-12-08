<template>
  <div class="operation-log">
    <lc-condition :labelWidth="'110px'" :condition="condition" @submit="search"></lc-condition>
    <lc-table
      :config="config"
      :data="myData"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop =='updatedByUserId'">{{formatUser(row.updatedByUserId)}}</template>
        <template v-else-if="con.prop =='module'">{{formatModule(row.module)}}</template>
        <template v-else-if="con.prop =='operateDetail'||con.prop =='logContent'">
          <el-input v-if="row[con.prop]" :value="row[con.prop]" type="textarea" :row="2" disabled></el-input>
        </template>
        <template v-else-if="con.prop =='logLevel'">{{formatLogLevel(row.logLevel)}}</template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator'
import lcCondition from './../../components/condition.vue'
import lcTable from './../../components/table/index'
import API from './../../API'
import { modules, logLevels } from './const'


@Component( {
  name: 'operation-log',
  components: {
    lcCondition,
    lcTable
  }
} )
export default class OperationLog extends Vue {
  config = [
    { prop: 'module', label: '模块', width: '130px' },
    { prop: 'methodName', label: '方法名', width: '130px' },
    { prop: 'bizSeqId', label: '单据号', width: '130px' },
    { prop: 'updatedByUserId', label: '用户', width: '100px' },
    { prop: 'updateItem', label: '变更字段', width: '100px' },
    { prop: 'updatedValue', label: '变更值', width: '100px' },
    { prop: 'operateDetail', label: '操作详情' },
    { prop: 'updatedTime', label: '操作时间', width: '180px' },

  ]
  myData: any[] = []
  users: any[] = []
  condition = [
    { value: void 0, key: 'module', label: '模块', type: 'select', options: modules },
    { value: void 0, key: 'methodName', label: '方法名', type: 'text' },
    { value: void 0, key: 'bizSeqId', label: '单据号', type: 'text' },
    { value: void 0, key: 'updatedByUserId', label: '用户', type: 'select', options: this.users },
    { value: void 0, key: 'updated', label: '操作时间', type: 'daterange' }
  ]
  get moduleObj () {
    return modules.reduce( ( t, n ) => {
      let { id, name } = n
      t[ id ] = n
      return t
    }, {} )
  }
  formatModule ( id ) {
    return this.moduleObj[ id ] && this.moduleObj[ id ].name
  }
  get userObj () {
    return this.users.reduce( ( t, n ) => {
      let { id } = n
      t[ id ] = n
      return t
    }, {} )
  }
  formatUser ( id ) {
    return this.userObj[ id ] && this.userObj[ id ].name
  }
  get logLevelObj () {
    return logLevels.reduce( ( t, n ) => {
      let { id } = n
      t[ id ] = n
      return t
    }, {} )
  }
  formatLogLevel ( id ) {
    return this.logLevelObj[ id ] && this.logLevelObj[ id ].name
  }
  page = {
    cur: 0,
    num: 10,
    total: 0
  }
  curChange ( cur ) {
    this.search( cur )
  }

  @Inject() formatMyDate
  formatDate ( o ) {
    if ( o ) {
      return this.formatMyDate( o )
    }
  }
  logQueryLink = API.operationList
  search ( cur = 1 ) {
    this.page.cur = cur
    let option = this.computedAjaxOption()

    if (
      (
        ( this.logQueryLink == API.operationList && ( option.updatedByUserId || option.updatedStartTime ) ) ||
        ( this.logQueryLink == API.systemList && ( option.logLevel || option.createStartTime ) )
      ) && !option.module
    ) {
      return this.$notify( {
        type: 'error',
        message: '所选搜索条件必须包含模块条件'
      } )
    }
    this.$http( this.logQueryLink, option ).then( ( { data } ) => {
      let { list = [], total = 0 } = data.data || {}
      this.myData = list
      this.page.total = total
    } )
  }

  activated () {
    this.search()
    this.getAllUsers()
  }
  getAllUsers () {
    this.$http( API.getAllUsers ).then( ( { data } ) => {
      let { list = [] } = data.data || {}
      this.users.push( ...list.map( ( { id, userName } ) => ( { id, name: userName } ) ) )
    } )
  }
  computedAjaxOption () {
    let o: any = {}
    this.condition.forEach( v => {
      let { key, value, type } = v
      if ( type === 'daterange' ) {
        if ( value && value[ 0 ] ) {
          let [ start, end ] = value
          o[ key + 'StartTime' ] = this.formatMyDate( start )
          o[ key + 'EndTime' ] = this.formatMyDate( end, void 0, true )
        }
      } else {
        o[ key ] = value === '' ? void 0 : value
      }
    } )
    let { cur, num } = this.page
    o.num = num
    o.start = ( cur - 1 ) * num
    return o
  }
}

</script>

