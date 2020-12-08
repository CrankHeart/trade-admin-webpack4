<template>
  <div>
    <lc-card
      v-for="dataset in datasets"
      :key="dataset.id"
      :title="`发货单号：${'FH20200702333345'}，发货时间：${'2019-09-29 16:54:45'}，物流公司：${''}，物流单号：${'35353534'}`"
    >
      <lc-dataset :dataset="dataset"></lc-dataset>
      <template slot="title">
        <div class="title-btn">
          <el-button type="primary" @click="allUpdate" size="small">批量更新</el-button>
        </div>
      </template>
    </lc-card>
    <div style="text-align:center">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="page.current"
        :page-sizes="page.sizes"
        :page-size="page.size"
        layout="total, jumper, prev, pager, next, sizes"
        :total="page.total"
      ></el-pagination>
    </div>
    <lc-dialog v-model="allUpdateFlag" title="批量更新" @confirm="updateAll">
      <lc-dataset :dataset="allUpdateMsg"></lc-dataset>
    </lc-dialog>
    <lc-dialog v-model="currentDsFlag" width="100%" title="单个更新">
      <div style="padding-left:5px">
        <div style="padding-bottom: 5px">发货单号：{{'FH20200702333345'}}</div>
        <el-button type="primary" size="small" @click="addLine">添加行</el-button>
      </div>
      <lc-dataset :dataset="currentDs"></lc-dataset>
    </lc-dialog>
  </div>
</template>

<script>
import config from './config'
import allUpdateMsgConfig from './allUpdateMsgConfig'
import currentDsConfig from './currentDsConfig'

function clone( record ) {
  let item = {}
  Object.keys( record ).forEach( key => {
    item[ key ] = record[ key ]
  } )
  return item
}

export default {
  name: "timingJobHistory",
  props: {},
  data() {
    return {
      datasets: [],
      allUpdateFlag: false,
      currentDsFlag: false,
      allUpdateMsg: '',
      currentDs: '',
      page: {
        size: 10,
        sizes: [ 10, 20, 30, 50, 100, 200 ],
        current: 0,
        total: 0
      }
    };
  },
  computed: {},
  methods: {
    handleSizeChange( n ) {
      this.page.size = n
      this.search()
    },
    handleCurrentChange( n ) {
      this.page.current = n
      this.search()
    },
    search() {
      this.getDatasets()
    },
    allUpdate() {
      this.allUpdateFlag = true
    },
    modifyLine( record ) {
      this.currentDsFlag = true
      let { inku, outku } = record
      let list = []
      if ( inku > 0 && outku > 0 ) {
        let item = clone( record )
        item.inku = 0
        list.push( item )
        item = clone( record )
        item.outku = 0
        list.push( item )
      }
      this.currentDs.value = list
    },
    addLine() {
      this.currentDs.create()
    },
    getDatasets() {
      this.datasets = []
      const list = [ [ { skuNum: 1 }, { skuNum: 2, inku: 2, outku: 3 } ], [ { skuNum: 3 } ] ]
      list.forEach( item => {
        let ds = this.$dataSet( config )
        ds.value = item
        ds.on( 'update', ( record, index ) => {
          console.log( record, index )
          this.modifyLine( record.value )
        } )
        this.datasets.push( ds )
      } )
    },
    updateAll() {
      console.log( this.allUpdateMsg.value )
    }
  },
  created() {
    this.getDatasets()
    this.allUpdateMsg = this.$dataSet( allUpdateMsgConfig )
    this.allUpdateMsg.value = { preDate: '2018-02-03' }
    this.currentDs = this.$dataSet( currentDsConfig )
  }
};
</script>

<style lang="stylus" scoped>
.title-btn{
    position absolute
    top 0
    right 0
}
</style>