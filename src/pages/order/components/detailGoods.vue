<template>
  <div class="order-detail-goods">
    <div class="query-row">
      <el-card :body-style="{ border: '0' }">
        <el-row>
          <el-col :span="12">
            <h3>商品信息</h3>
          </el-col>
          <el-col :span="12">
            <el-row type="flex" justify="end">
              <!-- TODO：打印所有资质 http://jira.linkedcare.cn:8000/browse/ET-3987 -->
              <el-button
                v-if="isShowAllPrint"
                type="primary"
                size="small"
                class="marginLeft20"
                icon="md-add"
                @click="doPrintAll"
                v-loading.fullscreen.lock="fullscreenLoading"
              >打印所有资质</el-button>
              <el-button
                type="primary"
                size="small"
                class="marginLeft20"
                @click="refresh('memberOrder')"
              >刷新</el-button>
            </el-row>
          </el-col>
        </el-row>
      </el-card>
    </div>
    <!-- <lc-table-config :base-config="baseConfig" @set-config=""></lc-table-config> -->
    <lc-table
      :config="baseConfig"
      :max-height="500"
      :data="itemList"
      :loading="itemList.length == 0"
      :expands="{ before: true }"
      :has-page="false"
      :key="baseConfig.length"
    >
      <template slot-scope="scope">
        <template
          v-if="
            scope.con.prop == 'myAgreePriceType' && scope.row.purchaseProperty
          "
        >
          <el-tag type="danger" v-if="scope.row.purchaseProperty === 1">赠品</el-tag>
          <el-tag type="danger" v-if="scope.row.purchaseProperty === 2">试用品</el-tag>
        </template>
        <template v-else-if="scope.con.prop == 'coupon'">
          <span>- {{ (scope.row["couponAmount"] || 0) | fixed2 }}</span>
          <!-- <el-tooltip
            effect="light"
            :disabled="scope.row['affectedCouponActivityName'] && !scope.row['affectedCouponActivityName'].length"
            :content="scope.row['affectedCouponActivityName']"
            placement="bottom"
          >
            <span>- {{(scope.row['couponAmount'] || 0) | fixed2}}</span>
          </el-tooltip>-->
        </template>
        <template v-else-if="scope.con.prop == 'promotion'">
          <span>- {{ (scope.row["promotionAmount"] || 0) | fixed2 }}</span>
          <!-- <el-tooltip
            effect="light"
            :disabled="scope.row['affectPromotionName'] && !scope.row['affectPromotionName'].length"
            :content="scope.row['affectPromotionName']"
            placement="bottom"
          >
            <span>- {{(scope.row['promotionAmount'] || 0) | fixed2}}</span>
          </el-tooltip>-->
        </template>
        <template v-else-if="scope.con.prop == 'subtotal'">
          {{
          (scope.row[scope.con.prop] || 0) | fixed2
          }}
        </template>
        <template v-else-if="scope.con.prop == 'control'">
          <el-button
            @click="doPrintOne(scope.row)"
            type="text"
            :disabled="!scope.row.aptitudeImgs"
            v-if="scope.row.needAptitude && $permissionValidate(541)"
          >打印资质</el-button>
        </template>
        <template v-else-if="scope.con.prop == 'otherAmount'">
          {{
          (-+scope.row["otherAmount"] || 0) | fixed2
          }}
        </template>
        <template v-else>{{ scope.row[scope.con.prop] }}</template>
      </template>

      <template slot-scope="scope" slot="expand-before">
        <ul class="sub-table el-row">
          <li
            v-for="con2 in tableSub"
            class="el-col el-col-8 el-col-md-8 el-col-sm-12 el-col-xs-24"
            :key="con2.prop"
          >
            <span>{{ con2.label }}</span>
            {{ scope.row[con2.prop] }}
          </li>
        </ul>
      </template>
    </lc-table>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { Component, Inject, Prop } from "vue-property-decorator";
