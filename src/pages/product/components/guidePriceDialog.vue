<template>
  <el-dialog
    @open="open"
    :before-close="close"
    id="guide-price"
    title="查看区域指导价"
    :visible.sync="isShowDialog"
    size="tiny"
  >
    <template v-if="Object.keys(data).length">
      <el-row>
        <el-col :span="12">Lc 编码：{{data.lcSkuCode}}</el-col>
        <el-col :span="12">名称：{{data.name}}</el-col>
      </el-row>
      <el-row v-if="!guideList" style="margin-top: 20px">销售指导价：{{data.level2Price | fixed2}}</el-row>
    </template>
    <br />
    <div v-if="guideList" class="el-table el-table--fit el-table--striped el-table--border">
      <table
        cellspacing="0"
        cellpadding="0"
        border="0"
        class="el-table__body el-table--border"
        width="100%"
      >
        <thead>
          <tr>
            <th>
              <div class="cell">省份</div>
            </th>
            <th>
              <div class="cell">价格下限</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="guide in guideList[curIndex]" :key="guide.provinceId">
            <td>
              <div class="cell">{{guide.provinceName}}</div>
            </td>
            <td>
              <div class="cell">{{guide.bottomGuidePrice | fixed2}}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="btn-box" v-if="guideList">
      <el-button @click="prev" :disabled="curIndex === 0">上一页</el-button>
      <el-button @click="next" :disabled="curIndex === guideList.length - 1">下一页</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Model, Prop } from "vue-property-decorator"
import API from "../../../API"
import { debounce } from '../../../utils'

@Component( {
  name: "guide-price-dialog",
  components: {
  }
} )
export default class CommodityPrice extends Vue {
  @Prop( { type: Boolean, default: false } ) value
  @Prop( { type: Object, default: () => ( {} ) } ) data: any
  guideList: any[] = []
  curIndex = 0

  get isShowDialog () {
    return this.value
  }
  set isShowDialog ( value ) {
    this.$emit( 'input', value )
  }

  open () {
    this.curIndex = 0
    this.$http( API.getGuidePrice4Console, { id: this.data.id } ).then( ( { data } ) => {
      this.guideList = data && data.list && data.list.reduce( ( total, cur, index ) => {
        const idx = Math.floor( index / 10 )
        if ( !total[ idx ] ) {
          total[ idx ] = []
        }
        if ( idx === total.length - 1 ) {
          total[ idx ].push( cur )
        }
        return total
      }, [] )
    } )
  }

  close ( done ) {
    this.isShowDialog = false
    done()
  }
  next () {
    this.curIndex += 1
  }
  prev () {
    this.curIndex -= 1
  }
}
</script>
<style lang="stylus">
#guide-price
  .sub-title
    margin 0 0 12px 8px
    .title-tip
      font-size 13px
      color #999999
      font-weight normal
  .form-item
    margin-bottom 12px
  .btn-box
    display flex
    justify-content space-around
    margin-top 20px
</style>

