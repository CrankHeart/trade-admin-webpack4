<template>
  <el-dialog
    class="procurement-supplier"
    :title="dialogTitle"
    :before-close="beforeCloseDialog"
    :visible.sync="dialogVisible"
    size="large"
  >
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table
      :scroll-options="scrollOptions"
      :config="tableConfig"
      :data="supplierList"
      :page="page"
      :key="tableConfig.length"
      @cur-change="curChange"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop == 'control'">
          <span v-if="scope.row.isSelectedSupplier === true " class="disabled-text">已选</span>
          <a v-else @click="changeSupplier( scope.$index )" class="pointer">选中</a>
        </template>
        <template v-else-if="scope.con.prop == 'supplierName'">
          {{scope.row.supplierName}}
          <span class="greenText" v-if="scope.row.preferred">（首选）</span>
        </template>
        <template v-else-if="scope.con.prop == 'deliveryDate'">
          <span
            v-if="!scope.row.noRelation"
          >最长：{{scope.row.longestPeriod}}天 &nbsp;&nbsp;&nbsp;&nbsp; 最短：{{scope.row.shortestPeriod}}天</span>
        </template>
        <template v-else-if="scope.con.prop=='supplierType'">
          <span
            :class="{redColor: scope.row.noRelation }"
          >{{formatSupplierType(scope.row.supplierType)}}</span>
        </template>
        <template
          v-else-if="scope.con.prop==='purchaseRelation'"
        >{{scope.row[ scope.con.prop ] == 1?'有':'无'}}</template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>

    <span slot="footer" class="dialog-footer">
      <el-button @click="beforeCloseDialog">取 消</el-button>
      <el-button type="primary" @click="finish">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Watch, Prop, Inject } from "vue-property-decorator";
import { State, Action, Getter, Mutation } from "vuex-class";
import lcTable from "../../../components/table/";
import { supplierConfig, supplierType } from "../const";
import API from "../../../API";
import lcCondition from "../../../components/condition.vue";

@Component( {
  name: "procurement-supplier",
  components: {
    lcTable,
    lcCondition,
  },
} )
export default class procurementSupplier extends Vue {
  @Prop() lcSkuCode: string;
  @Prop() currSupplier: string;
  @Prop() value: boolean;
  @State( ( state ) => state.procurement.skuSupplierRelation ) skuSupplierRelation;
  @Mutation( "procurement/setSkuSupplierRelation" ) setSkuSupplierRelation;
  @Action( "supplier/getAllSuppliers" ) getAllSuppliers;

  supplierList: any[] = [];
  tableConfig = supplierConfig;
  currSelectedSupplier: string = "";
  selectedSupplier: any = {};
  page: any = {
    num: 10,
    cur: 1,
    total: 0,
  };
  localSupplierRelation: any = {};

  scrollOptions: any = {
    offset: 0,
    container: ".procurement-supplier",
  };
  condition: any[] = [
    {
      value: "",
      key: "supplierName",
      label: "供应商",
      type: "select",
      options: [],
    },
    {
      value: "",
      key: "priority",
      label: "优先",
      type: "radio",
      options: [
        { id: "1", name: "价格优先" },
        { id: "2", name: "交期优先" },
      ],
    },
  ];

  get dialogTitle () {
    let code = this.lcSkuCode;
    return "切换供应商 - " + code;
  }

  get dialogVisible () {
    return this.value;
  }

  set dialogVisible ( v ) {
    this.value = v;
    this.$emit( "input", v );
  }

  @Watch( "dialogVisible" )
  dialogVisibleWatcher ( v ) {
    if ( v ) {
      this.currSelectedSupplier = this.currSupplier;
      this.search();
    } else {
      this.page.cur = 1;
      this.page.total = 0;
    }
  }

  created () {
    this.getAllSuppliers().then( ( res ) => {
      let supplierOption: any = this.condition[ 0 ];
      supplierOption.options = res.map( ( item ) => {
        let { name } = item;
        return {
          id: name,
          name,
        };
      } );
    } );
  }
  formatSupplierType ( type ) {
    let typeName = "";
    supplierType.some( ( { id, name } ) => {
      let value = type === id;
      if ( value ) typeName = name;
      return value;
    } );
    return typeName;
  }

  changeSupplier ( index ) {
    let supplier = this.supplierList[ index ];
    this.selectedSupplier = supplier;
    this.currSelectedSupplier = supplier.supplierName;
    this.supplierList.forEach( ( v ) => Vue.set( v, "isSelectedSupplier", false ) );
    Vue.set( supplier, "isSelectedSupplier", true );
  }

  beforeCloseDialog () {
    this.$emit( "finish" );
  }

  finish () {
    let { supplierName } = this.selectedSupplier;
    if ( supplierName && supplierName.length > 0 ) {
      this.setSkuSupplierRelation( { lcSkuCode: this.lcSkuCode, supplierName } );
    }
    this.$emit( "finish", supplierName, this.selectedSupplier );
  }

  curChange ( cur ) {
    this.page.cur = cur;
    this.search();
  }
  search () {
    // 查询结果要遍历，加入字段： isSelectedSupplier， noRelation
    this.$http( API.supplierForSku, this.formatParam() ).then( ( { data } ) => {
      let rt = data.data;
      rt.list.forEach( ( v ) => {
        if ( v.supplierName === this.currSelectedSupplier ) {
          v.isSelectedSupplier = true;
        }
        if ( v.supplierType === 50 ) {
          v.noRelation = true;
        }
      } );
      this.supplierList = rt.list;
      this.page.total = rt.total;
    } );
  }

  formatParam () {
    let { num, cur } = this.page;
    let param: any = {
      start: ( cur - 1 ) * num,
      num,
      lcSkuCode: this.lcSkuCode,
    };
    this.condition.forEach( ( con ) => {
      if ( con.value && con.value.length > 0 ) {
        param[ con.key ] = con.value;
      }
    } );
    return param;
  }
}
</script>
<style lang="stylus" >
.procurement-supplier
  .disabled-text
    color #ccc
  .pointer
    cursor pointer
  .input-width
    width 300px
  .redColor
    color red
  .greenText
    color #67c23a
</style>

<style lang="stylus">
.procurement-supplier
  .el-dialog--large
    width 70%
</style>

