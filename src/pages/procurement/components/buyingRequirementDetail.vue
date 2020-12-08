<template>
  <div class="buying-requirement-detail">
    <lc-condition :condition="condition" @submit="search">
      <template class="setInOutBtn" slot="btn">
        <el-button
          v-if="$permissionValidateWithEnv(1158, 1154)"
          type="primary"
          @click="exportExcel"
        >导出到Excel</el-button>
      </template>
    </lc-condition>
    <lc-table-config
      :base-config="procurementBuyingRequirementConfig"
      @set-config="setProcurementBuyingRequirementConf"
    ></lc-table-config>
    <lc-table
      ref="skuTable"
      class="table-margin"
      :scroll-options="{offset: -350}"
      :config="baseConfig"
      :data="tableList"
      :page="page"
      :key="baseConfig.length"
      selection
      @data-selection-change="selectionChange"
      @cur-change="curChange"
      @size-change="sizeChange"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop=='control'">
          <el-button
            v-if="scope.row.isAdded"
            size="mini"
            type="danger"
            @click="delRefillSkuListItem(scope.row)"
          >移除</el-button>
          <el-button v-else size="mini" type="primary" @click="addRefillSkuListItem(scope.row)">添加</el-button>
        </template>
        <template v-else-if="scope.con.prop==='riskLevel'">
          <span
            class="success-risk"
            :class="{'danger-risk': scope.row[scope.con.prop] <= 2  }"
          >{{ formatRiskLevel( scope.row[scope.con.prop] )}}</span>
        </template>
        <template v-else-if="scope.con.prop==='riskDeatil'">
          <el-button size="mini" type="primary" @click="showRiskStatus(scope.row)">查看交付详情</el-button>
        </template>
        <template
          v-else-if="scope.con.prop=='goodLabel'"
        >{{formatLabel( scope.row[ scope.con.prop ] )}}</template>
        <template
          v-else-if="scope.con.prop === 'recentDate' "
        >{{ formatDate( scope.row[ scope.con.prop ] )}}</template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <risk-status
      v-if="visibleRiskStatus"
      v-model="visibleRiskStatus"
      :sku-id="currRiskLevleSkuId"
      :lc-sku-code="currRiskLevelLcSkuCode"
    ></risk-status>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch, Inject } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import lcTable from "../../../components/table/";
import lcTableConfig from "../../../components/table/control.vue";
import lcCondition from "../../../components/condition.vue";
import API from "../../../API";
import { salesStatus, goodsLabel, riskLevels } from "../const";
import refillGoods from "../mixins/refillGoods";
import { goodLabels } from "../../product/const";
import { matchArrItem } from "../../../utils/";
import riskStatus from "./riskStatus.vue";
import tablePage from "../public/tablePage";

@Component( {
  name: "buying-requirement-detail",
  components: {
    lcTable,
    lcTableConfig,
    lcCondition,
    riskStatus,
  },
  mixins: [ refillGoods, tablePage ],
} )
export default class buyingRequirementDetail extends Vue {
  @State( ( state ) => state.procurement.buyingRequirementSelectedSkuList )
  buyingRequirementSelectedSkuList;
  @State( ( state ) => state.login.token ) accessToken;
  @State( ( state ) => state.login.memberId ) memberId;
  @Getter( "procurement/procurementBuyingRequirementConfig" )
  procurementBuyingRequirementConfig;
  @Mutation( "procurement/setBuyingRequirementSelectedSkuList" )
  setBuyingRequirementSelectedSkuList;
  @Mutation( "procurement/addBuyingRequirementSkuList" )
  addBuyingRequirementSkuList;
  @Mutation( "procurement/delBuyingRequirementSkuList" )
  delBuyingRequirementSkuList;

  @Mutation( "procurement/delSkuSupplierRelation" ) delSkuSupplierRelation;
  @Mutation( "procurement/setProcurementBuyingRequirementConf" )
  setProcurementBuyingRequirementConf;
  @Action( "brand/getAllBrands" ) getAllBrands;
  @Action( "supplier/getAllSuppliers" ) getAllSuppliers;
  @State( ( state ) => state.procurement.skuSupplierRelation ) skuSupplierRelation;
  @Inject() formatMyDate;
  visibleRiskStatus: boolean = false;
  currRiskLevleSkuId: string = "";
  currRiskLevelLcSkuCode: string = "";
  tableList: any[] = [];
  condition: any[] = [
    {
      value: [],
      key: "brandId",
      label: "品牌",
      type: "select",
      multiple: true,
      options: [],
    },
    { value: undefined, key: "lcSkuCode", label: "lc编码", type: "text" },
    { value: undefined, key: "name", label: "名称", type: "text" },
    { value: undefined, key: "specification", label: "规格", type: "text" },
    { value: undefined, key: "storeSkuCode", label: "自有编码", type: "text" },
    {
      value: undefined,
      key: "goodLabel",
      label: "商品标签",
      type: "radio",
      options: goodLabels,
    },
    {
      value: [],
      key: "type",
      label: "",
      type: "checkbox",
      col: { lg: 24, sm: 24 },
      valueType: "array",
      options: [
        { id: "missionNeedingQuery", name: "仅显示有需求缺口的记录" },
        { id: "missionLackingQuery", name: "仅显示有任务缺口的记录" },
        { id: "payNotEnough", name: "仅显示交付不足风险" },
        { id: "payDelay", name: "仅显示交付延期风险" },
        { id: "payNotRisk", name: "仅显示无交付风险" },
      ],
    },
  ];

