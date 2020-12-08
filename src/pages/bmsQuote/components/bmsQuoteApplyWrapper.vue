<template>
  <div class="bms-quote-apply">
    <el-form label-width="100px">
      <el-form-item label="上传方式">
        <el-radio-group v-model="uploadType">
          <el-radio :label="0" v-if="promission[0]">文件上传</el-radio>
          <el-radio :label="1" v-if="promission[1]">手动上传</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="报价文件" v-if="uploadType===0">
        <input-file-upload @change="fileChange">
          <span style="fontSize:12px;">
            <template v-if="!file">请选择文件</template>
            <template v-else>{{file.name}}</template>
          </span>
        </input-file-upload>
      </el-form-item>
      <el-form-item label="商品信息" v-else>
        <association-product v-model="sourceData" :tenant="tenant" :has-price="false"></association-product>
      </el-form-item>
    </el-form>
    <div class="footer">
      <el-button size="small" type="text" @click="closeDialog()">取消</el-button>
      <el-button size="small" type="primary" @click="confirmUpload" :loading="uploadLoading">确认报价</el-button>
    </div>
  </div>
</template>
<script lang="ts">
import AddNewQuote from '../../vip/components/addNewQuote.vue'
import associationProduct from '../../../components/associationProduct.vue'

import { Component } from 'vue-property-decorator'


import { bmsMessage } from '../../../plugins/bms'

@Component( {
  name: 'bms-quote-apply-wrapper'
} )
export default class BmsQuoteApplyWrapper extends AddNewQuote {
  close ( {data = {}} = {} ) {
    let { bigCustomerQuoteId, id } = data
    let { tenantId, officeId } = this.tenant
    this.$router.replace( `/bmsQuote/detail/?quoteId=${bigCustomerQuoteId || id}&auditStatus=0&tenantId=${tenantId}&officeId=${officeId}&applyType=7` )
    // http://localhost:6061/#/bmsQuote/detail/?quoteId=1089&auditStatus=0&tenantId=e8a5b2d4-4ff9-4bad-b0fe-dbfca2d95deb&officeId=4&applyType=5
    bmsMessage({
      action: 'quoteApply',
      ...data
    })
  }
}
</script>
<style lang="stylus" scoped>
.bms-quote-apply
  position relative
  padding-bottom 50px
  .footer
    position fixed
    left 0
    right 0
    bottom 0
    line-height 40px
    border-top 1px solid #eeeeee
    background #fff
    text-align right
    padding 0 12px
    box-sizing border-box
    z-index 9
</style>

