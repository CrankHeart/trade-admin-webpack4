<template>
  <div id="aptitude-remind">
    <lc-title :text="activeTitle"></lc-title>
    <el-tabs v-model="activeName" @tab-click="handleClick" v-if="tabs.length">
      <template v-for="item in tabs">
        <el-tab-pane v-if="item.type === 0 ? $permissionValidate(649) : item.type === 1 ? $permissionValidate(650) : $permissionValidate(651)" :key="item.prop" :label="item.label" :name="item.prop"></el-tab-pane>
      </template>
    </el-tabs>

    <template v-if="!productList.length && hasInited">
      暂无提醒
    </template>
    <template v-else>
      <p class="aptitude-info" v-for="item in productList" :key="item.skuId || item.spuId" v-if="item.spuId">
        <router-link :to="`/product/detail/${item.spuId}?${item.lcSpuCode&&('lcSpuCode='+item.lcSpuCode) || item.lcSkuCode&&('lcSkuCode='+item.lcSkuCode)}&type=${type}`">
          {{item.spuName || item.skuName}}
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
  name: 'AptitudeRemind'
} )
export default class AptitudeRemind extends MessageRemind {
  type: any = ''
  get tabs () {
    return this.remindType.filter( v => v.type <= 2 )
  }

  get activeName () {
    let o = this.remindType.filter( v => this.type == v.type ) || []
    return o[ 0 ] && o[ 0 ].prop
  }

  set activeName ( v ) {
    this.tabs.forEach( val => {
      if ( val.prop == v ) {
        this.type = val.type
      }
    } )
  }
  handleClick ( { name } ) {
    this.page.cur = 1
    this.page.total = 0
    this.activeName = name
    this.hasInited = false
    this.getData( name )
  }
  activated () {
    this.$permissionValidateWithNotify( 420 )
    if ( this.$permissionValidate( 649 ) ) {
      this.type = 0
    } else if ( this.$permissionValidate( 650 ) ) {
      this.type = 1
    } else if ( this.$permissionValidate( 651 ) ) {
      this.type = 2
    } else {
      this.$permissionValidateWithNotify( 649 )
    }
    this.getData()
  }
}
</script>