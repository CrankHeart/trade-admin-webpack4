<template>
  <div class="layout">
    <component :is="navComponentName" :list="layoutDataArr" :type="floorType" v-if="themeEventType"></component>
    <el-row class="layout-container" type="flex">
      <component class="layout-component" v-for="(componentId,index) in layoutArr" :key="componentId" v-model="layoutData[componentId]" :is="formatComponentName(`${layoutData[componentId] &&layoutData[componentId].floorTemplateName}`)" @change="change" :type="floorType">
        <el-button-group v-if="!isView && !disabled">
          <el-button @click="control(index,'edit')">编辑</el-button>
          <el-button @click="control(index,'save')">保存</el-button>
          <el-button @click="control(index,'moveUp')">上移</el-button>
          <el-button @click="control(index,'moveDown')">下移</el-button>
          <el-button @click="control(index,'delete')">删除</el-button>
        </el-button-group>
      </component>
    </el-row>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { basicProps } from '../const'
import components from './asyncComponent'
@Component( {
  name: 'layout',
  components: {
    ...components
  }
} )
export default class Layout extends Vue {
  @Prop( { default: false } )
  disabled: boolean
  @Prop()
  layoutArr: number[]
  @Prop()
  layoutData: any
  @Prop()
  themeEventMode: number
  @Prop()
  themeEventType: number
  get floorType () {
    let firstFloor = this.layoutData[ this.layoutArr[ 0 ] ] || {}
    return firstFloor.floorType || 0
  }
  get navComponentName () {
    switch ( this.floorType ) {
      case 1:
        return 'top-nav'
      case 4:
      case 5:
      case 6:
        return 'side-nav'
      default:
        return ''
    }
  }
  get layoutDataArr () {
    return this.layoutArr.map( v => this.layoutData[ v ] )
  }
  isView: boolean = false
  formatComponentName ( str ) {
    let name = str.replace( /\//i, '-' )
    let camelName = name.replace( /(-\w)/, str => str.slice( 1 ).toUpperCase() )
    return components[ camelName ] && name || `normal_${this.themeEventMode}_${this.themeEventType}`
  }
  // get flattenLayoutData () {

  //   return Object.keys( this.layoutData ).reduce( ( m, key ) => {
  //     let layout = this.layoutData[ key ]
  //     let o: any = {}
  //     basicProps.forEach( v => {
  //       o[ v ] = layout[ v ]
  //     } )
  //     o.floorLayoutDetail = o.floorLayoutDetail || {}
  //     Object.keys( o.floorLayoutDetail ).forEach( k => {
  //       if ( !o.hasOwnProperty( k ) ) {
  //         o[ k ] = o.floorLayoutDetail[ k ]
  //       }
  //     } )
  //     m[ key ] = o
  //     return m
  //   }, {} )
  // }

  change ( item ) {
    this.$emit( 'change', item )
  }

  control ( index, type ) {
    this.$emit( 'control', { index, type } )
  }
}
</script>
<style lang="stylus" scoped>
.layout-component
  min-height 40px
  padding-bottom 40px
  position relative
  margin-bottom 20px
  &:hover
    .el-button-group
      opacity 1
.el-button-group
  position absolute
  right 0
  bottom 0px
  opacity 0
// .layout-container
//   display flex
//   flex-wrap wrap
</style>