import API from "../../../API";
import lcTable from "../../../components/table/index";
import lcTableConfig from "../../../components/table/control.vue";
// import { serviceType } from '../../server/const/serverConstant'
// let afterSaledFilters = serviceType.map(v=>{
//   return {
//     text: v.name,
//     value: v.id
//   }
// })
// import { deliverStates } from '../const/orderSearchCondition'
@Component( {
  name: "order-detail-goods",
  components: {
    lcTable,
    // lcTableConfig
  },
} )
export default class OrderDetailGoods extends Vue {
  @Prop( { required: true, type: Array, default: () => [] } ) data;
  get itemList () {
    // let o: any = {}
    this.data.forEach( ( val ) => {
      // let { lcCode, number, paymentAmount } = val
      //   if (!o[lcCode]) {
      //     o[lcCode] = val || {}
      //     o[lcCode].numberTotal = o[lcCode].number
      //     o[lcCode].paymentAmountTotal = o[lcCode].paymentAmount
      //   } else {
      //     o[lcCode].numberTotal += number
      //     o[lcCode].paymentAmountTotal += paymentAmount
      //   }
      //   o[lcCode].paymentAmountStringTotal = o[lcCode].paymentAmount.toFixed(2)
      val.numberTotal = val.number;
      val.paymentAmountStringTotal = ( val.paymentAmount || 0 ).toFixed( 2 );
    } );
    // return Object.keys(o).map(v => o[v])
    return this.data;
  }

  get isShowAllPrint () {
    // 打印所有资质 是否显示： 判断条件->只要有图片就显示
    // 不需要根据下面条件进行判断：scope.row.needAptitude && $permissionValidate(541)
    let flag = this.itemList.some( ( item ) => item.aptitudeImgs );
    return flag;
  }
  // formatDeliverState(deliverState) {
  //   let d: any = deliverStates.filter(v => v.id == deliverState)[0] || {}
  //   return d.name
  // }
  fullscreenLoading: boolean = false
  tableSub = [
    { prop: "code", label: "自有编码" },
    // { prop: 'medicalRegidatastNum', label: '械宇' },
    { prop: "category3stName", label: "类目" },
    { prop: "specification", label: "规格" },
    { prop: "brandName", label: "品牌" },
  ];
  baseConfig = [
    { prop: "name", label: "商品名称", width: "230px" },
    { prop: "numberTotal", label: "数量" },
    { prop: "unit", label: "单位" },
    { prop: "lcCode", label: "LC编码", width: "150px" },
    { prop: "priceString", label: "售价", width: "90px" },
    // { prop: 'lcCode', label: '售后状态',width:'120px',filters:afterSaledFilters,filterTag:this.afterSaledFilterMethod},

    // { prop: 'lcCode', label: '售后状态', width: '120px' },
    { prop: "agreePriceString", label: "成交价", width: "100px" },
    { prop: "myAgreePriceType", label: "成交类型", width: "100px" },
    { prop: "paymentAmountStringTotal", label: "商品金额", width: "100px" },
    { prop: "promotion", label: "促销优惠", width: "100px" },
    { prop: "coupon", label: "券码优惠", width: "100px" },
    { prop: "otherAmount", label: "地推优惠", width: "100px" },
    { prop: "subtotal", label: "小计", width: "100px" },
    { prop: "control", label: "操作", width: "100px", fixed: 'right' },
  ];
  // afterSaledFilterMethod(value, row) {
  //   return value == '退货'
  // }
  refresh ( name ) {
    // 刷新商品信息 memberOrder
    this.$emit( "refresh", name );
  }

