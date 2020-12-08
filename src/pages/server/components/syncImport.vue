<template>
  <div>
    <import-excel
      :url="importUrl"
      title="导入"
      :params="params"
      v-model="showImportDialog"
      :downloadUrl="downloadUrl"
      @file-upload-suc="fileUploadSuc"
      @file-upload-err="fileUploadErr"
    ></import-excel>
    <el-dialog :title="errDialogMsg" v-model="showErrorDialog">
      <el-form v-if="errorMsg.status==3">
        <div style="text-align:right">成功:{{errorMsg.successNum}} / 失败:{{errorMsg.failedNum}}</div>
        <div style="margin:15px auto;">
          <el-progress
            :show-text="true"
            :text-inside="true"
            :stroke-width="18"
            :percentage="percentage"
            status="success"
          ></el-progress>
        </div>
        <div
          style="width:100%;max-height:500px; overflow:auto;"
          v-if="errorMsg.rowErrors && errorMsg.rowErrors.length>0"
        >
          <ul>
            <li
              v-for="(item,index) in errorMsg.rowErrors"
              :key="index"
            >行数:{{item.rowId}} ,结果: {{item.errorMessage}}</li>
          </ul>
        </div>
      </el-form>
      <el-form v-else-if="errorMsg.status==4">
        <div>导入出错: {{errorMsg.msg}}</div>
      </el-form>
    </el-dialog>
  </div>
</template>
<script>
/**
 * 异步导入跟异步导出有所不同
 * 异步导出可以批量导出
 * 异步导入只能导入一个文件
 */
import syncImport from '@/pages/server/components/syncImport.vue'
import importExcel from '@/components/importExcel.vue'
export default {
  name: 'sync-import',
  props: {
    taskUrl: String,
    importUrl: String,
    downloadUrl: String,
    visibleDialog: false,
    checkTastStatusUrl: String,
    params: Object,
    value: Boolean,
    errDialogMsg: {
      type: String,
      default: '导入结果'
    }
  },
  components: {
    importExcel
  },
  data() {
    return {
      showImportDialog: false,
      showErrorDialog: false, // 是否显示错误弹窗
      taskLineList: [],  // 异步导入队列
      taskIsRun: false, // 异步队列是否正在执行
      taskTimerId: undefined,
      MAX_TASK_TIMES: 999, // 为了优化性能,这里设置多任务执行时间
      taskMaxTime: 0,
      mockTime: 1,
      mockData: {},
      errorMsg: { successNum: 0, failedNum: 0, rowErrors: [] }
    }
  },
  watch: {
    taskLineList( val ) {
      if ( val && val.length == 0 ) {
        this.stopExportTask()
      } else {
        this.startTask()
      }
    },
    value( val ) {
      this.showImportDialog = val
    },
    showImportDialog( val ) {
      this.$emit( 'input', val )
    }
  },
  computed: {
    percentage() {
      return Math.round( ( this.errorMsg.successNum / ( this.errorMsg.successNum + this.errorMsg.failedNum ) ) * 100 )
    }
  },
  methods: {
    showErrDialog() {
      this.showErrorDialog = true
    },
    removeTask() {
    },
    emitOk( okLists ) {
      this.$emit( 'taskOk', okLists )
    },
    emitFail( failLists ) {
      this.$emit( 'taskFail', failLists )
    },
    stopExportTask() {
      clearInterval( this.taskTimerId )
      this.taskIsRun = false
      this.taskTimerId = undefined
      this.mockTime = 1
    },
    startTask() {
      this.taskMaxTime = 0
      if ( this.taskIsRun == true ) {
        return;
      }
      this.taskIsRun = true
      this.taskTimerId = setInterval( () => {
        this.taskMethod()
      }, 5000 );
    },
    // 取出已经处理的队列,包括成功跟失败job
    removeOkTask( okJobs ) {
      let lineListTemp = this.taskLineList.filter( itemId => {
        return okJobs.findIndex( itemOk => itemOk.jobId == itemId ) == -1
      } )
      this.taskLineList = lineListTemp
    },
    taskMethod() {
      if ( this.taskMaxTime >= this.MAX_TASK_TIMES ) {
        this.stopExportTask()
        return;
      }
      if ( this.taskLineList && this.taskLineList.length == 0 ) {
        return;
      }
      // NOT_STARTED("1", "未开始"),    IN_PROGRESS("2", "进行中"),    COMPLETED("3", "已结束"),    FAILED("4", "失败");
      // 查询单个接口
      let jobId = this.taskLineList[ 0 ]
      this.$http( this.checkTastStatusUrl, { jobId: jobId } ).then( ( { data } ) => {
        this.taskMaxTime++
        let retData = data;
        if ( retData.status == "3" ) {
          // successNum
          let retInfo = Object.assign( retData, { jobId, exportStatus: retData.status } )
          this.emitOk( retInfo )
          this.removeOkTask( [ { jobId: jobId } ] )
          this.initMsgToDialog( Object.assign( retData.msg, { jobId, status: 3 } ) )
        } else if ( retData.status == "4" ) {
          let retInfo = Object.assign( retData, { jobId, exportStatus: retData.status } )
          this.emitFail( retInfo )
          this.removeOkTask( [ { jobId: jobId } ] )
          this.initErrorMsg( Object.assign( retData.msg, { jobId, status: 4 } ) )
        }
      } ).catch( err => {
        console.log( 'err', err )
        // console.log('轮状态查询接口错误,停止轮询')
        this.stopExportTask()
        this.initErrorMsg( '轮状态查询接口错误' )
      } )
    },
    initMsgToDialog( retData ) {
      this.errorMsg = retData
    },
    initErrorMsg( msg ) {
      this.initMsgToDialog( {
        status: 4,
        successNum: 0,
        failedNum: 0,
        msg: msg || '未知错误'
      } )
    },
    fileUploadSuc( retData ) {
      let jobId = retData.jobId
      this.taskLineList.push( jobId )
      this.$emit( 'taskAddSuc', { jobId } )
    },
    fileUploadErr( data ) {
      this.$emit( 'taskAddFail', { msg: data.msg || '文件导入失败' } )
    }
  },
  created() {

  }
}
</script>
<style lang="stylus" scoped></style>

