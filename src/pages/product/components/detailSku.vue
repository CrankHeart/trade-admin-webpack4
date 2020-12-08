<template>
  <StandardSku
    class="product-detail-sku"
    :can-edit="false"
    :spu="spu"
    :sku="sku"
    :visible="visible"
    @save-sku="saveSku"
    :extend-props="allExtendPropsArr"
    :editable="tabName=='merchant' && $permissionValidate(757)"
    :storage-name="'detailSkuConfig'"
  >
    <!-- <div slot="header-slot">disabled---{{disabled}}</div> -->
    <StandardTabs slot="header-slot" @change="tabsChange" v-model="tabName"></StandardTabs>
    <template slot-scope="scope">
      <div
        v-show="!visible"
        class="extend-prop-group"
        v-for="group in skuExtendProps"
        :key="group.name"
      >
        <!-- let oversold = rnd( 0, 3 );
      item.oversold = oversold;
      item.oversoldName = findItem( oversold, oversolds ).name;
      // 订购商品限购数量：-1表示不限购    
        item.purchaseLimit = -1;-->

        <!-- {{group}} -->
        <el-row class="extend-prop-name">{{group.name}}</el-row>
        <el-row :gutter="30" class="inner" v-for="( rows, index ) in group.props" :key="index">
          <template v-for="props in rows">
            <!-- props:{ "prop": "skuType", "label": "sku类型", "editPermission": 720, "visiblePermission": 750 } -->
            <!-- oversold ==>常备商品', id: 1 /purchaseLimit ==>'订购商品', id: 0   -->
            <template v-if="props.prop=='oversold'">
              <template v-if="scope.row.goodLabel==1">
                <!-- 常备商品 -->
                <el-col :md="8" :key="props.prop">
                  <label>{{props.label}}</label>
                  <!-- 编辑状态 -->
                  <template
                    v-if="scope.isEdit && (props.editPermission && $permissionValidate(props.editPermission) || !props.editPermission) && !disabled"
                  >
                    <SkuEditConfig
                      :spu="spu"
                      :item="scope.row"
                      @save-sku="saveSku"
                      :prop="props.prop"
                    ></SkuEditConfig>
                  </template>
                  <!-- 不可编辑 -->
                  <template v-else>
                    <SkuViewConfig :spu="spu" :item="scope.row" :prop="props.prop"></SkuViewConfig>
                  </template>
                </el-col>
              </template>
            </template>
            <template v-else-if="props.prop=='purchaseLimit'">
              <template v-if="scope.row.goodLabel==0">
                <!-- 订购商品 -->
                <el-col :md="8" :key="props.prop">
                  <label>{{props.label}}</label>
                  <!-- 编辑状态 -->
                  <template
                    v-if="scope.isEdit && (props.editPermission && $permissionValidate(props.editPermission) || !props.editPermission) && !disabled"
                  >
                    <SkuEditConfig
                      :spu="spu"
                      :item="scope.row"
                      @save-sku="saveSku"
                      :prop="props.prop"
                    ></SkuEditConfig>
                  </template>
                  <!-- 不可编辑 -->
                  <template v-else>
                    <SkuViewConfig :spu="spu" :item="scope.row" :prop="props.prop"></SkuViewConfig>
                  </template>
                </el-col>
              </template>
            </template>
            <el-col v-else :md="8" :key="props.prop">
              <label>{{props.label}}</label>
              <!-- 编辑状态 -->
              <template
                v-if="scope.isEdit && (props.editPermission && $permissionValidate(props.editPermission) || !props.editPermission) && !disabled"
              >
                <SkuEditConfig :spu="spu" :item="scope.row" @save-sku="saveSku" :prop="props.prop"></SkuEditConfig>
              </template>
              <!-- 不可编辑 -->
              <template v-else>
                <!-- <span style="color:red;">{{props.prop}}</span> -->
                <SkuViewConfig :spu="spu" :item="scope.row" :prop="props.prop"></SkuViewConfig>
              </template>
            </el-col>
          </template>
        </el-row>
      </div>
    </template>
  </StandardSku>
