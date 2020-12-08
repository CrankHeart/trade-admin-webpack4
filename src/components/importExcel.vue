<template>
  <el-dialog :title="title" v-model="dialogVisible">
    <el-form :inline="true" class="demo-form-inline">
      <el-form-item>
        <input-file-upload @change="fileChange" v-if="dialogVisible">
          <span style="fontSize:12px;">
            <template v-if="!file">
              <el-button>请选择文件</el-button>
            </template>
            <template v-else>{{file.name}}</template>
          </span>
        </input-file-upload>
      </el-form-item>
      <el-form-item v-if="downloadUrl">
        <el-button @click="download">下载模板</el-button>
      </el-form-item>
    </el-form>
    <span slot="footer">
      <el-button type="text" @click="closeDialog()">取消</el-button>
      <el-button type="primary" @click="confirmUpload" :loading="uploadLoading">确认</el-button>
    </span>
  </el-dialog>
</template>
<script>
import inputFileUpload from '@/components/inputFileUpload.vue'
export default {
  name: 'import-excel',
  components: {
    inputFileUpload
  },
  props: {
    url: {
      type: String,
      required: true
    },
    downloadUrl: {
      type: String,
      required: false
    },
    title: {
      type: String
    },
    value: {
      type: Boolean
    },
    params: {
      type: Object,
      default: () => ( {} )
    }
  },
  data() {
    return {
      file: null,
      uploadLoading: false
    }
  },
  computed: {
    dialogVisible: {
      get: function () {
        return this.value
      },
      set: function ( value ) {
        this.$emit( 'input', value )
      }
    }
  },
  methods: {
    download() {
      this.$submit( this.downloadUrl )
    },
    confirmUpload() {
      if ( !this.validateUploadFile() ) {
        return
      }
      this.uploadLoading = true
      let formData = this.computeUploadFileOption()
      this.$http( this.url, formData, {
        headers: {
          'content-type': 'multipart/form-data'
        }
      } ).then( ( { data } ) => {
        this.$emit( 'file-upload-suc', data )
        this.closeDialog()
        this.uploadLoading = false
      }, ( { data } ) => {
        this.uploadLoading = false
        this.$emit( 'file-upload-err', data )
      } )
    },
    fileChange( e ) {
      this.file = e.target.files[ 0 ]
    },
    computeUploadFileOption() {
      let formData = new FormData()
      formData.append( 'file', this.file )
      if ( Object.keys( this.params ).length > 0 ) {
        Object.keys( this.params ).forEach( key => {
          formData.append( key, this.params[ key ] )
        } )
      }
      return formData
    },
    validateUploadFile() {
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
    },
    closeDialog() {
      this.file = null
      this.dialogVisible = false
    }
  }
}
</script>
<style lang="stylus" scoped>
.el-table__body-wrapper
  z-index 99
</style>

