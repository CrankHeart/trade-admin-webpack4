<template>
  <div id="erp_monitor">
    <lc-title text="ERP监控">
      <el-button-group class="pull-right">
        <el-button v-for="component in componentsList" @click="componentName=component.id" :class="{'is-active':componentName==component.id}" :key="component.id" type="primary">{{component.label}}</el-button>
      </el-button-group>
    </lc-title>
    <component :is="componentName" v-model="condition" @toggle="toggleComponent"></component>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Inject } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import ErpMonitorMap from './components/ErpMonitorMap.vue'
import ErpMonitorTable from './components/ErpMonitorTable.vue'
@Component( {
  name: 'erp_monitor',
  components: {
    lcTitle,
    ErpMonitorTable,
    ErpMonitorMap
  }
} )
export default class ErpMonitor extends Vue {
  componentsList: any[] = [ {
    id: 'ErpMonitorMap',
    label: '图形展示'
  },
  {
    id: 'ErpMonitorTable',
    label: '数据搜索'
  } ]
  componentName: string = this.componentsList[ 0 ].id
  condition: any = {}
  toggleComponent () {
    this.componentName = this.componentName == 'ErpMonitorMap' ? 'ErpMonitorTable' : 'ErpMonitorMap'
  }
}
</script>
<style lang="stylus" scoped>

</style>
