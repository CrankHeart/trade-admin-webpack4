<template>
  <div id="aptitude-remind">
    <lc-title :text="activeTitle"></lc-title>
    <template v-if="!productList.length && hasInited">
      暂无提醒
    </template>
    <template v-else>
      <p class="aptitude-info" v-for="item in productList" :key="item.skuId || item.spuId" >
        <router-link v-if="item.spuId" :to="`/product/detail/${item.spuId}?${item.lcSpuCode&&('lcSpuCode='+item.lcSpuCode) || item.lcSkuCode&&('lcSkuCode='+item.lcSkuCode)}&type=${type[index]}`">
          {{item.spuName || item.skuName}}
        </router-link>
      </p>
      <el-pagination :current-page="page.cur" :page-size="page.num" layout="total,prev, pager, next" :total="page.total" class="center" @current-change="curChange"></el-pagination>
    </template>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import lcTitle from "../../../components/title.vue"
import API from '../../../API'
import { State } from 'vuex-class'
import { remindType } from '../const/index'
@Component( {
  name: 'messageRemind',
  components: {
    lcTitle
  }
} )
export default class messageRemind extends Vue {
  @State( state => state.message.msgTotal ) msgTotal
  remindType = remindType

  type: any = 0

  get activeTitle() {
    let remindType = this.remindType.filter( v => this.type == v.type )
    return remindType && remindType[0].title
  }

  index = 0

  page = {
    cur: 1,
    num: 10,
    total: 0
  }
  hasInited: boolean = false
  productList: any[] = []
  curChange( cur ) {
    this.page.cur = cur
    this.getData()
  }
  getData( name = '' ) {
    let { cur, num } = this.page
    let start = ( cur - 1 ) * num
    this.$http( API.getMessageDetail, {
      type: this.type,
      start,
      num
    } ).then( ( { data } ) => {
      this.hasInited = true
      let myData = data.data || {}
      this.productList = myData.list || []
      this.page.total = myData.total
    }, () => {
      this.hasInited = true
      this.productList = []
      this.page.total = 0
    } )
  }
}
</script>
<style lang="stylus" scoped>
.aptitude-info
  line-height 30px
  cursor pointer
  border-bottom 1px dashed #ddd
  line-height 38px
  a
    color #666666
    font-size 14px
    &:hover
      text-decoration underline
      color #20a0ff
</style>
