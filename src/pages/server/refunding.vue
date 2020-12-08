<template>
  <div id="server-refunding">
    <lc-title v-if="showTitle" text="服务单查询"></lc-title>
    <lc-condition :condition="condition" @submit="search"></lc-condition>
    <lc-table-config :base-config="baseConfig" @set-config="setRefundingConf"></lc-table-config>
    <lc-table
      :config="config"
      :data="data"
      @cur-change="curChange"
      :page="page"
      :key="config.length"
    >
      <template slot-scope="{row,con}">
        <template v-if="con.prop==='orderSn'">
          <div>
            <router-link :to="'/order/search?sn='+row['orderSn']">
              <span style="display:inline-block">{{row.orderSn}}</span>
            </router-link>
            <span v-if="row.deductPoint" class="jd">积</span>
            <span v-if="row.deductCoupon" class="jd">代</span>
          </div>
        </template>
        <template v-else-if="con.prop==='time'">
          <el-tooltip placement="right">
            <div slot="content">
              <template>
                <span v-for="time in times" :key="time.id">
                  <template v-if="row[time.id]">
                    <br v-if="time.id!='applyTime'" />
                    <span class="time">{{time.name}}：</span>
                    {{formatDateToStr(row[time.id])}}
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
        <template v-else-if="con.prop==='serviceStatus'">{{formatStatus(row[con.prop])}}</template>
        <template v-else-if="con.prop==='review'">
          审核人：{{row['reviewName']}}
          <span
            v-if="row['serviceStatus'] !='10'&& row['serviceStatus'] !='20'&& row['serviceStatus'] !='30'"
          >
            <br />审核结果：
            <el-tag
              :type="row['serviceStatus'] =='12'|| row['serviceStatus'] =='22'|| row['serviceStatus'] =='38'?'error':'primary'"
            >{{row['serviceStatus'] =='12'|| row['serviceStatus'] =='22'|| row['serviceStatus'] =='38'?'拒绝':'通过'}}</el-tag>
          </span>
          <span v-if="row['reviewNoPassReason']">
            <br />拒绝理由：
            <el-tooltip
              placement="bottom-start"
              :disabled="row['reviewNoPassReason'].length<20"
              effect="light"
            >
              <div slot="content">{{row['reviewNoPassReason']}}</div>
              <span>
                {{row['reviewNoPassReason'].substr(0,20)}}
                <span
                  v-if="row['reviewNoPassReason'].length>20"
                >...</span>
              </span>
            </el-tooltip>
          </span>
        </template>
        <template v-else-if="con.prop==='skuType'">{{formatSkuType(row[con.prop])}}</template>
        <template
          v-else-if="con.prop==='purchaseProperty'"
        >{{formatPurchaseProperty(row[con.prop])}}</template>

        <template v-else-if="con.prop==='serviceType'">{{formatType(row[con.prop])}}</template>
        <template v-else-if="con.prop==='refundAmount'">{{Number(row[con.prop]).toFixed(2)}}</template>
        <template v-else-if="con.prop==='applyUser'">
          {{applyUsers[row['applyUserId']]}}
          <br />
          联系人：{{row['contact']}}
          <br />
          联系方式：{{row['mobile']}}
        </template>
        <template v-else-if="con.prop==='applyReason'">{{row.dictionaryApplyReasonAndApplyReason}}</template>
        <template v-else-if="con.prop==='logisticId'||con.prop==='exchangeLogisticId'">
          <el-button
            v-if="row[con.prop] && $permissionValidate(1096)"
            type="text"
            @click="logicShow(row[con.prop])"
          >查看物流</el-button>
        </template>

        <template v-else-if="con.prop==='goodsName'">
          名称： {{row[con.prop]}}
          <br />
          <span style="font-size:12px;">
            规格： {{row['goodsSpecification']}}
            <br />
            单位： {{row['unit']}}
          </span>
        </template>
        <template v-else-if="con.prop==='refundGoodsStatus'">{{formatGoodsStatus(row[con.prop])}}</template>
        <!-- 操作   -->
        <!-- TODO 7.15上线需求：http://jira.linkedcare.cn:8000/browse/ET-4434 -->
        <template v-else-if="con.prop==='control'">
          <!-- 通过按钮 弹框 -->
          <RefundingControl
            :item="row"
            :key="row.id"
            v-if="row.mainTrusteeshipFlag!==1"
            @open-refund-application="openRefundDeatilDialog"
            @refresh="refresh"
          ></RefundingControl>
        </template>
        <template v-else>{{row[con.prop]}}</template>
      </template>
    </lc-table>

    <el-dialog class="logistic" v-model="logisticVisible" title="物流信息">
      <el-row>
        <el-col :span="3">快递公司：</el-col>
        <el-col :span="16">{{logistic.companyName || '暂无'}}</el-col>
      </el-row>
      <el-row>
        <el-col :span="3">快递单号：</el-col>
        <el-col :span="16">{{logistic.logisticNo || '暂无'}}</el-col>
      </el-row>
      <template slot="footer">
        <el-button type="primary" @click="logicHide">确定</el-button>
      </template>
    </el-dialog>
    <RefundApplycationDialog
      v-if="isShowRefundApplicationDialog"
      :isShowRefundApplicationDialog.sync="isShowRefundApplicationDialog"
      :curListData="curListData"
    ></RefundApplycationDialog>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop, Inject, Watch } from "vue-property-decorator";
