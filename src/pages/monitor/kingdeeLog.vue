<template>
  <div class="kingdee-log">
    <lc-title text="金蝶日志"></lc-title>
    <lc-condition :condition="condition" @submit="search">
      <!-- <template slot="btn">
        <el-button class="data-push-btn" type="warning" @click="dataPush">数据补推</el-button>
      </template>-->
    </lc-condition>
    <lc-table
      :config="config"
      :data="kingdeeList"
      :page="page"
      @cur-change="curChange"
      controller-name="kingdeeLog"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop === 'reqInterfaceId'">{{convertInterface( row[ con.prop ] )}}</template>
        <template v-else-if="con.prop === 'pushResultStatus'">{{convertStatus( row[ con.prop ] )}}</template>
        <template v-else-if="con.prop === 'returnResult'||con.prop === 'reqBody'">
          <el-input type="textarea" :rows="5" v-model.trim="row[con.prop]" :disabled="true"></el-input>
        </template>

        <template
          v-else-if="['pushTime'].indexOf(con.prop) > -1"
        >{{formatMyDate( row[ con.prop ] )}}</template>
        <template v-else>{{row[ con.prop ]}}</template>
      </template>
    </lc-table>
    <!-- <data-push-modal v-model="dialogPushModalVisible" v-if="dialogPushModalVisible"></data-push-modal> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import LcTitle from '@/components/title.vue'
import LcCondition from '@/components/condition.vue'
import lcTable from '../../components/table/index'
import DataPushModal from './components/dataPushModal.vue'
import { matchArrItem } from '../../utils'
import API from '../../API'
import { kingdeeInterfaces, saasMonitorStatus } from './const'

@Component( {
  name: 'kingdee-log',
  components: {
    LcTitle,
    lcTable,
    LcCondition,
    DataPushModal
  }
} )
export default class invliceLog extends Vue {
  @Inject() formatMyDate
  dialogPushModalVisible: boolean = false
  kingdeeList: any[] = []
  API = API

  condition: any[] = [
    { value: '', key: 'reqInterfaceId', label: '接口名称', type: 'select', options: kingdeeInterfaces },
    { value: '', key: 'bizSn', label: '单据号', type: 'text' },
    { value: '', key: 'pushResultStatus', label: '推送状态', type: 'select', options: saasMonitorStatus },
    { value: '', key: 'push', label: '推送时间', type: 'daterange' }
  ]
  config: any[] = [
    { prop: 'bizSn', label: '单据号', width: '150px' },
    { prop: 'reqInterfaceId', label: '接口名称', width: '120px' },
    { prop: 'pushResultStatus', label: '推送状态', width: '120px' },
    { prop: 'pushTime', label: '推送时间', width: '200px' },
    // { prop: 'retryTime', label: '重推时间', width: '200px' },
    { prop: 'reqBody', label: '请求参数', width: '250px' },
    { prop: 'returnResult', label: '返回结果', width: '250px' },
    { prop: 'control', label: '操作', width: '120px', fixed: 'right' }
  ]

  page: any = {
    total: 0,
    cur: 1,
    num: 10
  }

  activated () {
    this.search()
  }
  curChange ( cur ) {
    this.page.cur = cur
    this.search()
  }
  formatParam () {
    let { num, cur } = this.page
    let param = {
      start: ( cur - 1 ) * num,
      num
    }
    this.condition.forEach( item => {
      let { value, key, type } = item
      if ( type === 'daterange' ) {
        if ( value && value[ 0 ] ) {
          let [ start, end ] = value
          param[ key + 'StartTime' ] = this.formatMyDate( start )
          param[ key + 'EndTime' ] = this.formatMyDate( end, void 0, true )
        }
      } else if ( value !== '' || !!value ) {
        param[ key ] = value
      }
    } )
    return param
  }
  search () {
    let param = this.formatParam()
    this.$http( API.kingdeePushLogList, param ).then( ( { data } ) => {
      this.kingdeeList = data.data.list
      this.page.total = data.data.total
    } ).catch( ( { data } ) => {
      this.kingdeeList = []
      this.page.total = 0
      this.$notify( {
        type: 'error',
        message: data.msg
      } )
    } )
  }
  convertInterface ( value ): string {
    return matchArrItem( value, kingdeeInterfaces, 'id' ).name
  }
  convertStatus ( value ): string {
    return matchArrItem( value, saasMonitorStatus, 'id' ).name
  }
  dataPush () {
    this.dialogPushModalVisible = true
  }
}

</script>

<style lang="stylus">
.kingdee-log
  .el-table .cell
    max-height 300px
    overflow auto
    padding 20px
</style>
