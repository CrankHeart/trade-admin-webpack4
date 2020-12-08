<template>
  <div
    class="table-config-control"
    :class="{'is-unfolded':configContrl}"
    @mouseenter="toggleVisible(true)"
    @mouseleave="toggleVisible(false)"
  >
    <div class="table-config-control-wrapper">
      <el-tooltip effect="dark" content="点击控制 【表格控制组件】显隐，勾选控制下方表格显示列" placement="top-start">
        <i class="icon-list"></i>
      </el-tooltip>

      <transition name="el-zoom-in-top">
        <el-checkbox-group v-if="configContrl" v-model="conf" size="small">
          <el-checkbox v-for="item in baseConfig" :label="item.prop" :key="item.prop">{{item.label}}</el-checkbox>
        </el-checkbox-group>
      </transition>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
import { Component, Prop, Watch, Model } from "vue-property-decorator"

@Component( {
  name: "table-config-control"
} )
export default class TableConfigControl extends Vue {
  @Prop( { default: [] } )
  baseConfig: [ any ]
  // @Watch("baseConfig", { deep: true })
  // baseWatcher(v, o) {

  // }
  @Prop( { default: false } )
  show: boolean
  toggleVisible ( boo ) {
    this.configContrl = boo
  }
  configContrl: boolean = this.show
  @Model() conf: any[] = []
  created () {
    this.initConf()
    this.$emit( "set-config", this.conf )
  }
  initConf () {
    let o = []
    this.baseConfig.forEach( v => {
      v.isChecked && o.push( v.prop )
    } )
    this.conf = o
  }
  @Watch( "conf", { deep: true } )
  confWatcher ( v, o ) {
    this.$emit( "set-config", v )
  }
}
</script>
<style lang="stylus" scoped>
.table-config-control
  position relative
  z-index 99
.el-checkbox-group
  width 300px
  display flex
  border 1px solid #dfe6ec
  background #fff
  padding 20px 0 8px
  transform scale(0.9)
  transform-origin left top
  max-height 400px
  overflow auto
  flex-wrap wrap
.icon-list
  width 16px
  height 16px
  position absolute
  left 3px
  top 3px
  z-index 99
  background url('../../assets/images/icon-list.png')
  font-size 12px
  cursor pointer
.table-config-control-wrapper
  position absolute
  left 0
  top 0
  line-height 32px
.el-checkbox
  display block
  width 150px
  padding 0 8px
  box-sizing border-box
  flex-shrink 0
  +.el-checkbox
    margin-left 0
[class*='el-icon']
  &:before
    line-height 32px
    margin-right 10px
    cursor pointer
</style>