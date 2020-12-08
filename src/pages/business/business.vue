<template>
  <div id="server-check-order-list">
    <lc-title text="商家列表">
      <el-button
        style="float:right"
        type="primary"
        @click="businessDetailDialogShow = true"
        v-if="$permissionValidate(517)"
      >新增商家</el-button>
    </lc-title>
    <lc-condition :condition="condition" @submit="search" label-width="100px"></lc-condition>
    <lc-table
      :config="config"
      :data="data"
      @cur-change="curChange"
      :page="page"
      @size-change="sizeChange"
      :key="config.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop === 'control'">
          <el-button
            size="small"
            type="primary"
            @click="$router.push(`/business/detail/${scope.row.id}`)"
            v-if="$permissionValidate(519)"
          >查看</el-button>
          <el-button
            size="small"
            type="primary"
            @click="deleteBusinessDetail(scope.row.id)"
            v-if="$permissionValidate(518)"
          >删除</el-button>
        </template>
        <template
          v-else-if="scope.con.prop === 'isDoBusiness'"
        >{{formatIsBusiness(scope.row[scope.con.prop])}}</template>
        <template
          v-else-if="scope.con.prop === 'companyType'"
        >{{formatCompanyType(scope.row[scope.con.prop])}}</template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
    <business-detail-dialog
      v-if="businessDetailDialogShow"
      v-model="businessDetailDialogShow"
      @change-dialog="businessDialog"
    ></business-detail-dialog>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop, Inject } from "vue-property-decorator";
import lcTitle from "../../components/title.vue";
import lcCondition from "../../components/condition.vue";
import lcTable from "../../components/table/index";
import businessDetailDialog from "./components/businessDetailDialog.vue";
import { isDoBusinesses, companyTypes } from "./const/";
import { matchArrItem } from "../../utils/";
import API from "../../API";

@Component( {
  name: "server-check-order-list",
  components: {
    lcTitle,
    lcCondition,
    lcTable,
    businessDetailDialog,
  },
} )
export default class serverCheckOrderList extends Vue {
  isDoBusinesses = isDoBusinesses;
  condition = [
    { value: "", key: "storeName", label: "商家名称", type: "text" },
    { value: "", key: "contact", label: "联系人姓名", type: "text" },
    {
      value: "",
      key: "isDoBusiness",
      label: "是否营业",
      type: "radio",
      options: isDoBusinesses,
    },
    {
      value: "",
      key: "companyType",
      label: "企业类型",
      type: "select",
      options: companyTypes,
    },
  ];
  config = [
    { prop: "storeIdentifier", label: "商家唯一标识", width: "250px" },
    { prop: "storeName", label: "商家名称" },
    { prop: "companyName", label: "企业名称" },
    { prop: "companyType", label: "企业类型" },
    { prop: "isDoBusiness", label: "是否营业" },
    { prop: "contact", label: "联系人姓名" },
    { prop: "storeMobile", label: "联系人电话" },
    { prop: "address", label: "联系人地址", width: "250px" },
    { prop: "control", label: "操作", width: "150px", fixed: "right" },
  ];
  data = [];
  page: any = {
    cur: 1,
    num: 10,
    total: 0,
    sizes: [ 10, 20, 50 ],
  };

  businessDetailDialogShow: boolean = false;

  activated () {
    this.search();
  }
  sizeChange ( v ) {
    this.page.num = v;
    this.page.cur = 1;
    this.search();
  }

  formatIsBusiness ( id ) {
    return matchArrItem( id, isDoBusinesses, "id" ).name;
  }
  formatCompanyType ( id ) {
    return matchArrItem( id, companyTypes, "id" ).name;
  }

  search ( cur?: number ) {
    this.$permissionValidateWithNotify( 516 );
    this.page.cur = cur || this.page.cur;
    this.dataAdapter();
  }

  deleteBusinessDetail ( id ) {
    this.$confirm( "是否确定删除?", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      center: true,
      closeOnClickModal: false,
    } ).then( () => {
      this.$http( API.updateStoreInfo, { isDeleted: 1, id } ).then(
        ( res ) => {
          this.$message( {
            message: "删除成功",
            type: "success",
          } );
          this.data = this.data.filter( ( v ) => v.id !== id );
        },
        ( rej ) => {
          this.$message( {
            message: rej.msg,
            type: "warning",
          } );
        }
      );
    } );
  }

  dataAdapter () {
    let o: any = {};
    o.start = ( this.page.cur - 1 ) * this.page.num;
    o.num = this.page.num;
    let route: any = {};
    this.condition.forEach( ( val ) => {
      let { key, value } = val;
      route[ key ] = value;
      if ( value !== "" && value !== undefined ) {
        o[ key ] = value;
      }
    } );
    this.$http( API.getStoreList, o ).then( ( { data } ) => {
      this.data = data.data.list;
      this.page.total = data.data.total;
    } );
  }
  businessDialog ( v ) {
    if ( v ) {
      this.data.unshift( v.detail );
    }
    this.businessDetailDialogShow = false;
  }
  curChange ( cur ) {
    this.page.cur = cur;
    this.search();
  }
}
</script>
