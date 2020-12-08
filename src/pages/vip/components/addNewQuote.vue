<template>
  <el-dialog
    title="新建集团报价"
    size="large"
    v-model="dialogVisible"
    v-if="promission[0] || promission[1]"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form label-width="100px">
      <!-- <el-form-item label="集团名称" v-if="tenantId">
        <tenant-search @broadcast="broadCastTenant" :text="tenant&&tenant.name"></tenant-search>
      </el-form-item>-->
      <el-form-item label="上传方式">
        <el-radio-group v-model="uploadType">
          <el-radio :label="0" v-if="promission[0]">文件上传</el-radio>
          <el-radio :label="1" v-if="promission[1]">手动上传</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="报价文件" v-if="uploadType===0 ">
        <input-file-upload @change="fileChange">
          <span style="fontSize:12px;">
            <template v-if="!file">请选择文件</template>
            <template v-else>{{file.name}}</template>
          </span>
        </input-file-upload>
      </el-form-item>
      <el-form-item label="商品信息" v-else>
        <association-product v-model="sourceData" :tenant="tenant" :has-price="false" :height="500"></association-product>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="text" @click="closeDialog()">取消</el-button>
      <el-button type="primary" @click="confirmUpload" :loading="uploadLoading">确认</el-button>
    </span>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
// import tenantSearch from '../../../components/tenantSearch/index.vue'
import inputFileUpload from '../../../components/inputFileUpload.vue'
import associationProduct from '../../../components/associationProduct.vue'
import API from '../../../API'

@Component( {
  name: 'add-new-quote',
  components: {
    inputFileUpload,
    // tenantSearch,
    associationProduct
  }
} )
export default class AddNewQuote extends Vue {
  @Prop()
  value: boolean
  get dialogVisible () {
    return this.value
  }
  set dialogVisible ( v ) {
    this.$emit( 'input', v )
  }
  @Prop()
  tenant: any
  @Prop( { default: () => [ true, true ] } )
  promission: [ boolean, boolean ]
  uploadType = 1
  // broadCastTenant ( tenant ) {
  //   this.tenant = tenant
  // }
  confirmUpload () {
    if ( this.uploadType === 0 ) {
      this.uploadFile()
    } else {
      this.uploadData()
    }
  }

  sourceData: any[] = []
  uploadData () {
    if ( !this.validateUploadData() ) {
      return
    }
    this.uploadLoading = true
    let option = this.computeUploadDataOption()
    this.$http( API.newCustomerQuote, option ).then( ( { data } ) => {
      this.closeDialog( 1, data )
      this.uploadLoading = false
    }, () => {
      this.uploadLoading = false
    } )
  }
  computeUploadDataOption () {
    let o: any = {}
    let { tenantId, tenantName, officeId, name } = this.tenant
    o.tenantId = tenantId
    o.tenantName = tenantName
    o.officeId = officeId
    o.officeName = name
    o.skuList = this.sourceData.filter( v => v.id ).map( ( { skuId, quotePrice } ) => ( {
      skuId,
      quotePrice
    } ) )
    o.broadcast = true
    o.quoteType = this.$route.path.indexOf( '/bmsQuote' ) == 0 ? 7 : undefined
    return o
  }
  validateUploadData () {
    let { tenantId } = this.tenant || { tenantId: undefined }
    if ( !tenantId ) {
      this.$notify( {
        type: 'error',
        message: '请输入集团名称'
      } )
      return false
    }
    let sourceData = this.sourceData.filter( v => v.id )
    if ( !sourceData.length ) {
      this.$notify( {
        type: 'error',
        message: '请选择报价商品'
      } )
      return false
    }
    return true
  }
  file: any = null
  fileChange ( e ) {
    this.file = e.target.files[ 0 ]
  }

  computeUploadFileOption () {
    let formData: any = new FormData()
    let { tenantId, officeId, name, tenantName } = this.tenant

    formData.append( 'tenantId', tenantId )
    formData.append( 'tenantName', tenantName )
    formData.append( 'officeId', officeId )
    formData.append( 'officeName', name )
    formData.append( 'file', this.file )
    if ( this.$route.path.indexOf( '/bmsQuote' ) == 0 ) {
      formData.append( 'channel', 1 )
    }

    formData.broadcast = true
    return formData
  }
  uploadFile () {
    if ( !this.validateUploadFile() ) {
      return
    }
    this.uploadLoading = true
    let formData = this.computeUploadFileOption()

    this.$http( API.uploadExcelFile, formData, {
      headers: {
        'content-type': 'multipart/form-data'
      }
    } ).then( ( { data } ) => {
      this.closeDialog( 1, data )
      this.uploadLoading = false
    }, () => {
      this.uploadLoading = false
    } )
  }
  validateUploadFile () {
    let { tenantId } = this.tenant || { tenantId: undefined }
    if ( !tenantId ) {
      this.$notify( {
        type: 'error',
        message: '请输入集团名称'
      } )
      return false
    }
    if ( !this.file ) {
      this.$notify( {
        type: 'error',
        message: '请选择需要上传的文件'
      } )
      return false
    }
    let { name = '' } = this.file
    let fileType = name.split( '.' ).slice( -1 )[ 0 ]
    if ( fileType !== 'xls' && fileType !== 'xlsx' ) {
      this.$notify( {
        type: 'error',
        message: '请选择后缀名为xls或者xlsx的excel文件'
      } )
      return false
    }
    return true
  }
  close ( data ) { }
  uploadLoading: boolean = false
  closeDialog ( bo = 0, data?) {
    this.file = null
    this.dialogVisible = false
    if ( bo ) {
      this.$emit( 'refresh' )
    }
    this.close( data )
  }
}
</script>
<style lang="stylus" scoped>
.el-table__body-wrapper
  z-index 99
</style>

