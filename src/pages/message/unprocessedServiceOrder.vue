<template>
  <div id="aptitude-remind">
    <lc-title :text="activeTitle"></lc-title>
    <template v-if="!productList.length && hasInited">暂无提醒</template>
    <template v-else>
      <p class="aptitude-info" v-for="item in productList" :key="item.serviceOrderSn">
        <router-link
          :to="`/server/refunding?serviceSn=${item.serviceOrderSn}`"
        >{{item.serviceOrderSn}}</router-link>
      </p>
      <el-pagination
        :current-page="page.cur"
        :page-size="page.num"
        layout="total,prev, pager, next"
        :total="page.total"
        class="center"
        @current-change="curChange"
      ></el-pagination>
    </template>
  </div>
</template>
<script lang="ts">
import MessageRemind from './components/messageRemind.vue'
import { Component } from 'vue-property-decorator'

@Component( {
  name: 'unprocessedServiceOrder'
} )
export default class UnprocessedServiceOrder extends MessageRemind {
  type = 12
  activated () {
    this.$permissionValidateWithNotify( 1098 )
    this.getData()
  }
}
</script>
