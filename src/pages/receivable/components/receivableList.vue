<template>
  <div id="table_warp">
    <div class="delivery-search-list" ref="table_warp">
      <table cellpadding="0" cellspacing="0" class="mytable" :width="tableWidth + 'px'">
        <thead>
          <th
            v-for="(con, index) in config"
            :key="index"
            :style="{ width: con.width }"
          >{{ con.label }}</th>
        </thead>
        <tbody v-if="list.length == 0">
          <tr>
            <td :colspan="config.length" style="text-align:center;padding:15px;">暂无数据</td>
          </tr>
        </tbody>
      </table>
      <template v-for="item in list">
        <accountItem
          :tableWidth="tableWidth"
          :config="config"
          :item="item"
          :key="item.id"
          :selectedIds="listPageSelectedList"
          @selectedChanged="selectedChanged"
          ref="accountItems"
        ></accountItem>
      </template>
    </div>
    <el-pagination
      :current-page="pageInfo.cur"
      :page-size="pageInfo.num"
      layout="total, prev, pager, next, sizes"
      :total="pageInfo.total"
      class="center"
      @current-change="curChange"
      :page-sizes="pageInfo.sizes"
      @size-change="sizeChange"
    ></el-pagination>
    <div style="padding-bottom:50px;"></div>
    <receivableBottomBar :selectedList="currentPageSelectedKeys" @success="$emit('success',$event)"></receivableBottomBar>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch, Inject } from "vue-property-decorator";
import accountItem from "@/pages/receivable/components/accountItem.vue";
import receivableBottomBar from "@/pages/receivable/components/receivableBottomBar.vue";
import API from "../../../API";
import { State, Action, Getter, Mutation } from "vuex-class";

@Component( {
  name: "receivable-list",
  components: {
    accountItem,
    receivableBottomBar
  }
} )
export default class receivable extends Vue {
  @Prop( { default: () => [] } )
  data: any[]; // 外部传入的列表数组

  @Prop( { default: false } ) selectAll: boolean;
  @Prop( { default: () => { } } ) pageInfo;
  @Action( "stores/getAllStoresWithCache" ) getAllStoresWithCache;
  @Mutation( "receivable/setSelectlist" ) setSelectlist;
  @State( state => state.receivable.selectList ) selectList;
  // @Mutation("receivable/combineSelectlist") combineSelectlist;
  @Mutation( "receivable/setIsAllSelected" ) setIsAllSelected;
  tableWidth = 0;
  listPageSelectedList = []; // 当前页面选中的复选框


  @Watch( "selectList" )
  wathcSelectList ( val ) {
    // selectList变化必定改变
    this.listPageSelectedList = val
  }

  getKeyByItem ( item ) {
    let timestamp = new Date().getTime();
    return item.orderSn;
  }
  config = [
    { prop: "receiptNo", label: "单据编号", width: "220px" },
    { prop: "receiptType", label: "单据类型", width: "120px" },
    { prop: "deliveryDate", label: "单据时间", width: "220px" },
    { prop: "receivableAmount", label: "应收金额", width: "120px" },
    { prop: "checkStatus", label: "对账状态", width: "120px" },
    { prop: "settlementStatus", label: "结算状态", width: "120px" },
    { prop: "invoiceStatus", label: "开票状态", width: "120px" },
    { prop: "invoiceBlueNum", label: "发票编号", width: "160px" },
    { prop: "control", label: "操作", width: "120px" }
  ];

  list = []; // 渲染后的列表
  currentPageSelectedKeys = []; // 保存,当前页面选中的行

  @Watch( "data" )
  dataWatch ( data ) {
    this.loadData();
  }

  getTableBoxWidth () {
    let width = 0;
    this.config.forEach( item => {
      width += parseInt( item.width.replace( "px", "" ) );
    } );
    let innerWarpWidth = 0;
    if ( this.$refs && this.$refs[ "table_warp" ] ) {
      innerWarpWidth = this.$refs[ "table_warp" ].clientWidth;
    }
    // 如果所有列表加一起不到满屏,需要使用满屏宽度
    this.tableWidth = innerWarpWidth > width ? innerWarpWidth : width;
  }

  setSelectedAllByParent ( data ) {
    let selectedArr = [];
    this.list.map( item => {
      if ( item.relatedFinancialReceivables.length > 0 ) {
        item.relatedFinancialReceivables.forEach( info => {
          selectedArr.push( {
            key: info.receiptNo,
            type: "account",
            orderSn: info.orderSn,
            receivableSn: info.receivableSn,
            invoiceBlueNum: info.invoiceBlueNum,
            value: data
          } );
        } );
      } else {
        selectedArr.push( {
          // key: item.orderSn,
          key: item.id,
          orderSn: item.orderSn,
          receivableSn: item.receivableSn,
          type: "order",
          value: data
        } );
      }
    } );
    this.listPageSelectedList = selectedArr.filter( item => item.value );
  }

  selectedChanged ( info ) {
    let items = info.lists;
    items.forEach( item => {
      if (
        this.currentPageSelectedKeys.findIndex( info => info.key == item.key ) ==
        -1 &&
        item.value
      ) {
        // 如果不存在,并且目标是选中状态,
        this.currentPageSelectedKeys.push( { ...item, key: item.key } );
      } else if (
        this.currentPageSelectedKeys.findIndex( info => info.key == item.key ) !=
        -1 &&
        !item.value
      ) {
        // 如果存在,并且模板是非选中,删除
        this.currentPageSelectedKeys = this.currentPageSelectedKeys.filter(
          info => item.key !== info.key
        );
      }
    } );
    // // 检测是否全选,如果没有全选,发送事件
    // if (info.isCheckedAll === false) {
    //   this.setIsAllSelected(false);
    // }
    this.setIsAllSelected( this.$refs.accountItems.every( val => val.isCheckedAll ) );

  }

  created () {
    this.loadData();
  }

  mounted () {
    window.onresize = () => {
      this.getTableBoxWidth();
    };
    this.getTableBoxWidth();
  }

  initCurrentPageKeys () {
    this.currentPageSelectedKeys = [];
  }

  loadData () {
    // selectList 是vuex里面的值,分页汇总, listPageSelectedList是本页面的选择的数据,是selectList的子集,而且listPageSelectedList仅仅是为了渲染单选框是否选中,选中如果没有点击新增不会进入vuex selectList里面
    this.listPageSelectedList = this.selectList;
    this.initCurrentPageKeys()
    this.list = this.data.map( item => {
      if (
        item.relatedFinancialReceivables &&
        item.relatedFinancialReceivables.length > 0
      ) {
        item.relatedFinancialReceivables = item.relatedFinancialReceivables.map(
          delivery => {
            return {
              ...delivery,
              isChecked: false
            };
          }
        );
      }
      return {
        ...item,
        isChecked: false
      };
    } );
  }

  curChange ( cur ) {
    this.$emit( "curChange", cur );
  }
  sizeChange ( v ) {
    this.$emit( "sizeChange", v );
  }
}
</script>
<style lang="stylus" scoped>
.delivery-search-list
  width 100%
  overflow auto
.mytable
  th
    background #8492a6
    padding 5px 0
    color #333
    box-sizing border-box
    border-right 1px solid #FFF
    height: 40px
    min-width: 0
    text-overflow ellipsis
    vertical-align middle
</style>
