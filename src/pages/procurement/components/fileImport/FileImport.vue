<template>
  <!--  文件导入  文件可以单独抽出来独立使用 -->
  <div class="file-import">
    <el-dialog
      :title="title"
      :modal="true"
      :visible.sync="dialogVisible"
      @close="closeDialog"
      custom-class="customWidth"
      :width="'1000px'"
      top="70px"
    >
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>上传文件</span>
        </div>
        <el-form
          ref="form"
          label-position="right"
          :model="formData"
          :rules="ruleValidate"
          label-width="100px"
        >
          <!-- fileList:{{fileList}} -->
          <el-form-item label="Excel文件：">
            <!-- :auto-upload="false" :http-request="httpRequest" -->
            <div style="display:flex;">
              <el-upload
                ref="upload"
                :action="`${url+uploadUrl}`"
                :show-file-list="true"
                :before-upload="handleBeforeUpload"
                :multiple="false"
                :file-list="fileList"
                :on-change="handleChange"
                :on-success="handleSuccess"
                :on-remove="handleRemove"
                :data="params"
                :limit="1"
              >
                <!-- <el-input
              type="text"
              v-model="filename"
              clearable
              :placeholder="placeholder"
              style="width: 200px"
                ></el-input>-->
                <el-button slot="trigger" size="small" type="primary">点击上传</el-button>
                <!-- <el-button
                  style="margin-left: 10px;"
                  size="small"
                  type="success"
                  @click="confirmUpload"
                  :disabled="cantImport"
                >确认导入</el-button>-->
                <div slot="tip" class="el-upload__tip">
                  <span style="color:red;">{{tips}}</span>
                  <!-- 导入模板 -->
                  <span style="margin-left: 8px">
                    <a
                      v-if="$permissionValidate(492) && downUrl"
                      href="javascript:;"
                      @click="download"
                    >（点击下载模板）</a>
                  </span>
                </div>
              </el-upload>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>导入记录</span>
        </div>
        <div class="tableList">
          <div style="color:red;margin:10px 0;">如果上传的文件有错误，会在下方有提示，请更改信息后重新上传模板，只有全部上传成功才允许导入</div>
          <!-- <div style="margin:10px 0;">
            <el-button slot="trigger" size="small" type="primary">导&nbsp;&nbsp;出</el-button>
          </div>-->
          <IcTableConfig :base-config="baseConfig" @set-config="setConf"></IcTableConfig>
          <IcTable
            :config="config"
            :max-height="500"
            :data="tableData"
            :has-page="false"
            :key="config.length"
          >
            <template slot-scope="{row,con}">
              <template>{{ row[con.prop] }}</template>
            </template>
          </IcTable>
        </div>
      </el-card>
    </el-dialog>
  </div>
</template>
<script>

import IcTableConfig from "@/components/table/control.vue";
import IcTable from "@/components/table";

import API, { baseURL } from "@/API"
import props from "./props";

