<template>
  <div id="activity-expired">
    <lc-title text="今日活动过期提醒"></lc-title>
    <!-- <el-tabs v-model="activeName" @tab-click="handleClick" v-if="tabs.length">
      <el-tab-pane v-for="item in tabs" :label="item.label" :name="item.prop" :key="item.prop"></el-tab-pane>
    </el-tabs> -->

    <template v-if="!productList.length && hasInited">
      暂无提醒
    </template>
    <template v-else>
      <p class="activity-expired-info" v-for="item in productList" :key="item.id">
        <router-link :to="`/coupon/detail/${item.id}`">
          {{item.activityName}}
        </router-link>
        <span class="pull-right">
          <i class="el-icon-warning"></i>
          活动结束时间:{{formatMyDate(item.endTime)}}
        </span>
      </p>
      <el-pagination :current-page="page.cur" :page-size="page.num" layout="total,prev, pager, next" :total="page.total" class="center" @current-change="curChange"></el-pagination>
    </template>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Inject, Component } from 'vue-property-decorator'
import lcTitle from "../../components/title.vue"
import API from '../../API'
import messageRemind from './components/messageRemind.vue'
@Component( {
  name: 'activityExpired',
  components: {
    lcTitle
  }
} )
export default class activityExpired extends messageRemind {
  type = [ 7 ]

  @Inject() formatMyDate
  activated() {
    this.$permissionValidateWithNotify(667)
    this.getData()
  }

  getData() {
    let { cur, num } = this.page
    let start = ( cur - 1 ) * num
    this.$http( API.getMessageDetail, {
      type: 7,
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
.activity-expired-info
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
  span
    font-size 12px
</style>
