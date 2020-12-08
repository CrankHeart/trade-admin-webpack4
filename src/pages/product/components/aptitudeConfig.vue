<template>
  <div class="aptitude-config">
    <!-- 资质管理 -->
    <el-select
      v-model="item.needAptitude"
      placeholder="请选择"
      size="small"
      :disabled="disabled"
      v-if="isEdit"
    >
      <el-option label="需要" :value="1" @click.native="aptitudePopVisible=true"></el-option>
      <el-option label="不需要" :value="0" @click.native="aptitudePopVisible=true"></el-option>
    </el-select>
    <template v-else>{{item.needAptitude?'需要':'不需要'}}</template>
    <el-tooltip class="relations" effect="dark" placement="top-start">
      <div slot="content">
        点击
        <i class="el-icon-warning"></i>
        编辑资质信息
        <br />
      </div>
      <i class="el-icon-warning" @click="popShow"></i>
    </el-tooltip>
    <aptitude-pop
      v-model="aptitudePopVisible"
      :is-edit="isEdit"
      v-if="aptitudePopVisible"
      :type="myType"
      :key="item.lcCode"
      :item="item"
      @save="$emit('handler-callback')"
    ></aptitude-pop>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import aptitudePop from './aptitudePop.vue'
@Component( {
  name: 'AptitudeConfig',
  components: {
    aptitudePop
  }
} )
export default class AptitudeConfig extends Vue {
  aptitudePopVisible: boolean = false
  @Prop()
  type: 'spu' | 'sku'
  @Prop( { default: false } )
  disabled: boolean
  @Prop( { default: true } )
  isEdit: boolean
  get myType () {
    return this.type === 'spu' ? 0 : 1
  }
  @Prop( { default: () => { } } )
  item: any
  // get needAptitude() {
  //   return this.item.needAptitude
  // }
  // @Watch( 'needAptitude' )
  // needAptitudeWatcher ( v ) {
  //   console.log( this.item )
  // }
  popShow () {
    if ( !this.disabled ) {
      this.aptitudePopVisible = true
    }
  }
}
</script>

<style lang="stylus" scoped>
.aptitude-config
  display flex
  justify-content space-between
  .el-tooltip
    margin-left 5px
    margin-top 8px
    color #97a0ae
    cursor pointer
</style>
