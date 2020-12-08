<template>
  <div class="tool-tips">
    <slot></slot>
    <el-tooltip placement="bottom" v-if="hasView">
      <div slot="content">{{isTable?'数据视图':'表格视图'}}</div>
      <i :class="'iconfont icon-'+(isTable?'tuxing':'biaoge')" @click="$emit('handler-click')"></i>
    </el-tooltip>
    <el-tooltip placement="bottom" v-if="hasTips">
      <div slot="content" v-html="tipsHtml"></div>
      <i class="el-icon-information"></i>
    </el-tooltip>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
@Component({
  name: 'tool-tips'
})
export default class GMVDetail extends Vue {
  @Prop()
  tipsHtml: string

  @Prop({ default: true })
  hasTips: boolean

  @Prop()
  isTable: boolean

  @Prop({ default: false })
  hasView: boolean
}
</script>
<style lang="stylus" scoped>
.tool-tips {
  position: absolute;
  right: 0;
  top: 0;
}
</style>

