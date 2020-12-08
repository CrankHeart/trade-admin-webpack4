<template>
  <div class="distribution-rule-detail">
    <lc-condition :condition="condition" @submit="search" labelWidth="160px">
      <template class="setInOutBtn" slot="btn">
        <el-button
          type="primary"
          @click="synchronization"
          v-if="$permissionValidateWithEnv(1277, 1268)"
        >同步品牌数据</el-button>
        <el-button
          type="primary"
          @click="exportExcel"
          v-if="$permissionValidateWithEnv(1276, 1267)"
        >导出</el-button>
        <el-button
          type="primary"
          @click="importExcel"
          v-if="$permissionValidateWithEnv(1275, 1266)"
        >导入</el-button>
      </template>
    </lc-condition>

    <lc-table
      :scroll-options="{offset: -350}"
      :config="ruleConfig"
      :data="tableList"
      :page="page"
      @cur-change="curChange"
      @size-change="sizeChange"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop === 'option'">
          <el-button
            v-if="$permissionValidateWithEnv(1278, 1269)"
            type="info"
            @click="editBuyer(row)"
            size="small"
          >编辑</el-button>
        </template>
        <template v-else>
          <span>{{ row[con.prop] }}</span>
        </template>
      </template>
    </lc-table>

    <select-buyer-dialog
      v-model="visibleEditBuyer"
      :row="currRow"
      :list="buyerList"
      @editSucess="search"
    ></select-buyer-dialog>

    <!-- 文件上传弹框 -->
    <FileImport
      v-if="showFileImport"
      :showFileImport.sync="showFileImport"
      v-bind="uploadOptions"
      @refresh="uploadFileSuccess"
    ></FileImport>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component } from "vue-property-decorator";
import { State } from "vuex-class";
import lcTable from "../../../components/table/";
import lcCondition from "../../../components/condition.vue";
import selectBuyerDialog from "./selectBuyerDialog.vue";
import API from "../../../API";
import tablePage from "../public/tablePage";
// 文件上传组件
import FileImport from "./fileImport/index";
@Component( {
  name: "distribution-rule-detail",
  mixins: [ tablePage ],
  components: {
    lcTable,
    lcCondition,
    selectBuyerDialog,
    FileImport
  }
} )
export default class distributionRuleDetail extends Vue {
  @State( state => state.login.token ) accessToken;
  @State( state => state.login.memberId ) memberId;

  tableList: any[] = [];
  visibleEditBuyer: boolean = false;
  currRow: object = {};
  buyerList: object[] = [ {} ];

  ruleConfig: object[] = [
    {
      label: "品牌名称",
      prop: "name"
    },
    {
      label: "拼音",
      prop: "pinyin"
    },
    {
      label: "采购负责人",
      prop: "buyerName"
    },
    {
      label: "操作",
      prop: "option",
      width: "100px"
    }
  ];
  condition: object[] = [
    {
      value: [],
      key: "brandId",
      label: "品牌名称",
      type: "select",
      multiple: true,
      options: []
    },
    {
      value: '',
      key: "buyer",
      label: "采购负责人",
      type: "select",
      options: []
    },
    {
      value: '',
      key: "isExitBuyer",
      label: "是否维护采购负责人",
      type: "select",
      options: [
        {
          id: 1,
          name: "是"
        },
        {
          id: 0,
          name: "否"
        }
      ]
    }
  ];
  showFileImport: boolean = false;
  // 文件类型
  fileTypes: Array<string> = [ "xlsx", "xls", "csv" ];
  uploadOptions: any = {
    title: "采购分配规则导入",
    fileTypes: this.fileTypes,
    placeholder: `请选择${this.fileTypes.join( "," )}文件进行上传`,
    tips: `务必使用下载的模板进行数据导入，一次最多导入6000条。`,
    uploadUrl: API.importBrandBuyer,
    downUrl: "/excel/module/brandbuyer",
    params: { memberId: "" },
    // 表格字段
    tableConfig: [
      {
        label: "品牌",
        prop: "name"
      },
      {
        label: "采购员",
        prop: "buyerName"
      },
      {
        label: "失败结果",
        prop: "remark"
      }
    ]
  };

  created () {
    this.$http( API.getBrandBuyerList ).then( ( { data } ) => {
      this.condition[ 0 ].options = data.data.map( ( { brandId, name } ) => ( {
        id: brandId,
        name
      } ) );
    } );
    this.getAllBuyers();
    this.search();
  }

  getAllBuyers () {
    this.$http( API.getAllBuyers ).then( ( { data } ) => {
      let d = data.data.map( v => {
        return {
          name: v.loginName,
          id: v.id
        };
      } );
      this.buyerList = d;
      let item = this.condition.find( item => item.key == "buyer" );
      item.options = d;
    } );
  }

  search () {
    this.$permissionValidateWithNotifyEnv( 1163, 1159 );
    let param = this.formatParam();
    this.$http( API.getRulesList, param ).then( ( { data } ) => {
      data = data.data || {};
      this.page.total = data.total;
      this.tableList = data.list;
      return data.list;
    } );
  }

  formatParam () {
    let { num, cur } = this.page;
    let param: any = {
      start: ( cur - 1 ) * num,
      num: num
    };
    this.condition.forEach( con => {
      if ( con.key === "brandId" ) {
        if ( con.value.length > 0 ) {
          param[ `${con.key}s` ] = con.value;
        }
      } else if ( con.value !== undefined && con.value !== "" ) {
        param[ con.key ] = con.value;
      }
    } );

    return param;
  }

  exportExcel () {
    let param = this.formatParam();
    delete param.num;
    delete param.start;
    this.$submitFile( API.exportBrandBuyer, {
      ...param,
      memberId: this.memberId,
      accessToken: this.accessToken
    }, '品牌采购负责人' );
  }

  synchronization () {
    this.$message( "同步品牌数据所属等待时间较久，请耐心等待" );
    this.$http( API.synchronization ).then( res => {
      this.$message( res.data.msg );
    } );
  }

  editBuyer ( row ) {
    this.visibleEditBuyer = true;
    this.currRow = row;
  }

  importExcel () {
    this.showFileImport = true;
    this.uploadOptions.params = {
      memberId: this.memberId
    };
  }

  uploadFileSuccess ( data ) {
    this.search();
  }
}
</script>
<style lang="stylus" scoped>
.distribution-rule-detail
  margin-bottom 80px
</style>