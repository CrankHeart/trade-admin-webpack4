<template>
  <span @click.self="showPop" :disabled="item.isLocked">
    图片管理
    <imgPop v-if="imgPopVisible" v-model="imgPopVisible" :is-edit="isEdit" :type="type" :item="item" :key="item.lcCode"></imgPop>
  </span>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop } from 'vue-property-decorator'
import imgPop from './imgPop'

@Component( {
  name: 'imgConfig',
  components: {
    imgPop
  }
} )
export default class ImgConfig extends Vue {
  @Prop()
  type: number
  @Prop( { default: true } )
  isEdit:boolean
  @Prop()
  item: any
  imgPopVisible: boolean = false
  showPop () {
    if ( !this.item.isLocked ) {
      this.imgPopVisible = true
    }
  }
}
</script>
<style lang="stylus" scoped>
span 
  color #20a0ff
  cursor pointer
  &[disabled]
    color #bbb
</style>

