<template>
  <div></div>
</template>
<script>
export default {
  name: 'sync-export',
  props: {
    exportUrl: String,
    checkExportStatusUrl: String,
    params: Object
  },
  data() {
    return {
      exportLineList: [],  // 异步导出队列
      exportTaskIsRun: false, // 异步队列是否正在执行
      exportTaskId: undefined,
      MAX_TASK_TIMES: 999, // 为了优化性能,这里设置多任务执行时间
      exportTaskMaxTime: 0,
      mockTime: 1
    }
  },
  watch: {
    exportLineList( val ) {
      if ( val.length == 0 ) {
        this.stopExportTask()
      } else {
        this.startExportTask()
      }
    }
  },
  methods: {
    addTask( params ) {
      this.$http( this.exportUrl, params ).then( ( { data } ) => {
        if ( !data.jobId ) {
          return
        }
        let jobId = data.jobId
        // 避免多次加入,要检测重复性
        if ( this.exportLineList.findIndex( ( item ) => {
          return item == jobId
        } ) == -1 ) {
          this.exportLineList.push( jobId )
          this.$emit( 'taskAddSuc', { ...params, jobId, exportStatus: 1 } )
        } else {
          this.$emit( 'taskAddFail', { msg: '导出任务已经存在' } )
        }
      } ).catch( err => {
        this.$emit( 'taskAddFail', err )
      } )
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
      clearInterval( this.exportTaskId )
      this.exportTaskIsRun = false
      this.exportTaskId = undefined
      this.mockTime = 1
    },

    startExportTask() {
      this.exportTaskMaxTime = 0
      if ( this.exportTaskIsRun == true ) {
        return;
      }
      this.exportTaskIsRun = true
      this.exportTaskId = setInterval( this.taskMethod, 5000 );
    },

    removeOkTask( okJobs ) {
      let exportLineListTemp = this.exportLineList.filter( itemId => {
        return okJobs.findIndex( itemOk => {
          return itemOk.jobId == itemId
        } ) == -1
      } )
      this.exportLineList = exportLineListTemp
    },

    taskMethod() {
      let that = this
      if ( that.exportTaskMaxTime >= that.MAX_TASK_TIMES ) {
        that.stopExportTask()
        return;
      }
      if ( that.exportLineList.length == 0 ) {
        return;
      }

      that.$http( that.checkExportStatusUrl, { jobIds: that.exportLineList.join( ',' ) } ).then( ( { data } ) => {
        that.exportTaskMaxTime++
        let retJobs = data.data;
        let okJobs = retJobs.filter( item => {
          return item.status == 3
        } )  // 已生成成功
        let failJobs = retJobs.filter( item => {
          return item.status == 4
        } ) // 失败
        let okEmitInfos = []
        let failEmitInfos = []
        if ( okJobs.length > 0 ) {
          okJobs.forEach( itemOk => {
            okEmitInfos.push( { ...itemOk, exportStatus: 3 } )
          } )
          that.emitOk( okEmitInfos )
          that.removeOkTask( okJobs )
        }
        if ( failJobs.length > 0 ) {
          failJobs.forEach( itemFail => {
            failEmitInfos.push( { ...itemFail, exportStatus: 4 } )
          } )
          that.emitFail( failEmitInfos )
          that.removeOkTask( failJobs )
        }
      } ).catch( err => {
        // console.log( err )
        // console.log('轮状态查询接口错误,停止轮询')
        that.stopExportTask()
      } )
    }
  },
  created() {
  }
}
</script>
<style lang="stylus" scoped></style>

