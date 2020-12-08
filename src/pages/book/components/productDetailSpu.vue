<template>
  <div class="product-detail-spu">
    <el-card class="box-card">
      <div slot="header">
        <span>{{title}}</span>
      </div>
      <el-row :gutter="30">
        <el-col :md="8" v-for="item in spuProps" :key="item.prop">
          <div class="item">
            <label>{{item.label}}:</label>
            <template v-if=" canEdit && item.edit">
              <template v-if="item.prop=='introduction'">
              </template>
              <template v-else>
                <el-input type="text" v-model="spu[item.prop]"></el-input>
              </template>
            </template>
            <template v-else>
              <template v-if="item.prop=='qrCode'">
                <a v-if="spu['qrCode']" class="btn" @click="viewImg = spu['qrCode']">查看二维码</a>
                <span v-else>暂无二维码</span>
              </template>
              <template v-else-if="item.prop=='image'">
                <a v-if="spu['image']" class="btn" @click="viewImg = spu['image']">查看图片</a>
                <span v-else>暂无图片</span>
              </template>
              <template v-else-if="item.prop=='category'">
                <span>{{spu['category1stName']}} / {{spu['category2stName']}} / {{spu['category3stName']}} </span>
              </template>
              <template v-else>
                <el-tooltip effect="light" :content="`${spu[item.prop]}`" placement="bottom-start">
                  <span>{{spu[item.prop]}}</span>
                </el-tooltip>
              </template>
            </template>
          </div>
        </el-col>
      </el-row>
    </el-card>
    <div class="view-mask" v-if="viewImg" @click="viewImg=''">
      <div class="img">
        <img :src="viewImg" />
      </div>
    </div>
  </div>
</template>


<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import imgConfig from './imgConfig.vue'
import { spuProps } from '../const'
@Component( {
  name: 'product-detail-spu',
  components: {
    imgConfig
  }
} )
export default class ProductDetailSpu extends Vue {
  @Prop( { default: () => ( {} ) } ) spu: any
  spuProps = spuProps
  labels = [ '订购商品', '常备商品' ]
  canEdit: boolean = false
  viewImg: string = ''

  get title () {
    return this.spu.name || 'SPU'
  }

}
</script>
<style lang="stylus" scoped>
.product-detail-spu
  .btn
    cursor pointer
  .view-mask
    position fixed
    left 0
    top 0
    right 0
    bottom 0
    z-index 999
    .img
      min-width 200px
      min-height 200px
      max-width 400px
      background rgba(0,0,0,.3)
      box-shadow 0 0 20px rgba(0,0,0,.8)
      position absolute
      top 50%
      left 50%
      transform translate3d(-50%,-50%,0)
      img
        width 100%
        height 100%
.el-col
  line-height 34px
  .item
    font-size 12px
    min-height 68px
    label
      display block
      font-weight bold
      font-size 14px
    span
      display block
      overflow hidden
      text-overflow ellipsis
      white-space nowrap
.el-select
  width 100%
</style>
