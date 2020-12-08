<!--采购计划进行中和采购任务的查看详情-->
<template>
  <el-dialog v-model="visible" :title="`${lcSkuCode}查看交付情况`" class="risk-status">
    <div class="echart-wrap" ref="echart-wrap" style="width: 500px;height:450px;"></div>
    <div style="text-align: center;" v-html="dataTip"></div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="任务" name="demand">
        <lc-table
          :scroll-options="{offset: -350}"
          :config="demandConfig"
          :data="transactionMsg.demandList"
          key="demand"
          :max-height="190"
          :has-page="false"
        >
          <template slot-scope="{row,con}">
            <span
              v-if="con.prop==='riskLevel'"
              class="success-risk"
              :class="{'danger-risk': row[con.prop] <= 2  }"
            >{{ formatRiskLevel( row[con.prop] )}}</span>
            <span v-else-if="con.prop==='metaType'">{{formatMetaType(row[con.prop])}}</span>
            <span v-else>{{ row[con.prop] | mayDate(con.prop) }}</span>
          </template>
        </lc-table>
      </el-tab-pane>
      <el-tab-pane label="供应" name="supply">
        <lc-table
          :scroll-options="{offset: -350}"
          :config="supplyConfig"
          :data="transactionMsg.supplyList"
          key="supply"
          :max-height="190"
          :has-page="false"
        >
          <template slot-scope="{row,con}">
            <span v-if="con.prop==='state'">{{formatState(row[con.prop])}}</span>
            <span v-else>{{ row[con.prop] | mayDate(con.prop) }}</span>
          </template>
        </lc-table>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch, Inject } from "vue-property-decorator";
import myEcharts from "../../../utils/myEcharts";
import { riskLevels, metaTypes, supplyStates } from "../const";
import { matchArrItem } from "../../../utils/";
import API from "../../../API";
import lcTable from "../../../components/table/";
import getEchartsTotal from "../public/getEchartsTotal";

const riskColors = {
  1: "#ff4949",
  2: "#e6a23c",
  3: "#20a0ff",
  4: "#1AAD19"
};

const demandConfig = [
  {
    label: "类型",
    prop: "metaType"
  },
  {
    label: "任务id",
    prop: "id"
  },
  {
    label: "关联订单号",
    prop: "orderSn"
  },
  {
    label: "数量",
    prop: "purchaseNum"
  },
  {
    label: "预计交付日期",
    prop: "deliveryDate"
  },
  {
    label: "交付风险",
    prop: "riskLevel"
  }
];

const supplyConfig = [
  {
    label: "进度",
    prop: "state"
  },
  {
    label: "关联采购单号",
    prop: "procurementSn"
  },
  {
    label: "数量",
    prop: "onWayNum"
  },
  {
    label: "预计到货日期",
    prop: "deliveryDate"
  }
];

@Component( {
  name: "purchasing-task-details-dialog",
  components: {
    lcTable
  }
} )
export default class purchasingTaskDetailsDialog extends Vue {
  @Prop( { default: false } )
  value: boolean;
  @Prop( { default: "" } )
  skuId: string;
  @Prop( { default: "" } )
  lcSkuCode: string;

  @Inject() formatMyDate;

  options: any = {
    title: {
      text: ""
    },
    tooltip: {},
    xAxis: {
      data: [ "任务", "供应" ]
    },
    yAxis: {}
  };
  dataTip: string = "";
  activeName: string = "demand";
  transactionMsg: Object = {};
  demandConfig: Object = demandConfig;
  supplyConfig: Object = supplyConfig;

  get visible () {
    if ( this.value && this.skuId.length > 0 ) {
      this.getRiskStatusData( this.skuId );
    }
    return this.value;
  }

  set visible ( v ) {
    this.$emit( "input", v );
  }

  getRiskStatusData ( skuId ) {
    this.$permissionValidateWithNotify( 1125 );
    this.$http( API.purchaseTaskDetails, {
      skuId
    } ).then( ( { data } ) => {
      this.options.series = [];
      this.formatChartData( data.data );
      this.transactionMsg = data.data;
      let lockedNum = this.transactionMsg.lockedNum;
      if ( lockedNum > 0 ) {
        this.transactionMsg.demandList.push( { metaType: 99, purchaseNum: lockedNum } )
        this.transactionMsg.supplyList.push( { state: 99, onWayNum: lockedNum } )
      }
      let stockNum = this.transactionMsg.stockNum
      if ( stockNum > 0 ) {
        this.transactionMsg.demandList.push( { metaType: 100, purchaseNum: stockNum } )
        this.transactionMsg.supplyList.push( { state: 100, onWayNum: stockNum } )
      }
      if ( this.visible ) {
        this.$nextTick( () => this.showRefs() );
      }
    } );
  }

  showRefs () {
    let dom = this.$refs[ "echart-wrap" ];
    let myChart = myEcharts.init( dom );
    myChart.setOption( this.options );
    myChart.on( "click", this.showDataDetail );
  }
  closeDialog () {
    this.visible = false;
  }
  showDataDetail ( detail ) {
    this.dataTip = this.formatToolTip( detail ) || "";
  }

