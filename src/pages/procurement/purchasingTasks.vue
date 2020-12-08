<template>
  <div class="purchasing-tasks">
    <lc-title text="采购任务">
      <slot>
        <el-button
          class="pull-right"
          v-for="com in compuViewsBtn"
          :key="com"
          @click="toggleViews( com )"
          type="primary"
        >{{ allComponents[com].name }}</el-button>
      </slot>
    </lc-title>
    <keep-alive>
      <component :is="activeComponent" ref="refillCommonSku"></component>
    </keep-alive>
    <purchasing-tasks-bottom-bar
      v-if="activeComponent !== 'purchasingTasksDirectly' "
      :curr-view="activeComponent"
      @editSucess="addSupplierSucess"
    />
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import refillCommonSku from './components/purchasingTasksOrdinary.vue'
import purchasingTasksDirectly from './components/purchasingTasksDirectly.vue'
import purchasingTasksBottomBar from './components/purchasingTasksBottomBar.vue'

@Component( {
  name: 'purchasing-tasks',
  components: {
    lcTitle,
    refillCommonSku,
    purchasingTasksDirectly,
    purchasingTasksBottomBar
  }
} )
export default class purchasingTasks extends Vue {

  allComponents: any = {
    refillCommonSku: {
      name: '普通视图',
      permission: process.env.NODE_ENV == 'production' ? 1153 : 1154
    },
    purchasingTasksDirectly: {
      name: '直发视图',
      permission: process.env.NODE_ENV == 'production' ? 1151 : 1153
    }
  }

  get compuViewsBtn () {
    let arr = []
    for ( const com of Object.keys( this.allComponents ) ) {
      if ( this.hasViewCompBtn( com ) ) {
        arr.push( com )
      }
    }
    return arr
  }

  activeComponent: string = 'refillCommonSku'

  activated () {
  }

  toggleViews ( com: string = '' ) {
    this.activeComponent = com
  }

  hasViewCompBtn ( com ) {
    return com !== this.activeComponent && this.$permissionValidate( this.allComponents[ com ].permission )
  }

  addSupplierSucess () {
    if ( this.activeComponent === 'refillCommonSku' ) {
      console.log( 'sucess!!!!' )
      this.$refs.refillCommonSku.search()
    }
  }

}
</script>
<style lang="stylus" >
.el-select-width
  width 100%
</style>


