<template>
  <div class="quill-edit">
    <quill-editor ref="myQuillEditor" :disabled="disabled" v-model="content" :options="quillOption"></quill-editor>
  </div>
</template>

<script>
import http from '@/utils/http'
import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

/** *
 * img-uploaded-suc 图片上传成功会触发emmit
 * img-uploaded-fail 图片上传失败会触发emmit
 **/
export default {
  name: "quill-edit",
  components: {
    quillEditor
  },
  props: {
    disabled: { // 是否可以编辑
      required: false,
      default: false
    },
    imgUploadUrl: { // 图片上传接口的url
      required: false,
    },
    value: { // 富文本编辑器内容
      required: true,
      default: ''
    }
  },
  data() {
    return {
      quillOption: {},// 富文本编辑框配置,在created方法注入
      content: ''
    }
  },
  computed: {
    editor() {
      return this.$refs.myQuillEditor.quill
    }
  },
  watch: {
    value( val ) {
      this.content = val
    },
    content( val ) {
      this.$emit( 'input', val )
    }
  },
  methods: {
    initEditOption() {
      /* 富文本编辑图片上传配置*/
      const uploadConfig = {
        methods: 'POST',  // 必填参数 图片上传方式
        name: 'file',  // 必填参数 文件的参数名
        size: 1000,  // 可选参数   图片大小，单位为Kb, 1M = 1024Kb
        accept: 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon'  // 可选 可上传的图片格式
      };

      // toolbar工具栏的工具选项（默认展示全部）
      const toolOptions = [
        [ 'bold', 'italic', 'underline', 'strike' ],
        [ 'blockquote', 'code-block' ],
        [ { 'header': 1 }, { 'header': 2 } ],
        [ { 'list': 'ordered' }, { 'list': 'bullet' } ],
        [ { 'script': 'sub' }, { 'script': 'super' } ],
        [ { 'indent': '-1' }, { 'indent': '+1' } ],
        [ { 'direction': 'rtl' } ],
        [ { 'size': [ 'small', false, 'large', 'huge' ] } ],
        [ { 'header': [ 1, 2, 3, 4, 5, 6, false ] } ],
        [ { 'color': [] }, { 'background': [] } ],
        [ { 'font': [] } ],
        [ { 'align': [] } ],
        [ 'clean' ],
        [ 'link', 'image' ]
      ];
      let self = this;
      const handlers = {
        image: function image() {
          // this.container 代表的是富文本框的表头,下面这段逻辑是在富文本框塞进去一个input,并且
          let fileInput = this.container.querySelector( 'input.ql-image[type=file]' );
          console.log( this.container )
          if ( fileInput === null ) {
            fileInput = document.createElement( 'input' );
            fileInput.setAttribute( 'type', 'file' );
            // 设置图片参数名
            if ( uploadConfig.name ) {
              fileInput.setAttribute( 'name', uploadConfig.name );
            }
            // 可设置上传图片的格式
            fileInput.setAttribute( 'accept', uploadConfig.accept );
            // ql-image 样式已经被设置为display:none
            fileInput.classList.add( 'ql-image' );
            // 监听选择文件
            fileInput.addEventListener( 'change', function () {
              let file = fileInput.files[ 0 ]
              const formData = new FormData()
              formData.append( "file", file )

              http( self.imgUploadUrl, formData, {
                headers: {
                  'Content-type': 'multipart/form-data'
                }
              } ).then( ( { data } ) => {
                console.log( 'uploadOK', data )
                const { absolutePath, relativePath } = data
                let length = self.editor.getSelection( true ).index;
                // 这里很重要，你图片上传成功后，img的src需要在这里添加，res.path就是你服务器返回的图片链接。
                self.editor.insertEmbed( length, 'image', absolutePath );
                self.editor.setSelection( length + 1 )
                // 这里把上传成功的地址发射出去
                self.$emit( 'img-uploaded-suc', data )

              }, ( err ) => {
                console.log( '图片上传失败', err )
                self.$emit( 'img-uploaded-fail', err )
              } )

              fileInput.value = ''
            } );
            this.container.appendChild( fileInput );
          }
          fileInput.click();
        }
      };

      return {
        placeholder: '',
        theme: 'snow',  // 主题
        modules: {
          toolbar: {
            container: toolOptions,  // 工具栏选项
            handlers: handlers  // 事件重写
          }
        }
      }
    },
  },
  created() {
    this.quillOption = this.initEditOption()
  },
  activated() {
    this.content = this.value
  }
}
</script>

<style lang="stylus">
.ql-editor
  min-height 200px
</style>