import lcTitle from "../../components/title.vue";
import lcCondition from "../../components/condition.vue";
import lcTableConfig from "../../components/table/control.vue";
import lcTable from "../../components/table/index";
import RefundingControl from "./components/refundingControl.vue";
import { Mutation, Getter, Action } from "vuex-class";
import API from "../../API";
import { getTenantOfficeUserName } from "../../utils/index";
import {
  serviceStatus,
  serviceType,
  serviceStatusObj,
  serviceTypeObj,
  skuTypes,
  purchasePropertys
} from "./const/serverConstant";
import RefundApplycationDialog from "../receivable/components/refundApplycationDialog.vue";
@Component( {
  name: "server-refunding",
  components: {
    lcTitle,
    lcCondition,
    lcTableConfig,
    lcTable,
    RefundingControl,
    RefundApplycationDialog
  }
} )
export default class ServerRefunding extends Vue {
  @Mutation( "server/setRefundingConf" ) setRefundingConf;
  @Getter( "server/refundingConfig" ) baseConfig;
  activated () {
    this.uriToOption();
    this.search();
  }
  get config () {
    return this.baseConfig.filter( v => v.isChecked );
  }
  showTitle: boolean = true;
  condition = [
    { value: undefined, key: "orderSn", label: "订单号", type: "text" },
    { value: undefined, key: "serviceSn", label: "服务单号", type: "text" },
    { value: {}, key: "tenant", label: "集团公司", type: "tenantSearch" },
    { value: {}, key: "customer", label: "客户名称", type: "customerSearch" },
    {
      value: undefined,
      key: "serviceType",
      label: "类型",
      type: "select",
      options: serviceType
    },
    {
      value: undefined,
      key: "serviceStatus",
      label: "状态",
      type: "select",
      options: this.serviceStatus
    },
    { value: undefined, key: 'goodsLcCode', label: 'SKU编码', type: 'text' },
    { value: undefined, key: 'goodsName', label: '商品名称', type: 'text' },
    {
      value: undefined,
      key: "applyTime",
      label: "申请时间",
      type: "daterange"
    },
    // { value: undefined, key: 'customerReturnTime', label: '客户发货时间', type: 'daterange' },
    {
      value: undefined,
      key: "reviewTime",
      label: "审核时间",
      type: "daterange"
    },
    {
      value: undefined,
      key: "refundTime",
      label: "退款时间",
      type: "daterange"
    },
    {
      value: undefined,
      key: "customerReturn",
      label: "完成时间",
      type: "daterange"
    },
    { value: undefined, key: "logisticNo", label: "运单号", type: "text" }
  ];
  @Watch( 'serviceType' )
  computeCondition ( v ) {
    const conditionItem = this.condition.find( item => item.key === 'serviceStatus' )
    if ( v ) {
      conditionItem.value = undefined
    }
    conditionItem.options = this.serviceStatus
  }
  times = [
    { id: "applyTime", name: "申请时间" },
    { id: "reviewTime", name: "审核时间" },
    { id: "customerReturnTime", name: "客户退货时间" },
    { id: "storageReceiptTime", name: "仓库收货时间" },
    { id: "refundTime", name: "退款时间" },
    { id: "exchangeTime", name: "换货重新发货时间" },
    { id: "completeTime", name: "完成时间" }
  ];
  data = [];
  page = {
    cur: 1,
    num: 8,
    total: 0
  };
  logistic: any = {};
  logisticVisible: boolean = false;
  isShowRefundApplicationDialog: boolean = false;
  curListData = {};
  logicShow ( logisticId ) {
    this.logisticVisible = true;
    this.$http( API.getLogisticInfo, { logisticId } )
      .then( ( { data } ) => {
        this.logistic = data.data.logisticInfo;
      } )
      .catch( res => ( this.logistic = {} ) );
  }
  logicHide () {
    this.logisticVisible = false;
    this.logistic = {};
  }
  get serviceType () {
    return this.condition && this.condition.find( item => item.key === 'serviceType' ).value
  }
  get serviceStatus () {
    switch ( +this.serviceType ) {
      case 1:
        return serviceStatus.filter( item => +item.id >= 10 && +item.id < 20 ) || []
      case 2:
        return serviceStatus.filter( item => +item.id >= 20 && +item.id < 30 ) || []
      case 3:
        return serviceStatus.filter( item => +item.id >= 30 && +item.id < 40 ) || []
      default:
        return serviceStatus
    }
  }
  get serviceStatusObj () {
    let o: any = {}
    this.serviceStatus.forEach( status => {
      o[ status.id ] = status.name
    } )
    return o
  }
  formatStatus ( id ) {
    return this.serviceStatusObj[ id ];
  }
  formatType ( id ) {
    return serviceTypeObj[ id ];
  }
  formatGoodsStatus ( status ) {
    switch ( status ) {
      case 0:
        return "正常";
      case 1:
        return "部分残次";
      default:
        return "";
    }
  }

