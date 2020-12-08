<template>
  <el-dialog class="data-push-modal" title="数据补推" size="tiny" :visible.sync="dataPushModalVisible">
    <div class="block">
      <span class="demonstration">数据推送时间范围</span>
      <el-date-picker
        v-model="dataPush"
        type="datetimerange"
        :picker-options="pickerOptions"
        placeholder="请选择时间范围"
        align="right"
      ></el-date-picker>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dataPushModalVisible = false">取 消</el-button>
      <el-button type="primary" @click="confirmDataPush">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  name: 'data-push-modal',
  props: [ 'value' ],
  inject: [ 'formatMyDate' ],
  computed: {
    dataPushModalVisible: {
      get() {
        return this.value
      },
      set( val ) {
        this.$emit( 'input', val )
      }
    }
  },
  data() {
    return {
      dataPush: '',
      pickerOptions: {
        shortcuts: [ {
          text: '最近一周',
          onClick( picker ) {
            const end = new Date();
            const start = new Date();
            start.setTime( start.getTime() - 3600 * 1000 * 24 * 7 );
            picker.$emit( 'pick', [ start, end ] );
          }
        }, {
          text: '最近一个月',
          onClick( picker ) {
            const end = new Date();
            const start = new Date();
            start.setTime( start.getTime() - 3600 * 1000 * 24 * 30 );
            picker.$emit( 'pick', [ start, end ] );
          }
        }, {
          text: '最近三个月',
          onClick( picker ) {
            const end = new Date();
            const start = new Date();
            start.setTime( start.getTime() - 3600 * 1000 * 24 * 90 );
            picker.$emit( 'pick', [ start, end ] );
          }
        } ]
      }
    }
  },
  methods: {
    confirmDataPush() {
      const startTime = this.formatMyDate( this.dataPush[ 0 ] )
      const endTime = this.formatMyDate( this.dataPush[ 1 ] )
      // TODO 请求的一些东西 bulabulabula
      this.dataPushModalVisible = false
    }
  }
}
</script>

<style lang='stylus' scoped></style>
