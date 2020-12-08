<template>
  <div class="free-ship-address">
    <el-dialog :visible.sync="visible">
      <el-checkbox-group v-model="checkedAddressList">
        <el-checkbox
          class="label"
          v-for="item in addressList"
          :key="item.provinceId"
          :label="item.provinceId"
        >{{item.provinceName}}</el-checkbox>
      </el-checkbox-group>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="saveFreeShippingArea">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { Getter, State, Mutation, Action } from 'vuex-class'
import API from '../../../API'

@Component( {
  name: 'free-ship-address'
} )
export default class address extends Vue {
  // @Getter( 'freight/addressListStatus' ) addressListStatus
  @Getter( 'freight/currAddressList' ) currAddressList
  @Action( 'address/getAreaList' ) getAreaList
  @Mutation( 'freight/setFreightCity' ) setFreightCity
  @State( state => state.freight.addressList ) addressList

  @Prop( {
    type: Boolean,
    default: () => false
  } )
  value


  checkedAddressList = []

  get visible () {
    return this.value
  }
  set visible ( v ) {
    this.$emit( 'input', v )
  }

  created () {
    this.getAreaList()
  }

  @Watch( 'visible' )
  watchVisible ( newVal, oldVal ) {
    if ( newVal ) {
      this.checkedAddressList = [ ...this.currAddressList ]
    }
  }


  closeDialog () {
    // this.$emit( 'input', false )
    this.checkedAddressList = []
    this.visible = false
  }
  saveFreeShippingArea () {
    this.setFreightCity( this.checkedAddressList )
    this.closeDialog()
  }
}
</script>

<style lang="stylus" scoped>
.label
  width 150px
  padding 10px 0
.el-checkbox:first-child
  margin-left 15px
</style>
