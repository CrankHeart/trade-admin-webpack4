<template>
  <!-- 售后信息  afterSale serviceType=1 服务单类型（1-退货，2-换货，3-退款） -->
  <div>
    <!-- activeNames:{{ activeNames }}
    orderSn{{orderSn}} ------- params{{params}} ----memberId：{{memberId}}-->
    <el-collapse v-model="activeNames" @change="handleChange">
      <!-- ReturnRecords -->
      <el-collapse-item title="退货记录" name="1" v-if="tableData1.length">
        <template slot="title">
          <span style="line-height: 36px;">退货记录</span>
          <el-button
            type="primary"
            size="small"
            class="marginLeft20"
            @click.stop.prevent="refresh(1)"
          >刷新</el-button>
        </template>
        <ReturnRecords :data="tableData1"></ReturnRecords>
      </el-collapse-item>
      <!-- ExchangeRecord -->
      <el-collapse-item title="换货记录" name="2" v-if="tableData2.length">
        <template slot="title">
          <span style="line-height: 36px;">换货记录</span>
          <el-button
            type="primary"
            size="small"
            class="marginLeft20"
            @click.stop.prevent="refresh(2)"
          >刷新</el-button>
        </template>
        <ExchangeRecord :data="tableData2"></ExchangeRecord>
      </el-collapse-item>
      <!-- RefundRecords -->
      <el-collapse-item title="退款记录" name="3" v-if="tableData3.length">
        <template slot="title">
          <span style="line-height: 36px;">退款记录</span>
          <el-button
            type="primary"
            size="small"
            class="marginLeft20"
            @click.stop.prevent="refresh(3)"
          >刷新</el-button>
        </template>
        <RefundRecords :data="tableData3"></RefundRecords>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Inject, Prop } from "vue-property-decorator";

// import API from "@/API";

// serviceType=1 服务单类型（1-退货，2-换货，3-退款）
// 退货记录 serviceType=1 
import ReturnRecords from "./ReturnRecords.vue";
// 换货记录 serviceType=2 
import ExchangeRecord from "./ExchangeRecord.vue";
// 退款记录 serviceType=3 
import RefundRecords from "./RefundRecords.vue";

import { serviceType } from "./status";

// 售后信息
@Component( {
  name: "AfterSale",
  components: { ReturnRecords, ExchangeRecord, RefundRecords, },
} )

export default class AfterSale extends Vue {
  // 主要是获取父组件传入的参数
  @Inject() params: any;
  @Prop( { type: [ String, Number ], default: "" } ) orderSn: string | number;
  @Prop( { type: String, default: "" } ) memberId: string;

  activeNames: Array<string> = [ "1", "2", "3" ];
  // tableData: Array<Object> = [ {} ];
  tableData1: any = [];
  tableData2: any = [];
  tableData3: any = [];

  mounted () {
    // console.log( "Inject mounted xxx", this.orderSn );za
    console.log( "AfterSale.vue mounted :", { ...this.params } );
    this.init();
  }

  init () {
    serviceType.forEach( ( { id } ) => this.search( id ) );
    // this.search( 1 );
  }

  handleChange ( ...args ) {
    console.log( ...args );
  }

  refresh ( serviceType ) {
    // 1/2/3
    this.search( serviceType );
  }

  search ( serviceType ) {

    const url = "/serviceOrderController/getServiceOrders";
    let reqParams = { ...this.params, serviceType, memberId: this.memberId };

    ( this as any ).$http( url, reqParams ).then(
      ( { data } ) => {
        data = data.data;
        const { total, serviceOrderList } = data;
        this[ `tableData${serviceType}` ] = serviceOrderList || [];
        console.log( "xxxxxx data:", serviceType, total, this[ `tableData${serviceType}` ] );
      },
      ( rej ) => {
        // 失败
      }
    );
  }
}
</script>
