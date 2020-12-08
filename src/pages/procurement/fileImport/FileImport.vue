<template>
  <!--  文件导入  文件可以单独抽出来独立使用 -->
  <div class="file-import">
    <el-dialog
      :title="title"
      :modal="true"
      :visible.sync="showFileImport"
      @close="closeDialog"
      custom-class="customWidth"
      :width="'1000px'"
      top="70px"
    >
      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>文件上传</span>
        </div>
        <el-form
          ref="form"
          label-position="right"
          :model="formData"
          :rules="ruleValidate"
          label-width="100px"
        >
          fileList:{{fileList}}
          <el-form-item label="文件上传：">
            <div style="display:flex;">
              <el-upload
                ref="upload"
                :action="`${url+uploadUrl}`"
                :show-file-list="true"
                :before-upload="handleBeforeUpload"
                :multiple="false"
                :file-list="fileList"
                :auto-upload="false"
                :on-success="handleSuccess"
                :on-remove="handleRemove"
                :data="params"
              >
                <!-- <el-input
              type="text"
              v-model="filename"
              clearable
              :placeholder="placeholder"
              style="width: 200px"
                ></el-input>-->
                <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
                <el-button
                  style="margin-left: 10px;"
                  size="small"
                  type="success"
                  @click="submitUpload"
                >上传到服务器</el-button>
                <div slot="tip" class="el-upload__tip">
                  <span style="color:red;">{{tips}}</span>
                  <!-- 导入模板 -->
                  <span style="margin-left: 8px">
                    <a
                      v-if="$permissionValidate(492) && downUrl"
                      href="javascript:;"
                      @click="download"
                    >（点击下载模板）</a>
                    <!-- <a v-if="templateUrl" :href="templateUrl">（点击下载模板）</a> -->
                  </span>
                </div>
              </el-upload>
              <!-- 导入模板 -->
              <div style="flex:1;margin-left: 8px">
                <!-- <a v-if="downUrl" href="javascript:;" @click="downloadTemplate">模板文件</a>
                <a v-if="templateUrl" :href="templateUrl">模板文件</a>-->
              </div>
            </div>
            <div v-if="file !== null">
              <el-button type="text" :loading="loadingStatus">{{ loadingStatus ? '正在上传' : '' }}</el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- <div>
        <el-button @click="closeDialog">取消</el-button>
        <el-button :disabled="!file" type="error" @click="upload" style="margin-left: 8px">上传</el-button>
      </div>-->

      <el-card class="box-card">
        <div slot="header" class="clearfix">
          <span>导入记录</span>
        </div>
        <div class="tableList">
          <div style="color:red;margin:10px 0;">如果上传的文件有错误，会在下方有提示，请更改信息后重新上传模板，只有全部上传成功才允许导入</div>
          <div style="margin:10px 0;">
            <el-button slot="trigger" size="small" type="primary">导出</el-button>
          </div>
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

// 2M
const MAXFILESIZE = 2 * 1024 * 1024; // 2097152
export default {
  name: "FileImport",
  components: { IcTableConfig, IcTable, },
  props: {
    showFileImport: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "", // 文件上传 对话框标题 导入条码文件
    },
    placeholder: {
      type: String,
      default: "请上传文件", // 请选择xlsx文件进行上传
    },
    tips: {
      type: String,
      default: "请上传excel文件", // 请上传excel文件/请上传xlsx,xls文件，最多5000条记录 ，
    },
    uploadUrl: {
      type: String,
      default: "", // 文件上传路径
    },
    downMethod: {
      type: String,
      default: "get", // get/post
    },
    downUrl: {
      type: String,
      default: "", // 模板地址下载路径 服务器下载
    },
    templateUrl: {
      type: String,
      default: "", // 模板地址下载路径 本地下载
    },
    params: {
      type: Object,
      default: () => ( {} ), // 文件上传额外参数
    },
    fileTypes: {
      type: Array,
      default: () => [ "xlsx", "xls", "csv" ],
    },
  },
  computed: {
    config() {
      return this.baseConfig.filter( ( item ) => item.isChecked );
    },
  },
  data() {
    return {
      fileList: [],
      url: baseURL, // http://192.168.31.134:8088/zex-mgr
      isShow: true,

      file: null,
      loadingStatus: false,
      filename: "",
      uploadList: [],
      formData: {},
      ruleValidate: {},

      baseConfig: [
        { prop: 'lcSkuCode', label: 'SKU编码', width: '230px' },
        { prop: 'deliveryDate', label: '交付日期' },
        { prop: 'purchasePlanNum', label: '采购数' },
        { prop: 'remark', label: '失败结果' }
      ],
      tableData: []
    };
  },
  created() {
    this.baseConfig = this.baseConfig.map( ( item ) => {
      item.isChecked = true;
      return item;
    } );

    for ( let i = 0; i < 1000; i++ ) {
      let x = [ "name", "date", "address", "control" ]
      let json = {};
      x.forEach( ( name, index ) => {
        json[ name ] = `${name}${i}`
      } );
      this.tableData.push( json );
    }
  },
  methods: {
    setConf( props ) {
      this.baseConfig = this.baseConfig.map( ( item ) => {
        item.isChecked = props.includes( item.prop );
        return item;
      } );
    },

    submitUpload() {
      this.$refs.upload.submit();

      // this.$submit( API.exportPlanSkuSumSnapshot, {
      //   ...param,
      //   purchasePlanId: this.purchasePlanId,
      // } )
    },
    handleRemove( file, fileList ) {
      console.log( "handleRemove", file, fileList );
    },
    handleSuccess( res, file ) {
      console.log( "handleSuccess", res, file );
      const { code, msg, data } = res;
      if ( code == "A0000" ) {
        // 刷新列表数据 回传服务端返回内容
        // this.$emit( "refresh", data );
        this.tableData = data;
        this.msgOk( "文件上传成功" );
      } else {
        this.msgErr( msg );
      }
    },
    async upload() {
      // this.$refs.upload.post(this.file);
      this.loadingStatus = true;
      // const url = "/campaginGrabInfoSet/upload/barcodeToMoney";
      let fd = new FormData();
      fd.append( "file", this.file ); // append方法传入formData中

      // 额外参数
      Object.keys( this.params ).forEach( key => {
        fd.append( key, this.params[ key ] );
      } );

      // const { code, msg, data } = await uploadFileRequest( this.uploadUrl, fd );

      // if ( code == 200 ) {
      //   // this.msgOk("保存成功");
      //   // 关闭对话框
      //   this.closeDialog();
      //   //刷新列表数据 回传服务端返回内容
      //   this.$emit( "refresh", data );
      //   this.msgOk( "文件上传成功" );
      // } else if ( code == 500 ) {
      //   this.msgErr( msg );
      // } else {
      //   this.msgErr( msg );
      // }

      this.file = null;
      this.loadingStatus = false;
    },
    download() {
      this.$submit( this.downUrl )
    },
    handleFormatError( file ) {
      this.$notify.warning( {
        title: "文件格式错误",
        desc: `请上传以${this.fileTypes}结尾的文件.`,
      } );
    },
    handleMaxSize( file ) {
      this.$notify.warning( {
        title: "文件大小",
        desc: "文件最大只能上传2M.",
      } );
    },
    handleBeforeUpload( file ) {
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
      } else if ( fileSize > MAXFILESIZE ) {
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
    },
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