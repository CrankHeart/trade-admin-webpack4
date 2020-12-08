<template>
  <el-row class="business-invoice">
    <el-col :span="12">
      <el-card >
        <div slot="header">
          发票配置
          <template v-if="editStatus" >
            <el-button class="pull-right" type="primary" size="small" @click="toggleEditStatus">编辑</el-button>
          </template>
          <template v-else>
            <el-button class="pull-right" type="primary" size="small" @click="submit">保存</el-button>
            <el-button class="pull-right" size="small" @click="toggleEditStatus">取消</el-button>
          </template>
        </div>
        <el-form size="small" label-width="120px">
          <template v-for="item in config">
            <el-form-item :key="item.prop" :label="item.label">
              <el-input v-model="myInvoice[item.prop]" :disabled="editStatus"></el-input>
            </el-form-item>
          </template>
        </el-form>
      </el-card>
    </el-col>
  </el-row>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import API from '../../../API/'

@Component
export default class BusinessInvoice extends Vue {
  @Prop()
  detail: any
  myInvoice: any = {}
  get storeInvoiceInfo(){
    return this.detail && this.detail.storeInvoiceInfo || {}
  }
  @Watch( 'detail', { immediate: true } )
  detailWatcher( detail ){
    this.myInvoice = Object.assign( {}, this.storeInvoiceInfo )
  }
  editStatus = true
  config = [
    { prop: 'sellerTin', label: '税号' },
    { prop: 'identity', label: '身份识别号' },
    { prop: 'applyUrl', label: '申请发票请求url' },
    { prop: 'queryUrl', label: '查询发票请求url' },
    { prop: 'drawer', label: '开票人' },
    { prop: 'drawerPhone', label: '开票方电话' },
    { prop: 'saleAddress', label: '开票方地址' }
  ]
  submit () {
    let hasChange = this.config.some( ( { prop } ) => this.storeInvoiceInfo[ prop ] !== this.myInvoice[ prop ] )
    if ( hasChange ) {
      this.save()
    } else {
      this.toggleEditStatus()
    }
  }
  save () {
    this.$http( API.saveStoreInvoiceInfo, {
      ...this.myInvoice,
      storeId:this.detail.id,
      broadcast: true
    } ).then(({data})=>{
      Object.assign( this.detail, { storeInvoiceInfo: data.data } )
      this.toggleEditStatus()
    })
  }
  toggleEditStatus(){
    this.editStatus = !this.editStatus
  }
}
</script>