</template>
<script lang="ts">
import { Vue, Component, Prop, Inject } from 'vue-property-decorator'
import { Action } from 'vuex-class'
import StandardSku from './standardSku.vue'
import StandardTabs from './standardTabs.vue'
import standardTabsChangeMixins from '../mixins/standardTabsChange'
import SkuViewConfig from './skuViewConfig.vue'
import SkuEditConfig from './skuEditConfig.vue'
import { skuExtendProps } from '../const'
@Component( {
  name: 'product-detail-sku',
  mixins: [ standardTabsChangeMixins ],
  components: {
    StandardSku, StandardTabs, SkuViewConfig, SkuEditConfig
  }
} )
export default class ProductDetailSku extends Vue {
  @Inject() formatMyDate
  @Action( 'message/msgHandled' ) callBack
  // @Prop( { type: String, default: 'merchant' } ) value: string
  @Prop( { type: Array, default: () => [] } ) sku: any[]
  @Prop( { type: Object, default: () => ( {} ) } ) spu: any
  @Prop( { type: Boolean, default: false } ) disabled: boolean


  // 根据权限过滤展示字段
  skuExtendProps: any[] = skuExtendProps.map( ( group: any = {} ) => {
    group.props = group.props.reduce( ( arr, curr ) => {
      let row = curr.filter( v => {
        return this.$permissionValidate( v.visiblePermission )
      } )
      arr.push( row )
      return arr
    }, [] )
    return group
  } )

  get allExtendPropsArr () {
    const flatten_deep = list => list.reduce(
      ( total, curr ) => total.concat( Array.isArray( curr ) ? flatten_deep( curr ) : curr ), []
    )
    let arr = this.skuExtendProps.map( group => {
      let props = group.props || []
      return flatten_deep( props )
    } )
    return flatten_deep( arr )
  }

  saveSku ( sku ) {
    if ( !this.validateSku( sku ) ) return

    let { activityEndTime, contrastingRelations } = sku
    if ( typeof activityEndTime == 'string' ) {
      activityEndTime = activityEndTime.replace( /!^\s/i, 'T' )
    }
    if ( !contrastingRelations || !contrastingRelations.length ) {
      contrastingRelations = undefined
    }

    this.$emit( 'save-sku', {
      ...sku,
      contrastingRelations,
      activityEndTime: this.formatMyDate( activityEndTime, void 0, true )
    } )
  }
  validateSku ( sku ) {
    let { settlePrice, salesPrice, specification, stock, stockBak, activityEndTime, activityPrice, goodLabel, whileStocksLast, batchNumber } = sku

    if ( goodLabel === '' ) {
      this.$notify( {
        type: 'error',
        message: '商品标签不能为空！'
      } )
      return false

    }

    if ( stock !== '' && !/^\d+$/.test( stock ) ) {
      this.$notify( {
        type: 'error',
        message: 'SKU商品库存填写有误，请完善后提交！'
      } )
      return false
    }
    // if ( goodLabel === 1 && !+stock ) {
    //   this.$notify( {
    //     type: "error",
    //     message: "常备商品库存不能为0！"
    //   } )
    //   return false
    // }
    if ( whileStocksLast === 1 && +stock != +stockBak ) {
      this.$notify( {
        type: "error",
        message: "当选择售完即止时不能修改库存,请您确定库存数量"
      } )
      return false
    }
    settlePrice += ''
    salesPrice += ''
    // bottomPrice += ''
    if (
      !settlePrice ||
      +settlePrice < 0 ||
      +settlePrice != settlePrice ||
      !salesPrice ||
      +salesPrice < 0 ||
      +salesPrice != salesPrice

    ) {
      this.$notify( {
        type: 'error',
        message: 'SKU价格必须填写有效数字！'
      } )
      return false
    }
    if ( +sku.batchNumber < 1 ) {
      sku.batchNumber = 1
      this.$notify( {
        type: 'warning',
        message: '起批数量至少为1'
      } )
    }

    return true
  }
}
</script>
<style lang="stylus" scoped>
.el-col
  line-height 34px
.inner
  font-size 12px
  min-height 40px
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
.extend-prop-group
  margin-bottom 20px
.extend-prop-name
  padding 5px 0 10px
  border-bottom 1px solid #999
  font-size 16px
</style>