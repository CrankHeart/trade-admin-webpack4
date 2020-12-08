<template>
  <div class="ground-discount-config">
    <lc-title text="地推优惠配置列表">
      <el-button
        style="float: right"
        type="primary"
        @click="showConfig"
        v-if="$permissionValidateWithEnv(1185,1181)"
      >新建地推优惠</el-button>
    </lc-title>
    <lc-table :config="tableConfig" :data="opereationLog" :page="page" @cur-change="curChange">
      <template slot-scope="scope">
        <template v-if="scope.con.prop.indexOf('Time')>-1">{{formatDate(scope.row[scope.con.prop])}}</template>
        <template
          v-else-if="scope.con.prop === 'enabled'"
        >{{scope.row['enabled'] === 0 ? '失效': '有效' }}</template>
        <template
          v-else-if="scope.con.prop === 'discountLimitRate'"
        >{{ Number( scope.row['discountLimitRate'] * 100 ).toFixed(2) }}%</template>
        <template
          v-else-if="scope.con.prop === 'autoAuditEnabled'"
        >{{scope.row['autoAuditEnabled'] === 0 ? '不开启': '开启' }}</template>
        <template v-else-if="scope.con.prop === 'levelAutoEnabled'">
          <p v-for="(item, index ) in formatLevelAutoEnabled(scope.row)" :key="index">{{ item }}</p>
        </template>
        <template v-else-if="scope.con.prop === 'levelValue'">
          <p v-for="(item, index ) in formatLevelValue(scope.row)" :key="index">{{ item }}</p>
        </template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <ground-discount-config v-model="showConfigDialog" @refresh="getOpereationLog"></ground-discount-config>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator'
import API from '../../API'
import lcTitle from '../../components/title.vue'
import lcTable from '../../components/table'
import GroundDiscountConfig from './components/groundDiscountConfig.vue'

@Component( {
  name: 'ground-discount-config-list',
  components: {
    lcTitle,
    lcTable,
    GroundDiscountConfig
  }
} )
export default class GroundDiscountConfigList extends Vue {

  @Inject() formatMyDate
  formatDate ( o ) {
    let time = o && o.time
    if ( time ) {
      return this.formatMyDate( new Date( time ) )
    }
  }
  showConfigDialog: boolean = false

  page = {
    cur: 1,
    total: 0,
    num: 20,
  }
  opereationLog = []

  tableConfig: any[] = [
    // { prop: 'id', label: 'id' },
    { prop: 'createUser', label: '创建人' },
    { prop: 'createTime', label: '创建时间' },
    { prop: 'enabled', label: '是否有效' },
    { prop: 'discountLimitRate', label: '优惠额度' },
    { prop: 'autoAuditEnabled', label: '自动审批' },
    { prop: 'levelAutoEnabled', label: '自动审批的等级' },
    { prop: 'levelValue', label: '各等级起始值' },
    { prop: 'remark', label: '备注' },
    // { prop: 'control', label: '操作' }
  ]

  // created () {
  //   this.getOpereationLog()
  // }
  activated () {
    this.getOpereationLog()
  }

  curChange ( cur ) {
    this.page.cur = cur
    this.getOpereationLog()
  }

  getOpereationLog () {
    this.$permissionValidateWithNotifyEnv( 1183, 1179 )
    let { cur, num } = this.page
    let param: any = {
      start: ( cur - 1 ) * num,
      num
    }
    this.$http( API.getSettingOpereationLog, param ).then( ( { data } ) => {
      data = data.data
      this.opereationLog = data.list
      this.page.total = data.total
    } )
  }

  formatLevelAutoEnabled ( item ) {
    let levels = []
    item.level0AutoEnabled ? levels.push( 'A' ) : '';
    item.level1AutoEnabled ? levels.push( 'B' ) : '';
    item.level2AutoEnabled ? levels.push( 'C' ) : '';

    return levels
  }

  formatLevelValue ( item ) {
    let levels = []
    item.level0 ? levels.push( `A : ${item.level0}` ) : '';
    item.level1 ? levels.push( `B : ${item.level1}` ) : '';
    item.level2 ? levels.push( `C : ${item.level2}` ) : '';
    return levels;
  }

  showConfig () {
    this.showConfigDialog = true
  }

}

</script>
