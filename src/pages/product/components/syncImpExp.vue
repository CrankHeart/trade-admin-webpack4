<template>
  <div>
    <template class="setInOutBtn">
      <el-button
        type="primary"
        size="small"
        class="pull-right"
        @click="setInExcel"
        v-if="$permissionValidateWithEnv(1253, 1249)"
      >导入Excel</el-button>
      <template v-if="importTaskInfo.status==2">
        <el-button
          type="primary"
          size="small"
          class="pull-right"
          @click="setInExcel"
          v-loading.fullscreen.lock="fullscreenLoading"
          element-loading-text="批量导入比较耗时,请耐心等候:>"
        >导入中,请稍后</el-button>
      </template>
      <template v-else-if="importTaskInfo.status==3">
        <el-button type="primary" size="small" class="pull-right" @click="showErrorMsg">导入完成,查看结果</el-button>
      </template>
      <template v-else-if="importTaskInfo.status==4">
        <el-button type="danger" size="small" class="pull-right" @click="showErrorMsg">导入失败,查看结果</el-button>
      </template>
    </template>
    <template>
      <el-button
        v-if="$permissionValidateWithEnv(1254, 1250) && (!exportTaskInfo.exportStatus || exportTaskInfo.exportStatus == 3)"
        type="primary"
        size="small"
        class="pull-right"
        @click="exportOut"
        style="margin-bottom: 10px"
      >导出excel</el-button>
      <span v-else-if="exportTaskInfo.exportStatus==4" style="margin-bottom: 10px">导出失败</span>
      <el-button
        v-else-if="exportTaskInfo.exportStatus==1 || exportTaskInfo.exportStatus==2"
        type="primary"
        size="small"
        class="pull-right"
        :loading="true"
        style="margin-bottom: 10px"
      >导出中...</el-button>
      <template v-else></template>
    </template>
    <syncExport
      ref="syncExport"
      :exportUrl="exportUrl"
      :checkExportStatusUrl="checkExportStatusUrl"
      @taskAddSuc="taskAddSuc"
      @taskAddFail="taskAddFail"
      @taskOk="taskOk"
      @taskFail="taskFail"
    />
    <sync-import
      ref="syncImport"
      v-model="visibleDialog"
      :params="setInParams"
      :importUrl="importUrl"
      :checkTastStatusUrl="checkImportStatusUrl"
      @taskOk="taskImpOk"
      @taskFail="taskImpFail"
      @taskAddSuc="taskImpAddSuc"
      @taskAddFail="taskImpAddFail"
    ></sync-import>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Prop } from "vue-property-decorator"
import API from "../../../API"
import syncExport from '../../server/components/syncExport.vue'
import syncImport from '@/pages/server/components/syncImport.vue'

@Component( {
  name: "sync-imp-exp",
  components: {
    syncExport,
    syncImport
  }
} )
export default class SyncImpExp extends Vue {
  @Prop( { default: () => ( {} ) } ) params: any
  fullscreenLoading = false
  importUrl = API.importProductSkuPriceFile
  checkImportStatusUrl = API.getJobResult
  visibleDialog = false


  exportUrl = API.exportProductSkuPrice
  checkExportStatusUrl = API.getBatchJobResult
  exportTaskInfo = {
    exportStatus: null,
    jobId: null,
    filePath: null
  }

  // * 异步导入状态
  importTaskInfo = {
    status: 1,
    jobId: null
  }
  get setInParams () {
    return {}
  }
  setInExcel () {
    this.visibleDialog = true
    this.importTaskInfo.status = 1
  }
  showErrorMsg () {
    this.$refs.syncImport && ( this.$refs.syncImport as any ).showErrDialog()
  }

  taskImpAddSuc ( info ) {
    this.importTaskInfo.status = 2
    this.importTaskInfo.jobId = info.jobId
    this.fullscreenLoading = true
  }
  taskImpAddFail ( err ) {
    this.importTaskInfo.status = 4
    this.importTaskInfo.jobId = null
    this.$message( {
      type: 'error',
      message: err.msg
    } )
  }
  taskImpOk ( okJobs ) {
    this.importTaskInfo.status = okJobs.exportStatus
    this.importTaskInfo.jobId = okJobs.jobId
    this.fullscreenLoading = false
    this.$emit( 'update-table-list' )
  }
  taskImpFail ( failJobs ) {
    this.importTaskInfo.status = failJobs.exportStatus
    this.importTaskInfo.jobId = failJobs.jobId
    this.fullscreenLoading = false
  }

  exportOut () {
    const syncExport = this.$refs.syncExport
    if ( !syncExport ) {
      return
    }
    ( syncExport as any ).addTask( { ...this.params } )
  }
  taskAddSuc ( info ) {
    let jobId = info.jobId
    this.exportTaskInfo.exportStatus = info.exportStatus
    this.exportTaskInfo.jobId = jobId
  }
  taskAddFail ( err ) {
    this.$message( {
      type: 'error',
      message: err.msg || '导出任务失败'
    } )
  }
  taskOk ( okJobs ) {
    this.exportTaskInfo.exportStatus = okJobs[ 0 ].exportStatus
    this.exportTaskInfo.filePath = okJobs[ 0 ].filePath
    window.open( this.exportTaskInfo.filePath )
  }
  taskFail ( failJobs ) {
    this.exportTaskInfo.exportStatus = failJobs[ 0 ].exportStatus
    // ? 暂时设定导出失败提示关闭时按钮变回导出按钮
    this.$notify( {
      type: 'error',
      message: '导出失败',
      onClose: () => this.exportTaskInfo.exportStatus = null
    } )
  }
}

</script>