  formatChartData ( data ) {
    let xAxis = this.options.xAxis.data;
    let demandList = this.formatDemandList( data.demandList );
    let supplyList = this.formatSupplyList(
      data.supplyList,
      data.storedNum,
      data.stockNum,
      data.lockedNum
    );
    let length =
      demandList.length > supplyList.length
        ? demandList.length
        : supplyList.length;
    let series = [];
    for ( let i = 0; i < length; i++ ) {
      series.push( {
        type: "bar",
        stack: "risk",
        data: [ demandList[ i ] || undefined, supplyList[ i ] || undefined ]
      } );
    }
    getEchartsTotal( series )
    // this.options.title.text = `${this.lcSkuCode}的交付情况`
    this.options.series = series;
  }

  formatDemandList ( list ) {
    return list.map( item => {
      let { id, riskLevel, metaType, purchaseNum, deliveryDate } = item;
      deliveryDate = this.formatMyDate( deliveryDate.time, "yyyy-MM-dd" );
      let riskLevelName = matchArrItem( riskLevel, riskLevels, "id" ).name;
      let metaTypeName = matchArrItem( metaType, metaTypes, "id" ).name;

      return {
        id,
        riskLevelName,
        metaTypeName,
        deliveryDate,
        value: purchaseNum,
        itemStyle: {
          normal: {
            color: riskColors[ riskLevel ],
            borderColor: "#fff"
          }
        },
        label: {
          normal: {
            show: true,
            position: "inside"
          }
        },
        tooltip: {
          formatter: this.formatToolTip
        }
      };
    } );
  }

  formatSupplyList ( list, storedNum, stockNum, lockedNum ) {
    let stockList = [];
    let supplyList = list.map( item => {
      let { onWayNum, deliveryDate, procurementSn } = item;
      deliveryDate = this.formatMyDate( deliveryDate.time, "yyyy-MM-dd" );
      return {
        procurementSn,
        deliveryDate,
        value: onWayNum,
        label: {
          normal: {
            show: true,
            position: "inside",
            color: "#000"
          }
        },
        itemStyle: {
          normal: {
            color: "#fff",
            borderColor: "#666"
          }
        },
        tooltip: {
          formatter: this.formatToolTip
        }
      };
    } );

    if ( storedNum > 0 ) {
      stockList.push( {
        value: storedNum,
        itemStyle: {
          normal: {
            color: "#666",
            borderColor: "#fff"
          }
        },
        tooltip: {
          formatter: obj => {
            return `已入库数${obj.value}个 `;
          }
        },
        label: {
          normal: {
            show: true,
            position: "inside",
            formatter: obj => {
              return `已入库数${obj.value}个`;
            }
          }
        }
      } );
    }
    if ( lockedNum > 0 ) {
      stockList.push( {
        value: lockedNum,
        itemStyle: {
          normal: {
            color: "#666",
            borderColor: "#fff"
          }
        },
        tooltip: {
          formatter: obj => {
            return `实际库存${obj.value}个 <br/> （已锁定）`;
          }
        },
        label: {
          normal: {
            show: true,
            position: "inside",
            formatter: obj => {
              return `实际库存${obj.value}个（已锁定）`;
            }
          }
        }
      } );
    }

    if ( stockNum > 0 ) {
      stockList.push( {
        value: stockNum,
        itemStyle: {
          normal: {
            color: "#666",
            borderColor: "#fff"
          }
        },
        tooltip: {
          formatter: obj => {
            return `实际库存${obj.value}个 <br/> （可销售）`;
          }
        },
        label: {
          normal: {
            show: true,
            position: "inside",
            formatter: obj => {
              return `实际库存${obj.value}个（可销售）`;
            }
          }
        }
      } );
    }

    return [ ...stockList, ...supplyList ];
  }

  formatToolTip ( data ) {
    let obj = data.data || {};
    if ( obj.id ) {
      return `${obj.metaTypeName}${obj.id}&nbsp;订购${data.value}个 <br/> ${obj.deliveryDate}交付 <br/> ${obj.riskLevelName}`;
    } else if ( data.data.procurementSn ) {
      return `采购单${obj.procurementSn}&nbsp;采购${data.value}个 <br/> 预计 ${obj.deliveryDate} 到库`;
    }
  }

  formatRiskLevel ( value ) {
    return matchArrItem( value, riskLevels, "id" ).name;
  }

  formatMetaType ( value ) {
    return matchArrItem( value, metaTypes, "id" ).name;
  }

  formatState ( value ) {
    return matchArrItem( value, supplyStates, "id" ).name;
  }
}
</script>


<style lang="stylus" scoped>
.echart-wrap
  margin-left 50%
  transform translateX(-50%)
.success-risk
  color #20a0ff
.danger-risk
  color #ff4949
</style>