// 文件大小限制2M
const MAXFILESIZE = 2 * 1024 * 1024; // 2097152
export default {
  name: "FileImport",
  components: { IcTableConfig, IcTable, },
  props,
  computed: {
    config() {
      return this.baseConfig.filter( ( item ) => item.isChecked );
    },
  },
  watch: {
    showFileImport: {
      handler() {
        this.dialogVisible = this.showFileImport;
      },
      immediate: true
    },
    tableConfig: {
      handler() {
        this.baseConfig = this.tableConfig.map( ( item ) => {
          item.isChecked = true;
          return item;
        } );
      },
      immediate: true
    }
  },
  data() {
    return {
      dialogVisible: false,
      fileList: [],
      url: baseURL,
      isShow: true,

      file: null,
      loadingStatus: false,
      cantImport: true,
      filename: "",
      uploadList: [],
      formData: {},
      ruleValidate: {},
      baseConfig: [],
      tableData: []
    };
  },
  created() { },
  methods: {
    setConf( props ) {
      this.baseConfig = this.baseConfig.map( ( item ) => {
        item.isChecked = props.includes( item.prop );
        return item;
      } );
    },
    confirmUpload() {
      // console.log( "确认导入"  );
      console.log( "confirmUpload" );
      this.$http( API._ ).then( ( { data } ) => { } );
    },
    // 自己手动控制上传 
    async httpRequest() {
      console.log( "httpRequest" );
      let fd = new FormData();
      fd.append( "file", this.file ); // append方法传入formData中

      // 额外参数
      Object.keys( this.params ).forEach( key => {
        fd.append( key, this.params[ key ] );
      } );

      const res = await this.$http( this.uploadUrl, fd, {
        headers: {
          'content-type': 'multipart/form-data'
        }
      } );
      const { code, msg, data } = res.data;
      console.log( "httpRequest end res", res );
      // const { code, msg, data } 
      console.log( "httpRequest end ", code, msg, data );
    },
    handleChange( file, fileList ) {
      // 只能上传一个文件  这一步，是 展示最后一次选择的文件
      this.fileList = fileList.slice( -1 );
    },
    handleRemove( file, fileList ) {
      // console.log( "handleRemove", file, fileList );
    },
    handleSuccess( res, file ) {
      // 自己处理上传httpRequest 通过自己控制上传 handleSuccess 的res 返回的是undefined
      // 一切交给组件进行控制文件上传
      console.log( "handleSuccess end res", res, file );
      const { code, msg, data } = res;
      if ( code == "A0000" ) {
        // 刷新列表数据 回传服务端返回内容
        if ( data ) {
          this.tableData = data;
        } else {
          this.$emit( "refresh", data );
          this.msgOk( msg );
          this.closeDialog();
        }
        // this.cantImport = data.length>0;
      } else {
        this.msgErr( msg );
      }
    },
    download() {
      this.$submit( this.downUrl )
    },
    handleFormatError( file ) {
      this.$notify.warning( {
        title: "文件格式错误",
        message: `请上传以${this.fileTypes}结尾的文件.`,
      } );
    },
    handleMaxSize( file ) {
      this.$notify.warning( {
        title: "文件大小",
        message: "文件最大只能上传2M.",
      } );
    },
    handleBeforeUpload( file ) {
      console.log( "handleBeforeUpload" );
      this.file = null; // 超过大小将文件清空
      this.filename = "";

      const filename = file.name;
      const fileSize = file.size;

      const fileExt = filename.replace( /.+\./, "" ); // 取得文件的后缀名
      // // if (file.size > 2097152) {
      // 判断文件格式 ["xlsx", "xls", "csv"]
      if ( !this.fileTypes.includes( fileExt.toLowerCase() ) ) {
        this.handleFormatError( file );
        return false;
      }
      if ( fileSize > MAXFILESIZE ) {
        // 限制文件的大小
        this.handleMaxSize( file );
        return false;
      }

      this.file = file;
      this.filename = filename;
      console.log( "fileExt:", fileExt );
      return true;
    },
    closeDialog() {
      // 关闭对话框清除表单数据
      console.log( "closeDialog" );
      this.dialogVisible = false;
      this.$emit( `update:showFileImport`, false );
    },
    // 全局提示
    msgOk( message ) {
      this.$message( {
        type: 'success',
        showClose: true, // 默认false 没有关闭按钮
        message,
        duration: 3000, // 默认3秒
      } );
    },
    msgErr( message ) {
      this.$message.error( message );
    }
  },
};
</script>
<style scoped>
.customWidth {
  width: 80%;
}
/**
使用方法：

// 文件上传组件
import FileImport from "./FileImport";

<!-- 文件上传弹框 -->
<FileImport
  v-if="showFileImport"
  :showFileImport.sync="showFileImport"
  placeholder="请选择xlsx,cvs,txt文件进行上传"
  uploadUrl="/campaginGrabInfoSet/upload/barcodeToMoney"
  templateUrl="/template/upload_goodscode_template.csv"
  :params="uploadData"
  @refresh="updateTableList"
></FileImport>

components: { FileImport },
data() {
  return {
    // 文件下载对话框
    showModalDownload: false,
    // 文件上传
    showFileImport: false,
    uploadData: {},
  };
},
methods: {
  // 文件上传
  upload() {
    this.showFileImport = true;
  },
},
 */
</style>