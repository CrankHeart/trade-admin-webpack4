<template>
  <div class="instalment-step">
    <el-form @submit.native.prevent inline v-if="isAdd">
      <el-form-item label="sku领健编码">
        <el-input v-model="lcSkuCode" size="small"></el-input>
      </el-form-item>
      <el-form-item label>
        <el-button type="primary" size="small" @click="searchProduct">搜索</el-button>
      </el-form-item>
    </el-form>
    <div class="product">
      <template v-if="isAdd">
        <el-form label-width="80px" v-for="sku in filterProduct" :key="sku.skuId">
          <el-form-item label="sku编码">{{sku.lcSkuCode}}</el-form-item>
          <el-form-item label="sku名称">
            {{sku.skuName}}
            <i class="el-icon-check pull-right" @click="addSku(sku)"></i>
          </el-form-item>
        </el-form>
        <hr>
      </template>

      <h3>适用商品</h3>
      <el-form label-width="80px" v-for="sku in skus" :key="sku.lcSkuCode">
        <el-form-item label="sku编码">{{sku.lcSkuCode}}</el-form-item>
        <el-form-item label="sku名称">
          {{sku.skuName}}
          <i class="el-icon-close pull-right" @click="delSku(sku)" v-if="isAdd"></i>
        </el-form-item>
      </el-form>
    </div>

    <!-- <div class="steps-wrapper" ref="wrapper" @dblclick="createStep">
      <div
        class="step-btn"
        v-for="(item,index) in viewValue"
        :key="index"
        :style="{'left':`${item}%`}"
        @mousedown="mouseDown"
      ></div>
      <div class="step-tip" v-for="(item,index) in sort(viewValue)"
        :key="index" v-if="index"
        :style="{'left':`${(viewValue[index]+(viewValue[index-1]||0))/2}%`}" >
        {{computeWidth(index)}}
      </div>
    </div>-->
    <hr>
    <h3>共分为{{value.length}}期</h3>
    <el-form label-width="70px">
      <el-form-item v-for="(item,index) in value" :key="index" :label="`第${index+1}期`">
        <el-input :value.number="item" @input="editInstalment(index,$event)" size="small">
          <i slot="append">%</i>
        </el-input>
        <el-button size="small" type="text" @click="addInstalment(index)">新增</el-button>
        <el-button size="small" type="text" @click="delInstalment(index)">删除</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { debounce } from '../../../utils/'
import API from '../../../API'

@Component
export default class InstalmentStep extends Vue {
  @Prop()
  value: number[]
  @Prop()
  disabled: boolean = false
  @Prop()
  skus: any[]
  @Prop()
  isAdd: boolean
  lcSkuCode = ''
  addInstalment ( index ) {
    let list = this.value.slice()
    list.splice( index + 1, 0, '' )
    this.$emit( 'input', list )
  }
  delInstalment ( index ) {
    let list = this.value.slice()
    list.splice( index, 1 )
    this.$emit( 'input', list )
  }
  editInstalment ( index, value ) {
    let list = this.value.slice()
    list.splice( index, 1, value )
    this.$emit( 'input', list )
  }

  addSku ( sku ) {
    let skuList = [ sku ]
    this.$emit( 'sku-change', skuList )
  }
  delSku ( sku ) {
    let skuList = this.skus.filter( v => v.skuId !== sku.skuId )
    this.$emit( 'sku-change', skuList )
  }
  get filterProduct () {
    let skuList = this.skus.map( v => v.skuId )
    return this.productList.filter( v => !skuList.includes( v.skuId ) )
  }
  productList: any[] = []
  searchProduct () {
    let lcSkuCode = this.lcSkuCode.trim()
    // this.productList = []
    if ( lcSkuCode ) {
      this.$http( API.getSkuByLcSkuCode, {
        lcSkuCode,
        broadcast: true
      } ).then( ( { data } ) => {
        this.productList = (
          data.skuList.map( sku => ( {
            skuId: sku.id,
            skuName: `${sku.name}--${sku.specification}`,
            lcSkuCode: sku.lcSkuCode,
            brandName: sku.brandName,
            lcSpuCode: sku.lcSpuCode
          } ) )
        )
      } )
    }
  }
}
</script>
<style lang="stylus" scoped>
 prefagColors = #000 #409EFF #67C23A #E6A23C #F56C6C #909399 #C0C4CC #8cc5ff #fde2e2 #e1f3d8 #faecd8
.instalment-step
  width 500px
  margin 0 auto
.steps-wrapper
  height 4px
  background #eee
  border-radius 2px
  position relative 
  margin 55px auto 10px
  .step-tip
    position absolute
    top -30px
    transform translateX(-50%)
  .step-btn
    width 6px
    height 6px
    border 2px solid #20a0ff
    border-radius 50%
    background #fff
    position absolute
    top -3px
    right -3px
    cursor pointer
    &:hover
      transform scale(1.2)
      transition all .5s
//     &:before
//       content ''
//       position absolute
//       left -500px
//       right 0
//       height 2px
//       background #000
// for color,i in prefagColors
//   .step-btn
//     &:nth-child({i})
//       &:before
//         background color
.el-form-item
  margin-bottom 0
.el-form
  + .el-form
    border-top 1px solid #eee
.product
  margin-bottom 10px
  line-height 24px
  [class*="el-icon"]
    float right
    top 13px
    position relative
    transform scale(.8)
    cursor pointer
    color #50bfff
h3
  line-height 34px
.el-input
  width auto
.el-button
  position relative
  top -2px
</style>