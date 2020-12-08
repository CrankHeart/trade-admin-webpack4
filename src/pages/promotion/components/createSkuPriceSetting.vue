<template>
  <lc-table
    :config="config"
    :data="realProductList"
    class="creat-sku-price-setting"
    v-if="productList.length"
    :page="realPage"
    @cur-change="curChange"
  >
    <template slot-scope="scope">
      <template
        v-if="['settlePrice','salesPrice','bottomPrice'].indexOf(scope.con.prop)>-1"
      >{{(+scope.row[scope.con.prop]).toFixed(2)}}</template>
      <template v-else-if="scope.con.prop == 'price' && !isDetail">
        <el-tooltip
          content="sku价格低于综合成本价"
          placement="bottom"
          effect="light"
          v-if="!checkPrice(scope.row)"
        >
          <i class="el-icon-information pull-right"></i>
        </el-tooltip>
        <el-input
          v-model.trim="scope.row[scope.con.prop]"
          size="small"
          :class="{'el-form-item':true,'is-error':!checkPrice(scope.row)}"
        ></el-input>
      </template>
      <template v-else>{{scope.row[scope.con.prop]}}</template>
    </template>
  </lc-table>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import lcTable from '../../../components/table/'
@Component( {
  components: {
    lcTable
  }
} )
export default class CreateSkuPriceSetting extends Vue {
  @Prop( { default: () => ( {} ) } )
  promotion: any
  @Prop()
  isDetail: boolean
  get config (): any[] {
    return [
      { prop: 'id', label: 'skuId' },
      { prop: 'name', label: '名称' },
      { prop: 'price', label: '活动价', width: '230px' }
    ].concat( this.isDetail ? [] : [
      { prop: 'lcSkuCode', label: 'lcSkuCode' },
      { prop: 'specification', label: '规格' },
      { prop: 'settlePrice', label: '成本价' },
      { prop: 'bottomPrice', label: '综合成本价' },
      { prop: 'platformPrice', label: '平台限价' }
    ] )
  }
  page = {
    cur: 1,
    num: 10
  }
  get realPage () {
    return {
      ...this.page,
      total: this.productList.length
    }
  }
  get productList () {
    return this.promotion.brandProducts || []
  }
  get realProductList () {
    let { cur, num } = this.page
    let start = ( cur - 1 ) * num
    let end = start + num
    return this.productList.slice( start, end )
  }
  curChange ( cur ) {
    this.page.cur = cur
  }
  validate () {
    // let result = this.productList.every( v => v.price !== '' && +v.price == +v.price && ( v.platformPrice && +v.price >= v.platformPrice || +v.price >= v.bottomPrice ) )
    let result = this.productList.every( v => v.price !== '' && +v.price == +v.price )
    if ( !result ) {
      this.$notify( {
        type: 'error',
        // message: '所选sku价格必须填写有效数字且大于底价限价'
        message: '所选sku价格必须填写有效数字'
      } )
    }
    return result
  }
  checkPrice ( item ) {
    let { price, bottomPrice } = item
    bottomPrice = +bottomPrice
    if ( price && +price < bottomPrice ) {
      return false
    } else {
      return true
    }
  }
}
</script>
<style lang="stylus" scoped>
.el-icon-information
  line-height 30px
  color #ff4949
.el-input
  width auto
</style>
