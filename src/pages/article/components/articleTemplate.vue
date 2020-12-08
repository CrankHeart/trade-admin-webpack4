<template>
  <div class="article-info">
    <lc-title text="内容页管理"></lc-title>
    <el-form ref="myForm" :model="formData" key="landing" :rules="rules" label-width="80px">
      <el-form-item prop="name" label="名称">
        <el-col :sm="24">
          <el-input v-model.trim="formData.name" :disabled="oper==='detail'" clearable></el-input>
        </el-col>
      </el-form-item>

      <el-form-item prop="content" label="内容">
        <el-col :sm="24">
          <div>
            <quill-edit
              v-model="formData.content"
              :disabled="oper==='detail'"
              @img-uploaded-suc="imgUploadedSuc"
              @img-uploaded-fail="imgUploadedFail"
              :img-upload-url="imgUploadedUrl"
            ></quill-edit>
          </div>
        </el-col>
      </el-form-item>
      <el-form-item label v-if="oper!='detail'">
        <div class="btn-position">
          <el-button type="info" @click="save">{{oper=='create'?'新增':'保存'}}</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import lcTitle from '@/components/title.vue'
import API from '@/API'
import { mapActions } from 'vuex'
import quillEdit from '@/components/quillEdit.vue'

export default {
  name: "article-template",
  components: {
    lcTitle,
    quillEdit
  },
  props: {
    oper: { // 操作类型,新增,更新,详情
      required: false,
      default: 'edit'
    },
    data: {
      required: false,
      default: () => ( { id: null, name: '', content: '' } )
    }
  },
  data() {
    return {
      formData: {
        id: null,
        name: '',
        content: ''
      },
      rules: {
        name: [
          { required: true, trigger: 'blur', message: '请输入标题' }
        ],
        content: [
          { required: true, trigger: 'blur', message: '请输入内容' }
        ]
      }
    }
  },
  watch: {
    data( val ) {
      if ( val ) {
        this.initFormData()
      }
    }
  },
  computed: {
    imgUploadedUrl() {
      return API.uploadImgArticle
    }
  },
  methods: {
    ...mapActions( {
      updateArticle: 'article/updateArticle',
    } ),
    validate() {
      let myForm = this.$refs[ 'myForm' ]
      let bo = true
      myForm.validate( ( valid ) => {
        if ( !valid ) {
          this.$notify( {
            type: 'error',
            message: '请确认信息填写无误！'
          } )
          bo = false
        }
      } )
      return bo
    },
    formatEditParam() {
      return this.formData
    },
    imgUploadedSuc( data ) {
      console.log( data )
    },
    imgUploadedFail( data ) {
      console.log( data )
    },
    save() {
      // 检测权限 新增权限是1139,编辑时1140,搜索是1138
      if ( this.oper == 'create' ) {
        this.$permissionValidateWithNotify( 1139 )
      } else if ( this.oper == 'edit' ) {
        this.$permissionValidateWithNotify( 1140 )
      }
      if ( !this.validate() ) {
        return
      }
      let param = this.formatEditParam();
      this.updateArticle( param ).then( ( { data } ) => {
        this.$message( {
          message: '修改成功',
          type: 'success'
        } )
        setTimeout( () => {
          this.$router.back();
        }, 1000 )
      } ).catch( err => {
        this.$message( {
          message: err.data.msg,
          type: 'warning'
        } )
      } )
    },
    cancel() {
      this.$router.back()
    },
    initFormData() {
      if ( this.formData ) {
        let keys = Object.keys( this.formData )
        if ( keys.length > 0 ) {
          keys.forEach( v => {
            this.formData[ v ] = this.data[ v ]
          } )
        }
      }

    }
  },
  activated() {
    this.initFormData()
  }
}
</script>