  doPrintOne ( item ) {
    // let imgs = item.aptitudeImgs.split( ";" );
    // sessionStorage.setItem( "pics", JSON.stringify( imgs ) );
    // let url =
    //   window.location.href.split( "#" )[ 0 ].replace( /\?+$/, "" ) + "print.html";
    // window.open( url );

    this.fullscreenLoading = true;
    const imgUrls = [];
    let { aptitudeImgs } = item;
    let arr = aptitudeImgs.split( ";" );
    // 过滤不是图片的链接
    arr = arr.filter( imgUrl => /\.(png|jpe?g|gif|svg)$/.test( imgUrl ) );
    arr.length && imgUrls.push( ...arr );
    this.validateImages( imgUrls );
  }
  doPrintAll () {
    this.fullscreenLoading = true;
    const imgUrls = [];
    // https://lcsaas.oss-cn-hangzhou.aliyuncs.com/etrade/test/spu_aptitude/17345/20200702050003099xlbGIB_bak.jpg
    this.itemList.forEach( ( { aptitudeImgs } ) => {
      if ( aptitudeImgs ) {
        console.log( "aptitudeImgs:", aptitudeImgs );
        let arr = aptitudeImgs.split( ";" );
        // 过滤不是图片的链接
        arr = arr.filter( imgUrl => /\.(png|jpe?g|gif|svg)$/.test( imgUrl ) );
        arr.length && imgUrls.push( ...arr );
      }
    } );
    this.validateImages( imgUrls );
  }

  validateImages ( imgUrls ) {
    // 图片去重
    // Array 转 Set
    let oSet = new Set( imgUrls );
    //  将 Set 转 Array
    let arr = Array.from( oSet );

    const len = arr.length;

    let count = 0;
    let _this = this;
    // 加载失败的图片
    let errorImages = [];

    arr.forEach( src => {
      let oImg = new Image();
      oImg.onload = function () {
        count++;
        console.log( "图片加载成功", count, len, this.src );
        if ( count == len ) {
          _this.closeFullScreen( arr, errorImages );
        }
      };

      oImg.onerror = function () {
        count++;
        console.log( "图片加载失败", count, len, this.src );
        errorImages.push( decodeURIComponent( this.src ) );
        if ( count == len ) {
          _this.closeFullScreen( arr, errorImages );
        }
      };
      oImg.src = src;
    } );
  }

  closeFullScreen ( arr: Array<string>, errorImages: Array<string> ): void {
    this.fullscreenLoading = false;

    let count = arr.length;
    let len = errorImages.length;
    let msg = `总共有${count}张资质图片，确认打印?`
    // 图片全部加载失败
    if ( count == len ) {
      msg = `总共有${count}张资质图片，全部加载失败,请联系管理员！`
      return this.$alert( msg, '提示', {
        confirmButtonText: '关闭',
        callback: action => { }
      } );
    }

    if ( len ) {
      msg = `总共有${count}张资质图片，${len}张图片加载失败，是否继续打印?`
    }

    // 过滤加载失败的图片
    for ( let i = 0; i < errorImages.length; i++ ) {
      const imgUrl = errorImages[ i ];
      for ( let j = 0; j < arr.length; j++ ) {
        if ( imgUrl == arr[ j ] ) {
          arr.splice( j, 1 );
          continue;
        }
      }
    }

    this.$confirm( msg, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    } ).then( () => {
      this.$message( {
        type: 'success',
        message: '正在跳转打印!'
      } );

      setTimeout( () => {
        sessionStorage.setItem( "pics", JSON.stringify( arr ) );
        let url =
          window.location.href.split( "#" )[ 0 ].replace( /\?+$/, "" ) + "print.html";
        window.open( url );
      }, 1000 );
    } ).catch( () => {
      this.$message( {
        type: 'info',
        message: '已取消打印'
      } );
    } );
  }

  // doPrint ( item ) {
  //   let imgs = item.aptitudeImgs.split( ";" );
  //   sessionStorage.setItem( "pics", JSON.stringify( imgs ) );
  //   let url =
  //     window.location.href.split( "#" )[ 0 ].replace( /\?+$/, "" ) + "print.html";
  //   window.open( url );
  // }
}
</script>
<style lang="stylus" scoped>
li
  line-height 30px
  span
    font-weight bold
    width 60px
    margin-right 15px
    display inline-block
    text-align right
.marginLeft20
  margin-left 20px
</style>
<style lang="stylus">
.order-detail-goods
  .el-table__body-wrapper
    z-index 1
</style>
