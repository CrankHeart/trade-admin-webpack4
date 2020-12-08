<template>
  <div class="refill-directly-sku">
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <template v-for="item in tableData">
      <p :key="item.id" class="list-header">
        {{formatMyDate(item.orderDate,'yyyy-MM-dd')}}&nbsp;&nbsp;&nbsp;&nbsp;订单号：{{item.orderSn}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;客户名称：{{item.memberOrder && item.memberOrder.memberName }}
        <el-button
          v-if="$permissionValidateWithEnv(1151, 1149)"
          class="pull-right"
          type="primary"
          size="small"
          @click="createDirectlyProcurement(item)"
        >转直发采购单</el-button>
      </p>
      <lc-table
        :scroll-options="{offset: -550}"
        :config="config"
        :data="item.deliveryDetails"
        :key="item.id"
        :has-page="false"
        :selection="true"
        @data-selection-change="selectionChange"
        @click.native="getOrderSn(item.orderSn)"
      >
        <template slot-scope="scope">
          <template v-if="scope.con.prop=='control'"></template>
          <template v-else-if="scope.con.prop === 'supplierName'">
            <span class="pointer" @click="showSupplierDialog(scope.$index)">
              <a
                v-if="scope.row.supplierName && scope.row.supplierName.length > 0"
              >{{scope.row.supplierName}}</a>
              <el-button type="primary" size="mini" v-else>选择供应商</el-button>
            </span>
          </template>
          <template v-else-if="scope.con.prop=='skuName'">
            <p>{{scope.row[scope.con.prop]}}</p>
            <!-- <p>{{scope.row.specification}}</p> -->
          </template>
          <template
            v-else-if="scope.con.prop == 'goodsLabel'"
          >{{formatGoodsLabel(scope.row.goodsLabel)}}</template>
          <template v-else>{{scope.row[scope.con.prop]}}</template>
        </template>
      </lc-table>
    </template>
    <el-pagination
      @current-change="curChange"
      class="center"
      :page-size="page.num"
      :current-page.sync="page.cur"
      layout="total, prev, pager, next, sizes"
      :total="page.total"
      @size-change="sizeChange"
      :page-sizes="page.sizes"
    />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Inject, Prop, Watch } from "vue-property-decorator";
import { Getter, State, Mutation, Action } from "vuex-class";
import lcCondition from "../../../components/condition.vue";
import lcTable from "../../../components/table/index";
import API from "../../../API";
import refillGoods from "../mixins/refillGoods";
import { goodsLabel, deliveryTableConfig } from "../const";
import procurementSupplier from "./procurementSupplier.vue";
import tablePage from "../public/tablePage";

@Component( {
  name: "refill-directly-sku",
  components: {
    lcTable,
    lcCondition,
    procurementSupplier,
  },
  mixins: [ refillGoods, tablePage ],
} )
export default class DirectlyProcurement extends Vue {
  @Mutation( "procurement/setDirectlySkuMap" ) setDirectlySkuMap;
  @Mutation( "procurement/setDirectlyDeliverySn" ) setDirectlyDeliverySn;
  @Mutation( "procurement/setMemberOrder" ) setMemberOrder;
  @State( ( state ) => state.procurement.directlySelectedSkuList )
  directlySelectedSkuList;
  @Mutation( "procurement/setDirectlySelectedSkuList" )
  setDirectlySelectedSkuList;
  // @Getter( 'procurement/directlySkuList' ) directlySkuList
  @Mutation( "procurement/clearDirectlySelectedSkuList" )
  clearDirectlySelectedSkuList;
  @Inject() formatMyDate;

  tableData: any = [];
  searchCondition: any = {};
  config = deliveryTableConfig;

  condition = [
    { value: "", key: "orderSn", label: "订单号", type: "text" },
    { value: undefined, key: "lcSkuCode", label: "lc编码", type: "text" },
    { value: undefined, key: "skuName", label: "名称", type: "text" },
  ];

  created () {
    this.search();
  }
  curTableSn = "";
  directlySelectedSkuListObj: any = {};
  getOrderSn ( sn ) {
    this.curTableSn = sn;
  }
  formatGoodsLabel ( label ) {
    return goodsLabel.get( label );
  }

  formatOptions () {
    let searchCondition: any = {};
    this.condition.forEach( ( v ) => {
      if ( v.value !== "" ) {
        searchCondition[ v.key ] = v.value;
      }
    } );
    let o = {
      ...searchCondition,
      num: this.page.num,
      start: ( this.page.cur - 1 ) * this.page.num,
      wantSlipsState: 0,
      deliveryType: 1,
    };
    return o;
  }

  search () {
    this.$http( API.selectDeliveryOrder, this.formatOptions() ).then(
      ( { data } ) => {
        let d = data.data || {};
        let list = d.list || [];
        this.tableData = list.filter( ( val ) => !val.wantSlipsState );
        this.tableData.forEach( ( v ) => {
          v.deliveryDetails.forEach( ( detail ) => {
            this.$set( detail, "number", detail.skuNum );
            this.$delete( detail, "skuNum" );
          } );
        } );

        this.page.total = d.total;
      }
    );
  }
  curChange ( v ) {
    this.page.cur = v;
    this.search();
  }
  createDirectlyProcurement ( item ) {
    console.log( 'item--->', item )
    if ( !( item.orderSn in this.directlySelectedSkuListObj ) ) {
      this.$notify( {
        type: "error",
        message: "未选择！",
      } );
      return;
    }
    let details = this.directlySelectedSkuListObj[ item.orderSn ];
    // let details = item.deliveryDetails
    this.formatProcurementMsg( item.memberOrder );
    if ( details.length > 0 ) {
      details.forEach( ( v ) => {
        this.setDirectlySkuMap( v );
      } );
      this.setDirectlyDeliverySn( [ item.deliverySn ] );
      console.log( '直发订单信息', [ item.deliverySn ] )
      // 转直发采购单
      this.$router.push( "/procurement/directlyProcurement" );
      // this.$emit( 'complete' )
    } else {
      this.$notify( {
        type: "warning",
        message: "采购单中商品数量不可为空",
      } );
    }
  }
  formatProcurementMsg ( msg ) {
    this.setMemberOrder( msg );
  }
  selectionChange ( v ) {
    this.directlySelectedSkuListObj[ this.curTableSn ] = v;
    this.setDirectlySelectedSkuList( v );
  }
}
</script>
<style lang="stylus" scoped>
.want-slip
  padding-bottom 80px
.list-header
  background #fafafa
  border 1px solid #eeeeee
  line-height 30px
  margin-top 20px
  padding 5px 20px
.table-with-page + P
  margin-top 20px
.sticky-bottom
  position fixed
  bottom 0
  right 0
  height 28px
  padding 16px
  background #fff
  z-index 99
  box-shadow 0 -1px 5px rgba(0, 0, 0, 0.2)
p + p
  font-size 12px
a
  cursor pointer
</style>


