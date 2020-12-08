<template>
  <el-dialog title="填写银行流水号" class="fillin-bank-sn" v-model="value" :before-close="handleClose">
    <el-input v-model="bankSn" placeholder="请输入银行流水"></el-input>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
  import Vue from 'vue'
  import {Component, Prop, Inject} from 'vue-property-decorator'
  import API from '../../../API'
  import lcTable from '../../../components/table'
  @Component( {
    name: 'fillinBankSn',
    components: {
      lcTable
    }
  } )
  export default class FillinBankSn extends Vue {
    @Prop()
    value: boolean
    // @Prop( { default: [] } )
    // selectedData: [ object ]
    handleClose( bo = false ) {
      this.$emit( 'input', false )
    }
    handleSubmit() {
      if(!this.bankSn){
        this.$notify({
          type: 'error',
          message: '请输入银行流水'
        })
      }
      this.$emit('changeData',{bankSn:this.bankSn})
      this.handleClose(true)
      // this.validateAptitdude()
    }
    bankSn: any = ''
    @Inject() formatMyDate
  }
</script>