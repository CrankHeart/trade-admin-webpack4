<template>
  <div id="data-office">
    <lc-title text="企业数据[旧]">
      <!-- <el-button type="primary" size="small" class="pull-right" @click="exportCityCustomerDate">企业采购-城市客户进展导出</el-button> -->
    </lc-title>
    <div class="box">
      <h3 class="relative">
        企业惰性排行
        <tool-tips :has-view="false" :tips-html="tipsHtml"></tool-tips>
      </h3>
      <br />
      <table-view :config="config" :data="data">
        <template slot-scope="scope">
          <template v-if="scope.con.prop=='label'">
            <el-button
              v-for="item in scope.row[scope.con.prop].split(';')"
              size="small"
              type="primary"
              v-if="item"
              :key="item"
            >{{item}}</el-button>
          </template>
          <template v-else>{{scope.row[scope.con.prop]}}</template>
        </template>
      </table-view>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Inject } from "vue-property-decorator"
import lcTitle from "../../components/title.vue"
import toolTips from "./components/toolTips.vue"
import tableView from "./components/tableView.vue"
import API from "../../API"
@Component( {
  name: "data-tenant",
  components: {
    lcTitle,
    toolTips,
    tableView
  }
} )
export default class DataTenant extends Vue {

  tipsHtml: string = `企业惰性指企业上次成交至今，间隔时间越久排名越高，<br/> 用以发现沉睡客户。（仅包含有交易记录的企业）`
  config = [
    { prop: "index", label: "排名", width: "90" },
    { prop: "tenantName", label: "名称" },
    { prop: "createDate", label: "上次交易时间", sortable: !!1 },
    { prop: "region", label: "区域" },
    { prop: "label", label: "标签" }
  ]
  data = []

  @Inject() formatMyDate

  activated () {
    this.getData()
  }
  getData () {
    this.$http( API.getCompanyLazyRank, {
      sort: 1
    } ).then(
      ( { data } ) => {
        this.data = data.data || []
      },
      rej => {
        this.data = []
      }
    )
  }

  // exportCityCustomerDate () {
  //   this.$submit( API.exportCityCustomerDate )
  // }
}
</script>
