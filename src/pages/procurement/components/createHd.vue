<template>
  <div class="procurement-create-hd">
    <lc-card title="基础信息">
      <el-form class="el-row">
        <!-- <el-col :span="8">
          <el-form-item label="采购单编号：">{{value.procurementSn}}</el-form-item>
        </el-col>-->
        <el-col :span="12">
          <el-form-item label="供应商：">
            <el-select v-model="suppliers" filterable>
              <el-option
                v-for="supplier in supplierList"
                :label="supplier.name"
                :value="supplier.name"
                :key="supplier.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入库仓：">
            <el-select v-model="value.wareHouse" filterable clearable>
              <el-option
                v-for="wareHouse in wareHouses"
                :value="wareHouse.id"
                :label="wareHouse.name"
                :key="wareHouse.id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="8">
        <el-form-item label="税率">-->
        <!-- <span v-show=" value.taxPoint.toString().length > 0 ">{{value.taxPoint}}%</span> -->
        <!-- <el-input v-model.trim.number="value.taxPoint"></el-input>%
          </el-form-item>
        </el-col>-->
        <el-col :span="8">
          <el-form-item>
            <el-checkbox v-model="value.isSync">同步供应商采购关系和报价</el-checkbox>
            <el-tooltip placement="bottom" style="margin-top:12px">
              <div slot="content">
                <p>tips：采购单中的商品价格将被同步为供应商报价</p>
              </div>
              <i class="el-icon-information"></i>
            </el-tooltip>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item>
            <el-checkbox v-model="value.isPreferred">当前供应商设为首选</el-checkbox>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="24">
          <el-form-item label="备注：">
            <el-input v-model.trim="value.remark" type="textarea"></el-input>
          </el-form-item>
        </el-col>-->
      </el-form>
    </lc-card>
    <lc-card title="供应商付款信息">
      <lc-dataset :dataset="supplerMsg"></lc-dataset>
    </lc-card>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject, Prop } from 'vue-property-decorator'
import { wareHouses, isSyncPrice, preferSupplier } from '../const/'
import { Action, State, Mutation } from 'vuex-class'
import supplerMsgConfig from '../list/add/supplerMsgConfig'
@Component( {
  name: 'procurement-create-hd',
  components: {
  }
} )
export default class procurementCreateHd extends Vue {
  @Prop() value: any

  @State( state => state.supplier.supplierList ) supplierList
  @State( state => state.procurement.commonSkuList ) commonSkuList
  @Action( 'supplier/getAllSuppliers' ) getAllSuppliers

  get suppliers () {
    return this.value.suppliers
  }
  set suppliers ( supplier ) {
    this.$emit( 'change', this.supplierList._find( supplier, 'name' ) )
  }
  syncPrice = true
  preferSupplier = false
  wareHouses = wareHouses
  supplerMsg = ''
  created () {
    this.getAllSuppliers()
    this.supplerMsg = this.$dataSet( supplerMsgConfig )
    this.supplerMsg.value = this.value
    this.getDefaultMsg()
  }

  getDefaultMsg () {
    let supplierId = '';
    for ( let item of this.commonSkuList ) {
      if ( item.supplierId ) {
        supplierId = item.supplierId
      }
    }
    if ( supplierId ) {
      let supplier = this.supplierList.find( item => item.id === supplierId )
      this.$nextTick( () => {
        this.suppliers = supplier.name
      } )

    }
  }

  // suppliersChange ( supplier ) {

  // }
}
</script>
<style lang="stylus" scoped>
.procurement-create-hd
  padding-top 15px
  margin-bottom 20px
  border-bottom 1px solid #ccc
.el-select{
  width: 100%;
}
.el-col
  padding-left 10px
.el-col:last-child {
  text-align: right;
}

.el-form-item {
  margin-bottom: 10px;
}

.procurement-create-hd .el-form-item
  display flex
  flex-wrap wrap
</style>

<style lang="stylus">
.procurement-create-hd
  .el-form-item__content
    flex 1
    display flex
</style>
