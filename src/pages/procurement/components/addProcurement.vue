<template>
  <el-dialog
    title="批量导入采购单"
    v-model="dialogVisible"
    v-if="promission[0] || promission[1]"
  >
    <el-form label-width="100px">
      <el-form-item label="采购单文件">
        <input-file-upload @change="fileChange">
          <span style="fontSize:12px;">
            <template v-if="!file">
                <el-button>请选择文件</el-button>
            </template>
            <template v-else>{{file.name}}</template>
          </span>
        </input-file-upload>
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
import API from '@/API'
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'
export default {
  name: 'add-procurement',
  components: {
    inputFileUpload
  },
  props: {
    value: {
      type: Boolean
    },
    promission: {
      default: () => [ true, true ]
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
    ...mapMutations( {
      addCommonSkuListByImport: 'procurement/addCommonSkuListByImport'
    } ),
    confirmUpload() {
      if ( !this.validateUploadFile() ) {
        return
      }
      this.uploadLoading = true
      let formData = this.computeUploadFileOption()
      this.$http( API.importProcurement, formData, {
        headers: {
          'content-type': 'multipart/form-data'
        }
      } ).then( ( { data } ) => {
        // TODO 这里加载根据后端的返回数据,解析,并传到前端,要考虑分页,最高1000条数据
        let lists = data.data
        let allSize = Object.keys(lists.items).length // 总的导入数量
        let successSize = lists.detail.length  //成功导入的数量
        this.$message( {
            title:'导入成功',
            message: `总导入${allSize}条,导入成功${successSize}条`,
            type: allSize===successSize?'success':'warning',
            showClose: true,
            duration:5000
        } )
        this.$emit( 'add-callback', data )
        this.closeDialog( 1 )
        this.uploadLoading = false
      }, ( {data} ) => {
        this.uploadLoading = false
        this.$message( {
          title:'导入失败',
          message: data.msg,
          type: 'error',
          showClose: true,
          duration:5000
        } )
      } )
    },
    fileChange( e ) {
      this.file = e.target.files[ 0 ]
    },
    computeUploadFileOption() {
      let formData = new FormData()
      formData.append( 'file', this.file )
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
    closeDialog( bo ) {
      this.file = null
      this.dialogVisible = false
      if ( bo ) {
        this.$emit( 'refresh' )
      }
    },
  }
}
</script>
<style lang="stylus" scoped>
.el-table__body-wrapper
  z-index 99
</style>