  get baseConfig () {
    this.procurementBuyingRequirementConfig.forEach( element => {
      element.isChecked = true
    } );
    let conf =
      this.procurementBuyingRequirementConfig.filter( ( v ) => v.isChecked ) || [];
    console.log( "conf====>", conf );
    return conf;
  }

  formatLabel ( goodLabel ) {
    return matchArrItem( goodLabel, goodLabels, "id" ).name;
  }

  showRiskStatus ( row ) {
    this.currRiskLevleSkuId = row.skuId + "";
    this.currRiskLevelLcSkuCode = row.lcSkuCode;
    this.visibleRiskStatus = true;
  }

  formatRiskLevel ( level ) {
    return matchArrItem( level, riskLevels, "id" ).name;
  }

  @Watch( "buyingRequirementSelectedSkuList" )
  clearTableSelection ( newVal, oldVal ) {
    if ( newVal.length === 0 ) {
      let skuTable: any = this.$refs.skuTable;
      skuTable.clearSelection();
    }
  }

  created () {
    Promise.resolve( this.getAllBrands() ).then( ( res ) => {
      this.condition[ 0 ].options = res.map( ( { id, name } ) => ( { id, name } ) );
    } );
    this.search();
  }

  curChange ( cur ) {
    this.page.cur = cur;
    this.search();
  }

  formatDate ( date ) {
    return this.formatMyDate( date && date.time, "yyyy-MM-dd" );
  }

  search () {
    this.$permissionValidateWithNotifyEnv( 1163, 1159 );
    let param = this.formatParam();
    Promise.all( [
      this.$http( API.getSupplySku, param ).then( ( { data } ) => {
        data = data.data || {};
        this.page.total = data.total;
        this.tableList = data.list;
        return data.list;
      } ),
      this.getAllSuppliers(),
    ] ).then( ( [ data1, data2 ] ) => {
      this.tableList.forEach( ( item ) => {
        let { supplierId, lcSkuCode, lackingNum, deliveryDate } = item;

        item.supplyNum = lackingNum;
        item.deliveryDate = this.formatDate( deliveryDate );
      } );
      this.setSkuIsAdded();
    } );
  }

  formatParam () {
    let { num, cur } = this.page;
    let param: any = {
      start: ( cur - 1 ) * num,
      num: num,
    };
    this.condition.forEach( ( con ) => {
      if ( con.key === "brandId" ) {
        if ( con.value.length > 0 ) {
          param[ `${con.key}s` ] = con.value;
        }
      } else if ( con.key === "type" ) {
        let { value, options } = con;
        options.forEach( ( v ) => {
          param[ v.id ] = +!( value.indexOf( v.id ) > -1 ); // 0 为选中， 1 为未选中
        } );
      } else if ( con.value !== undefined && con.value !== "" ) {
        param[ con.key ] = con.value;
      }
    } );

    return param;
  }

  addRefillSkuListItem ( v ) {
    if ( !v.isAdded ) {
      v.isAdded = true;
      this.addBuyingRequirementSkuList( { result: v, isFormat: true } );
      this.$notify( {
        type: "success",
        message: "添加成功",
      } );
    }
  }
  delRefillSkuListItem ( v, nonConfirm?: boolean ) {
    if ( nonConfirm === true ) {
      v.isAdded = false;
      this.delBuyingRequirementSkuList( v.lcSkuCode );
    } else {
      this.$confirm( "确定删除该商品吗", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      } ).then( () => {
        v.isAdded = false;
        this.delBuyingRequirementSkuList( v.lcSkuCode );
      } );
    }
  }

  exportExcel () {
    let param = this.formatParam();
    delete param.num;
    delete param.start;
    // TODO 采购需求导出
    this.$submit( API.exportSupplySku, {
      ...param,
      memberId: this.memberId,
      accessToken: this.accessToken,
    } );
  }

  selectionChange ( v ) {
    this.setBuyingRequirementSelectedSkuList( v );
  }
}
</script>
<style lang="stylus" scoped>
.buying-requirement-detail
  margin-bottom 80px
.success-risk
  color #20a0ff
.danger-risk
  color #ff4949
</style>




