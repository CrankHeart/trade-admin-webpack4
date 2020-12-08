<template>
  <div id="aptitude-remind">
    <lc-title :text="activeTitle"></lc-title>
    <template v-if="!productList.length && hasInited">
      暂无提醒
    </template>
    <template v-else>
      <p class="aptitude-info" v-for="item in productList" :key="item.orderSn">
        <router-link :to="`/order/detail/${item.orderSn}`">
          {{item.orderSn}}
        </router-link>
      </p>
      <el-pagination :current-page="page.cur" :page-size="page.num" layout="total,prev, pager, next" :total="page.total" class="center" @current-change="curChange"></el-pagination>
    </template>
  </div>
</template>

<script lang="ts">
import MessageRemind from './components/messageRemind.vue'
import { Component } from 'vue-property-decorator'

@Component( {
  name: 'unfilledOrder'
} )
export default class UnfilledOrder extends MessageRemind {
  type = 11
  activated () {
    this.$permissionValidateWithNotify( 1097 )
    this.getData()
  }
}
</script>
