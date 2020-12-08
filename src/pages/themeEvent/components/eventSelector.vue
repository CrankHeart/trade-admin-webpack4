<template>
  <el-carousel arrow="always" type="card" :autoplay="false" ref="carouse" class="event-selector">
    <el-carousel-item v-for="(item,index) in selectedEventList" :key="index">
      <i class="el-icon-close" @click="delItem(index)" v-if="!disabled"></i>
      <el-form label-width="80px" @submit.native.prevent>
        <el-form-item v-for="conf in config" :key="conf.prop" :label="conf.label">
          <template v-if="conf.type=='text' || !conf.type">
            <el-input v-model="item[conf.prop]" :disabled="disabled" size="small"></el-input>
          </template>
          <template v-else-if="conf.type=='date'">
            <el-date-picker v-model="item[conf.prop]" :disabled="disabled" size="small" type="date" placeholder="选择日期" :format="conf.formatter" @change="dateChange(item,conf,$event)"> </el-date-picker>
          </template>
          <template v-else-if="conf.type=='upload'">
            <img :src="item[conf.prop]" v-if="item[conf.prop]" />
            <input-file-upload :disabled="disabled" @change="fileUpload( item, conf.prop, $event )">
              <el-button type="text">上传</el-button>
            </input-file-upload>
          </template>
        </el-form-item>
      </el-form>

    </el-carousel-item>
    <el-carousel-item key="add" v-if="!disabled">
      <div class="add" @click="add">+</div>
    </el-carousel-item>
  </el-carousel>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Inject } from 'vue-property-decorator'
import inputFileUpload from '../../../components/inputFileUpload.vue'
import { fileUpload } from '../utils'
import API from '../../../API'
@Component( {
  name: 'event-selector',
  components: {
    inputFileUpload
  }
} )
export default class EventSelector extends Vue {
  @Prop()
  disabled: boolean
  @Prop()
  value: any[]
  config: any[] = [
    { prop: 'name', label: '名称' },
    { prop: 'specification', label: '规格' },
    { prop: 'themeEventPrice', label: '活动价' },
    { prop: 'goodsPrice', label: '原价' },
    { prop: 'saledNumber', label: '销量' },
    { prop: 'goodsImage', label: '图片', type: 'upload' }
  ]
  @Prop()
  themeEventId: number
  get selectedEventList () {
    return this.value
  }
  set selectedEventList ( v ) {
    this.$emit( 'input', v )
  }
  add () {
    this.selectedEventList.push( {} )
    try {
      let carouse: any = this.$refs.carouse
      carouse.setActiveItem( this.selectedEventList.length - 2 )
    } catch ( e ) { }

  }
  delItem ( index ) {
    this.selectedEventList.splice( index, 1 )
  }
  @Inject()
  formatMyDate
  dateChange ( item, { prop, formatter }, date ) {
    item[ prop ] = this.formatMyDate( new Date( date ), formatter )
  }
  fileUpload ( item, prop, e ) {

    try {
      fileUpload( this, e, { themeEventId: this.themeEventId }, this.fileUpdateCallBack( item, prop ), 0 )
    } catch ( e ) {
      console.log( e )
    }
  }
  fileUpdateCallBack ( item, prop ) {
    return data => {
      this.$set( item, prop, data.absolutePath )
    }
  }
}
</script>
<style lang="stylus" scoped>
// .box
//   min-height 200px
//   line-height 30px
//   .el-pagination
//     margin-top 0
//   li
//     cursor pointer
//     [class*="close"]
//       float right 
//       opacity 0
//     &:hover
//       [class*="close"]
//         opacity 1

.el-carousel__item
  height 300px
  overflow auto
  box-sizing border-box
  padding 10px
  background #fff
  border 1px solid #ddd
  // position relative
  .el-icon-close
    position absolute
    right 10px
    top 10px
    font-size 16px
    z-index 9
  img
    width 100px
.el-form-item
  margin-bottom 10px
.add
  width 100%
  height 100%
  display flex
  justify-content center
  align-items center
  font-size 30px
</style>
<style lang="stylus">
.event-selector
  .el-carousel__item
    display block !important
</style>

