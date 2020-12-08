<template>
  <div id="product-import">
    <lc-title text="商品导入"></lc-title>
    <p style="color:#20a0ff;">* 按照如下流程正确导入文件</p>

    <p>从服务器上获取模板文件。</p>
    <p v-if="$permissionValidate(492)">
      <el-button type="primary" @click="download">下载模板</el-button>
    </p>
    <p>选择需要上传的模板以及压缩数据包</p>
    <el-row :gutter="30">
      <el-col :span="12" :xs="24">
        <div class="el-upload el-upload--text">
          <div class="el-upload-dragger">
            <i class="el-icon-upload"></i>
            <p>
              <el-tooltip placement="bottom">
                <div slot="content" v-html="`在模板中输入所需要的信息,模板文件的大小只能<br />小于1M`"></div>
                <i class="el-icon-information"></i>
              </el-tooltip>
              <span v-if="filePath">已</span>上传模板
              <em class="filename">{{filePath}}</em>
            </p>
          </div>
          <div
            v-for="(file,index) in files.filePath"
            v-if="files.filePath.length-1 == index"
            :key="file.name"
          >
            <input type="file" name="filePath" @change="fileChange" />
          </div>
        </div>
      </el-col>
      <el-col :span="12" :xs="24">
        <div class="el-upload el-upload--text">
          <div class="el-upload-dragger">
            <i class="el-icon-upload"></i>
            <p>
              <el-tooltip placement="bottom">
                <div
                  slot="content"
                  v-html="`如果需要上传图片，请将图片添加至文件夹，并将<br />文件夹压缩成zip格式的压缩文件<br />（压缩文件的大小只能小于30M），然后上传`"
                ></div>
                <i class="el-icon-information"></i>
              </el-tooltip>
              <span v-if="imgPath">已</span>选择压缩数据包
              <em class="filename">{{imgPath}}</em>
            </p>
          </div>
          <div
            v-for="(file,index) in files.imgPath"
            v-if="files.imgPath.length-1 ==index"
            :key="file.name"
          >
            <input type="file" name="imgPath" @change="fileChange" />
          </div>
        </div>
      </el-col>
    </el-row>
    <div>
      <p v-if="$permissionValidate(493)">
        <el-button type="primary" @click="importProduct">导入商品</el-button>
      </p>
      <p>如果上传的文件有错误，会在下方有提示，请更改信息后重新上传模板</p>
    </div>
    <div v-if="msg">
      <h4>{{msg}}</h4>
      <div v-if="complete">
        <p>
          共导入商品{{statusData.errorNum*1 + statusData.rightNum*1}}种， 成功&nbsp;
          <el-tag type="success">{{statusData.rightNum}}</el-tag>&nbsp;种， 失败&nbsp
          <el-tag type="danger">{{statusData.errorNum}}</el-tag>&nbsp;种
        </p>
        <ul v-if="!!errorMsg[0]" class="err-msg">
          <li v-for="(item, index) in errorMsg" :key="index">-- {{item}}</li>
        </ul>
        <el-pagination
          :page-size="page.size"
          class="center"
          @current-change="curChange"
          layout="total, prev, pager, next"
          :total="statusData.errorNum*1"
          v-if="!!errorMsg[0]"
        ></el-pagination>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Prop, Inject } from "vue-property-decorator"
import lcTitle from "../../components/title.vue"
import API, { baseURL } from "../../API"
import { isNotEmptyObj } from "../../utils"
// import "../../vuex/import"
import { State, Mutation, Action, namespace } from "vuex-class"

const ImportState = namespace( "import", State )

interface files {
  filePath: any[]
  imgPath: any[]
}
@Component( {
  name: "product-import",
  components: {
    lcTitle
  }
} )
export default class productImport extends Vue {
  uploadLink: string = API.product.upload
  files: files = {
    filePath: [ {} ],
    imgPath: [ {} ]
  }
  timer = void 0
  page = {
    cur: 1,
    size: 20
  }
  @ImportState( "complete" ) complete

  @ImportState( "msg" ) msg

  @ImportState( "statusData" ) statusData

  get filePath () {
    const file = this.files.filePath[ 0 ].files
    return file && file[ 0 ].name
  }
  get imgPath (): [ string ] {
    return this.files.imgPath[ 0 ].files && this.files.imgPath[ 0 ].files[ 0 ].name
  }

  get errorMsgAll () {
    return this.statusData.errorMsg.split( ";" )
  }
  get errorMsg () {
    if ( this.page.size >= this.statusData.errorNum ) {
      return this.errorMsgAll
    } else {
      const page = this.page
      return this.errorMsgAll.slice(
        ( page.cur - 1 ) * page.size,
        page.cur * page.size
      )
    }
  }
  destoryed () {
    clearInterval( this.timer )
  }

  download () {
    this.$submit( API.product.download )
  }
  fileChange ( $event ) {
    let target = $event.target
    let name = target.name
    this.files[ name ].unshift( target )
  }
  importProduct () {
    let filePath = this.files.filePath[ 0 ],
      imgPath = this.files.imgPath[ 0 ]
    if ( !isNotEmptyObj( filePath ) ) {
      return this.$notify( {
        message: "模板未上传哦！",
        type: "error"
      } )
    }
    this.upload( {
      filePath: filePath.files[ 0 ],
      imgPath: imgPath.files && imgPath.files[ 0 ]
    } )
  }

  @Mutation( "import/change" ) importChange
  @Action( "import/checkStatus" ) checkStatus
  upload ( o ) {
    let myFormData = new FormData()

    myFormData.append( "filePath[0]", o.filePath )
    myFormData.append( "imgPath[0]", o.imgPath )

    this.$http( API.product.upload, myFormData, {
      headers: {
        "content-type": "multipart/form-data"
      }
    } ).then( ( { data } ) => {
      this.importChange( { msg: data.msg, complete: false } )
      this.checkStatus( API.product.status )
    }, ( { data } ) => {
      this.importChange( { msg: data.msg, complete: false } )
      this.importChange( { statusData: { errorMsg: "" } } )
    } ).catch( err => { } )
  }
  curChange ( val ) {
    this.page.cur = val
  }
}
</script>
<style lang="stylus" scoped>
input[type='file']
  position absolute
  left 0
  top 0
  width 100%
  height 100%
  opacity 0
  cursor pointer
.err-msg
  line-height 30px
  padding 0 15px
.filename
  color #4db3ff
  display block
p
  margin 1em 0
.el-col
  text-align center
.el-tooltip
  position relative
  z-index 9999
.el-upload-dragger
  width 100%
  max-width 360px
.el-upload
  position relative
  width 100%
  max-width 360px
  &:hover
    .el-upload-dragger
      border-color #009cb8
</style>


