<template>
  <div class="product-img-config">
    <div @click="showDialog">
      <slot></slot>
    </div>
    <el-dialog title="图片管理" :visible.sync="dialogVisible" size="small">
      <el-row>
        <el-col :span="24">
          <el-button type="primary" size="small" @click="upload">上传</el-button>
        </el-col>
      </el-row>
      <lc-table
        :config="config"
        :data="imgs"
        :has-page="false"
        :loading="loading"
        :height="330"
        type="index"
      >
        <template slot-scope="scope">
          <template v-if="scope.row.prop === 'url'">查看</template>
          <template v-else-if="scope.row.prop === 'control'">
            <el-button @click="replace(scope.row)" type="primary" size="mini">替换</el-button>
            <el-button @click="deleteImg(scope.row)" type="danger" size="mini">删除</el-button>
          </template>
          <template v-else></template>
        </template>
      </lc-table>
      <div class="view-mask" v-if="viewImg" @click="viewImg=''">
        <div class="img">
          <img :src="viewImg" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import lcTable from '../../../components/table'
@Component( {
  name: 'product-img-config',
  components: {
    lcTable
  }
} )
export default class ProductDetailSpu extends Vue {
  @Prop( { default: '' } ) img: string
  dialogVisible: boolean = false
  viewImg: string = ''
  loading: boolean = false
  config: any[] = [
    // { prop: 'index', label: '序号', width: '70px' },
    { prop: 'url', label: '图片', width: '' },
    { prop: 'control', label: '操作' },
  ]

  showDialog () {
    this.dialogVisible = true
  }
  deleteImg ( item ) {

  }
  replace ( item ) {

  }
  upload () {

  }

}
</script>

<style lang='stylus' scoped>
.product-img-config
  .view-mask
    position fixed
    left 0
    top 0
    right 0
    bottom 0
    z-index 999
    .img
      min-width 200px
      min-height 200px
      max-width 400px
      background rgba(0, 0, 0, 0.3)
      box-shadow 0 0 20px rgba(0, 0, 0, 0.8)
      position absolute
      top 50%
      left 50%
      transform translate3d(-50%, -50%, 0)
      img
        width 100%
        height 100%
</style>

<style lang="stylus" >
.product-img-config
  .el-dialog__body
    padding-top 10px
</style>

