<template>
  <div class="create-result-delivery">
    <el-form inline class="text-right">
      <template v-if="$permissionValidate(690) && !isDirectly">
        <el-form-item label="添加商品" style="margin-right:0">
          <el-input v-model="lcSkuCode" placeholder="请输入sku编码"></el-input>
          <!-- <el-button type="primary" @click.stop="dialogVisible = true">添加商品</el-button> -->
        </el-form-item>
        <el-form-item>
          <el-button @click="addSelectedSku" type="primary">确定</el-button>
        </el-form-item>
      </template>
      <el-form-item label="批量设置到货日期">
        <el-date-picker
          :editable="false"
          v-model="supplierDeliveryDate"
          type="date"
          placeholder="选择日期"
        ></el-date-picker>
        <el-button @click="confirmSetDelivery" type="primary">确认</el-button>
        <el-tooltip placement="bottom">
          <div slot="content">
            <p>tips：选中一个或多个需修改到货日期的商品后，在此输入到货日期，点确定即可！</p>
          </div>
          <i class="el-icon-information"></i>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="优惠金额">
        <el-input-number v-model="supplierBlanceAmount" placeholder="输入金额" :min="0"></el-input-number>
        <el-button @click="confirmBlanceAmount" type="primary">优惠均衡</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'
import API from '../../../API'
// import SkuSelector from '../../../components/skuSelector.vue'

@Component( {
  name: 'create-result-delivery',
  components: {
    // SkuSelector
  }
} )
export default class CreateResultDelivery extends Vue {

  @Prop( { default: () => [] } ) data: any[]
  @Prop( { default: false } ) isDirectly: boolean
  @Mutation( 'procurement/addCommonSkuList' ) addCommonSkuList
  @State( state => state.procurement.selectSupplier ) selectSupplier
  @State( state => state.procurement.commonSkuList ) commonSkuList

  @Inject() formatMyDate

  get allCommonSkuId () {
    return this.commonSkuList.map( item => item.lcSkuCode ) || []
  }
  supplierDeliveryDate: any = ''
  lcSkuCode: string = ''
  tableList: any[] = []
  supplierBlanceAmount = 0

  confirmSetDelivery () {
    if ( this.data.length === 0 ) {
      this.$notify( {
        type: 'warning',
        message: '请选择需要修改日期的商品!'
      } )
      return
    }
    if ( this.supplierDeliveryDate ) {
      let dateStr = this.formatMyDate( this.supplierDeliveryDate )
      this.data.forEach( v => {
        v.deliveryDate = dateStr
      } )
    } else {
      this.$notify( {
        type: 'warning',
        message: '请输入有效的到货时间!'
      } )
    }
  }

  confirmBlanceAmount () {
    if ( this.data.length === 0 ) {
      this.$notify( {
        type: 'warning',
        message: '请选择需要均摊优惠金额的商品!'
      } )
      return
    }
    for ( let v of this.data ) {
      if ( v.skuLabel === 0 ) {
        this.$notify( {
          type: 'warning',
          message: '赠品不允许均摊，请取消对赠品的勾选!'
        } )
        return
      }
    }
    if ( this.supplierBlanceAmount ) {
      let total = 0
      this.data.forEach( v => total += ( v.price * v.supplyNum ) )
      if ( total === 0 ) {
        this.supplierBlanceAmount = 0
        return
      }
      this.data.forEach( v => {
        v.skuDiscountAmount = ( ( v.price * v.supplyNum ) / total * this.supplierBlanceAmount ).toFixed( 2 )
      } )
      this.supplierBlanceAmount = 0
      console.log( this.data )
    } else {
      this.$notify( {
        type: 'warning',
        message: '请输入有效的均摊金额!'
      } )
    }
  }

  addSelectedSku () {
    // if ( this.selectedSku.length === 0 ) {
    //   return
    // }
    // let param = this.selectedSku.map( v => v.lcSkuCode )

    if ( this.lcSkuCode.length === 0 ) {
      return
    }
    // if ( this.allCommonSkuId.includes( this.lcSkuCode ) ) {
    //   this.$notify( {
    //     type: 'warning',
    //     message: '商品已被添加'
    //   } )
    //   return
    // }
    let param = {
      supplierId: this.selectSupplier.id || null,
      lcSkuCodeList: [ this.lcSkuCode ]
    }
    // 缺少的参数 supplierId, 日期deliveryDate.time
    this.$http( API.getSkuVoByCodes, param ).then( ( { data } ) => {
      let count = 0
      let rt = data.data
      if ( rt.list && rt.list.length === 0 ) {
        this.$notify( {
          type: 'warning',
          message: '未查到相关的商品, 请重新选择'
        } )
        return
      }
      this.tableList = rt.list.map( v => {
        let { repNum, deliveryDate, lcSkuCode } = v
        let formatSku: any = {
          isFormat: true,
          isFirst: true
        }
        repNum = repNum > 0 ? repNum : 0
        formatSku.result = {
          ...v,
          deliveryDate: this.formatMyDate( deliveryDate && deliveryDate.time, 'yyyy-MM-dd' ),
          repNum,
          supplyNum: repNum,
          number: 0,
          skuLabel: 1
        }
        if ( !!param.supplierId ) {
          formatSku.isPrice = true
        }
        this.addCommonSkuList( formatSku )
        count += 1
      } )
      if ( count === rt.list.length ) {
        this.lcSkuCode = ''
        this.$notify( {
          type: 'success',
          message: '添加成功'
        } )
      }
    } )
  }
}
</script>

<style lang="stylus" scoped>
.text-right
  text-align right
</style>
<style lang="stylus">
.create-result-delivery
  .el-dialog--large
    width 80%
</style>

