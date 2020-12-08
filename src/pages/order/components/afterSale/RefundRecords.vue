<template>
  <!-- 退款记录 serviceType=3 服务单类型（1-退货，2-换货，3-退款）-->
  <div class="refundRecords">
    <IcTableConfig :base-config="baseConfig" @set-config="setConf"></IcTableConfig>
    <hr />
    <!-- :loading="!tableData.length" -->
    <IcTable
      :config="config"
      :max-height="500"
      :data="tableData"
      :has-page="false"
      :key="config.length"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop === 'goodsInfo'">
          名称： {{ row.goodsName }}
          <br />
          <span style="font-size: 12px;">
            规格： {{ row.goodsSpecification }}
            <br />
            LC编码： {{ row.goodsLcCode }}
          </span>
        </template>
        <template v-else-if="con.prop === 'goodsNum'">
          <span>{{ row[con.prop] }} 件</span>
        </template>
        <template v-else-if="con.prop === 'refundAmount'">
          <span>
            <!-- ￥{{ row[con.prop] }} -->
            ￥{{ Number(row[con.prop]).toFixed(2) }}
          </span>
        </template>
        <!-- 【退货状态】 12-已拒绝 【换货状态】22-已拒绝 【退款状态】38-已拒绝 -->
        <template v-else-if="con.prop === 'serviceStatus'">
          <el-tooltip
            v-if="row.serviceStatus =='12'&& row.serviceStatus =='22'&& row.serviceStatus =='38'"
            placement="right"
          >
            <div slot="content">{{row.reviewNoPassReason}}</div>
            <span>
              {{ formatStatus(row[con.prop]) }}
              <i class="el-icon-information"></i>
            </span>
          </el-tooltip>
          <span v-else>{{ formatStatus(row[con.prop]) }}</span>
        </template>
        <template v-else-if="con.prop === 'reviewName'">
          <span>{{ row[con.prop] }}</span>
        </template>
        <template v-else-if="con.prop === 'time'">
          <!-- <span>{{formatDateToStr(row[con.prop].time)}}</span> -->
          <el-tooltip placement="right">
            <div slot="content">
              <template>
                <span v-for="time in times" :key="time.id">
                  <template v-if="row[time.id]">
                    <br v-if="time.id!='applyTime'" />
                    <span class="time">{{time.name}}：</span>
                    {{formatDateToStr(row[time.id].time)}}
                  </template>
                </span>
              </template>
            </div>
            <span>
              {{formatLastDate(row)}}
              <i class="el-icon-information"></i>
            </span>
          </el-tooltip>
        </template>
        <template v-else>{{ row[con.prop] }}</template>
      </template>
    </IcTable>
  </div>
</template>
<script lang="ts">
// 退货记录 serviceType=3 服务单类型（1-退货，2-换货，3-退款）
import { Vue, Component, Inject, Prop } from "vue-property-decorator";
import { Mutation, Getter, Action } from "vuex-class";

import API from "@/API";

import IcTableConfig from "@/components/table/control.vue";
import IcTable from "@/components/table";

import { IDName, IBaseConfig, refundRecordsBaseConfig, serviceType, serviceStatus, findItem, times } from "./status";

@Component( {
  name: "RefundRecords",
  components: { IcTableConfig, IcTable, },
} )
export default class RefundRecords extends Vue {
  // @Mutation( "server/setRefundingConf" ) setConf;
  // @Getter( "server/refundingConfig" ) baseConfig;
  @Inject() formatMyDate;
  @Prop( { required: true, type: Array, default: () => [] } ) data;

  times: Array<IDName> = times;
  baseConfig: Array<IBaseConfig> = refundRecordsBaseConfig;

  get tableData () {
    // return serviceOrderList;
    return this.data;
  }
  get config () {
    return this.baseConfig.filter( ( item ) => item.isChecked );
  }
  setConf ( props ) {
    this.baseConfig = this.baseConfig.map( ( item ) => {
      item.isChecked = props.includes( item.prop );
      return item;
    } );
  }

  created () {
    this.baseConfig = this.baseConfig.map( ( item ) => {
      item.isChecked = true;
      return item;
    } );
  }
  formatStatus ( id ) {
    return findItem( id, serviceStatus ).name;
  }
  formatDateToStr ( time: any ) {
    if ( !time ) return "";
    return this.formatMyDate( new Date( time ) );
  }
  formatLastDate ( item ) {
    let timeArr = this.times.concat().reverse();
    let i = 0,
      l = timeArr.length;
    for ( ; i < l; i++ ) {
      let { id, name } = timeArr[ i ];
      let data = item[ id ];
      if ( data ) {
        return name + "：" + this.formatDateToStr( data.time );
      }
    }
    return "Invalid Date";
  }

}
</script>
<style lang="stylus" scoped>
.jd
  display inline-block
  font-size 12px
  width 20px
  height 20px
  line-height 20px
  color #fff
  background orange
  border-radius 50%
  text-align center
  margin-left 5px
.marginLeft20
  margin-left 20px
</style>
