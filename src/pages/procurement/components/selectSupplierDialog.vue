<template>
  <el-dialog v-model="visible" title="选择供应商">
    <el-form label-width="140px">
      <el-form-item label="选择供应商方式：">
        <el-radio-group v-model="supplierMethod" @change="methodChange">
          <el-radio label="1">价格优先</el-radio>
          <el-radio label="2">交期优先</el-radio>
          <el-radio label="3">默认首选供应商</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="选择供应商：">
        <el-select
          @change="supplierChange"
          :filterable="true"
          :clearable="true"
          v-model="supplierId"
          placeholder="请选择"
        >
          <el-option
            v-for="item in supplierList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { Component, Prop, Watch } from "vue-property-decorator"
import { State } from 'vuex-class'
import API from "../../../API"

@Component( {
  name: "select-buyer-dialog",
} )
export default class selectBuyerDialog extends Vue {
  @State( state => state.supplier.supplierList ) supplierList
  @Prop( { default: false } ) value: boolean;
  @Prop() sku: [];

  supplierMethod: string = ''
  supplierId = ''

  get visible () {
    return this.value;
  }

  set visible ( v ) {
    this.$emit( "input", v );
  }

  methodChange () {
    if ( this.supplierMethod !== '' ) {
      this.supplierId = ''
    }
  }
  supplierChange () {
    if ( this.supplierId !== '' ) {
      this.supplierMethod = ''
    }
  }

  confirm () {
    this.visible = false;
    let ids = []
    this.sku.forEach( item => {
      ids.push( item.id )
    } )
    let param
    let select = this.supplierList.find( item => item.id === this.supplierId )
    if ( this.supplierId ) {
      param = {
        type: 1,
        taskIds: ids,
        supplierName: select.name,
        supplierId: this.supplierId
      }
    } else {
      param = {
        type: 2,
        taskIds: ids,
        priority: this.supplierMethod
      }
    }

    this.$http( API.modifySupplier, param ).then( ( { data } ) => {
      this.visible = false;
      console.log( 'sucess' )
      this.$emit( "editSucess" );
    } );
  }
}
</script>


<style lang="stylus" scoped>
</style>

