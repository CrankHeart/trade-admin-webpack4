<template>
  <div id="bread-crumb">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="nav in breadcrumb" :key="nav">{{nav}}</el-breadcrumb-item>
    </el-breadcrumb>
    <hr />
  </div>
</template>
<script lang="ts">
import { availableNav } from "../router/availableRouter"
import Vue from "vue"
import { RouteConfig } from "vue-router"
import { Component } from "vue-property-decorator"
@Component( {
  name: "bread-crumb"
} )
export default class BreadCrumb extends Vue {
  get breadcrumb (): RouteConfig[] {
    const path = this.$route.path
    let arr = []
    outerloop: for ( let i in availableNav ) {
      const nav = availableNav[ i ].children || []
      for ( let j = 0, k = nav.length; j < k; j++ ) {
        if ( nav[ j ].path == path ) {
          arr.push( ...[ availableNav[ i ].name, nav[ j ].name ] )
          break outerloop
        }
      }
    }
    return arr
  }
}
</script>

