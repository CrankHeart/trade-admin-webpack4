<template>
  <span class="fast-search">
    <el-button type="text" v-if="!myVisible" @click="showSearch">+ 快速搜索</el-button>
    <el-input
      v-model="quickSearchText"
      autofocus
      size="small"
      placeholder="按下enter即可搜索"
      icon="search"
      :on-icon-click="firstPYSearch"
      @keydown.enter.native="firstPYSearch"
      v-else
    ></el-input>
  </span>
</template>
<script lang="ts">

import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
let firstPYSearch = null
@Component( {
  name: 'fast-search'
} )
export default class FastSearch extends Vue {
  @Prop( { default: false } )
  visible: boolean
  myVisible: boolean = this.visible
  searchResult: any[] = []
  quickSearchText: string = ''
  showSearch () {
    // 加个异步玩玩
    import( '../utils/firstPY-search/' ).then( res => {
      firstPYSearch = res.default
      this.myVisible = true
    } )
  }
  created () {
    if ( this.visible ) {
      this.showSearch()
    }
  }
  @Prop( { required: true } )
  basicList: any[]
  @Prop( { required: true, type: [ String, Array ] } )
  propName
  firstPYSearch () {
    if ( this.propName instanceof Array ) {
      let arr = this.propName.reduce( ( total, next ) => {
        return total.concat( firstPYSearch( this.quickSearchText, this.basicList, next ) )
      }, [] )
      let o = {}
      this.searchResult = arr.reduce( ( total, next ) => {
        if ( o[ next.lcCode ] ) {
          return total
        } else {
          o[ next.lcCode ] = true
          return total.concat( next )
        }
      }, [] )
    } else {
      this.searchResult = firstPYSearch( this.quickSearchText, this.basicList, this.propName )
    }
    this.$emit( 'fast-search', this.searchResult )
  }
}
</script>
<style lang="stylus" scoped>
.fast-search
  display inline-block
</style>

 