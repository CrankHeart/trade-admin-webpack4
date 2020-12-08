<template>
  <div class="product-detail-sku">
    <el-card>
      <div slot="header">
        <span>SKU</span>
      </div>
      <el-collapse v-model="activeId" @change="handleChange">
        <el-collapse-item v-for="item in skuList " :key="item.id" :name="item.id">
          <template slot="title">
            <el-tooltip effect="light" :content="item.specification" placement="bottom">
              <span class="title1">{{item.specification}}</span>
            </el-tooltip>
          </template>
          <product-detail-sku-item :sku="item"></product-detail-sku-item>
        </el-collapse-item>
      </el-collapse>
    </el-card>

  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import productDetailSkuItem from './productDetailSkuItem.vue'
import { skuProps } from '../const'
@Component( {
  name: 'product-detail-sku',
  components: {
    productDetailSkuItem
  }
} )
export default class ProductDetailSpu extends Vue {
  @Prop( { type: Array, default: () => ( [] ) } ) skuList
  skuProps = skuProps
  activeId: string = ''
  canEdit: boolean = false

  handleChange () {

  }


}
</script>
<style lang="stylus" scoped>
.product-detail-sku
  .el-collapse-item__header__arrow
    float right
    margin-top 16px
  .title
    display inline-block
    width 200px
    overflow hidden
    text-overflow ellipsis
    white-space nowrap
    vertical-align middle

</style>