  curChange ( cur ) {
    this.page.cur = cur;
    this.search();
  }
  @Inject() formatMyDate;
  formatDateToStr ( date: any ) {
    let time = date && date.time;
    if ( !time ) return date;
    return this.formatMyDate( new Date( time ) );
  }
  formatLastDate ( item ) {
    let timeArr = this.times.concat().reverse();
    let i = 0,
      l = timeArr.length;
    for ( ; i < l; i++ ) {
      let status = timeArr[ i ],
        time = item[ status.id ];
      if ( time ) {
        return status.name + "：" + this.formatDateToStr( time );
      }
    }
    return "Invalid Date";
  }
  formatSkuType ( type ) {
    let obj: any = skuTypes.filter( v => v.id === type )[ 0 ] || {};
    return obj.name || "";
  }
  formatPurchaseProperty ( property ) {
    let obj: any = purchasePropertys.filter( v => v.id === property )[ 0 ] || {};
    return obj.name || "";
  }
  applyUsers = {};
  getTenantOfficeUserName ( key ) {
    getTenantOfficeUserName( key ).then( name => {
      this.$set( this.applyUsers, key, name );
    } );
  }
  dataAdapter () {
    let o: any = {};
    o.num = this.page.num;
    o.start = ( this.page.cur - 1 ) * o.num;
    // let o = { start: 0, num: 10 }
    this.condition.forEach( ( con: any ) => {
      let { key, value, type } = con;
      if ( type === "tenantSearch" ) {
        o.tenantId = value.id;
        o.tenantName = value.name;
      } else if ( type === "customerSearch" ) {
        o.customerId = value.id;
        o.customerName = value.name;
      } else if ( type == "daterange" ) {
        if ( value && value[ 0 ] ) {
          o[ key + "Begin" ] = this.formatMyDate( value[ 0 ] );
          o[ key + "End" ] = this.formatMyDate(
            value[ 1 ],
            "yyyy-MM-dd hh:mm:ss",
            true
          );
        }
      } else {
        if ( value !== "" ) {
          o[ key ] = value;
        }
      }
    } );
    return o;
  }
  optionToUri ( o ) {
    let option = Object.assign( {}, o );
    delete option.start;
    delete option.num;
    // option.tenantId = o.tenant && o.tenant.id
    // option.tenantName = o.tenant && o.tenant.name
    // delete option.tenant
    this.$router.push( {
      path: "/server/refunding",
      query: option
    } );
  }
  uriToOption () {
    let query = this.$route.query;
    let o: any = Object.assign( {}, query );
    "applyTime,customerReturn,refundTime,reviewTime".split( "," ).forEach( v => {
      let start = query[ v + "Start" ];
      let end = query[ v + "End" ];
      let hasTime = start && end;
      if ( hasTime ) {
        o[ v ] = [
          new Date( start.replace( /\s/, "T" ) ),
          new Date( end.replace( /\s/, "T" ) )
        ];
      }
    } );

    this.condition.forEach( ( v: any ) => {
      let { key, type } = v;
      if ( type === "tenantSearch" || type === "customerSearch" ) {
        if ( query[ `${key}Id` ] ) {
          v.value = {
            id: query[ `${key}Id` ],
            name: query[ `${key}Name` ]
          };
        }
      } else {
        v.value = o[ key ];
      }
    } );
  }
  refresh () {
    this.search();
  }

  search () {
    this.$permissionValidateWithNotify( 582 );
    let o = this.dataAdapter();
    this.optionToUri( o );
    this.$http( API.getServiceOrders, o ).then(
      ( { data } ) => {
        data = data.data;
        this.page.total = data.total;
        this.data = data.serviceOrderList.map( item => {
          // 申请理由  applyReason => dictionaryApplyReason;applyReason
          let dictionaryApplyReasonAndApplyReason = "";
          if ( item.dictionaryApplyReason && item.applyReason ) {
            dictionaryApplyReasonAndApplyReason = `${item.dictionaryApplyReason}；${item.applyReason}`;
          } else if ( item.dictionaryApplyReason ) {
            dictionaryApplyReasonAndApplyReason = `${item.dictionaryApplyReason}`;
          } else if ( item.applyReason ) {
            dictionaryApplyReasonAndApplyReason = `${item.applyReason}`;
          }

          item.dictionaryApplyReasonAndApplyReason = dictionaryApplyReasonAndApplyReason;
          return item;
        } );
        data.serviceOrderList.forEach( server => {
          // 修复个人账户显示名称
          if ( server.tenantId == "mall" ) {
            this.$set( this.applyUsers, server.applyUserId, server.officeName );
          } else {
            this.getTenantOfficeUserName( server.applyUserId );
          }
        } );
      },
      rej => {
        this.page.total = 0;
        this.data = [];
      }
    );
  }

  openRefundDeatilDialog ( item ) {
    this.isShowRefundApplicationDialog = true;
    this.curListData = item;
  }
}
</script>

<style lang="stylus">
.logistic
  .el-row
    margin-bottom 20px
</style>
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
</style>


