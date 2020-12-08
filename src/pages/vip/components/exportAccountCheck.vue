<template>
  <el-dialog title="填写对账流水号" class="fillin-bank-sn" v-model="value" :before-close="handleClose">
    <el-input v-model="accountCheckSn" placeholder="请输入对账流水号"></el-input>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'

@Component( {
  name: 'AccountCheckSn'
} )
export default class AccountCheckSn extends Vue {
  @Prop()
  value: boolean
  accountCheckSn: string = ''
  handleClose ( bo = false ) {
    this.$emit( 'input', false )
  }
  handleSubmit () {
    if ( !this.accountCheckSn ) {
      this.$notify( {
        type: 'error',
        message: '请输入对账流水号'
      } )
    } else {
      this.$emit( 'accountCheck', this.accountCheckSn )
      this.handleClose( true )
    }
  }

}
</script>
