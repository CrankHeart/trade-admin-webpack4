<template>
  <div class="store-search">
    <el-select v-model="storeId" filterable clearable @change="storeChange">
      <el-option v-for="(store,index) in storeList" :key="index" :label="store.storeName" :value="store.id"></el-option>
    </el-select>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component, Prop, Watch } from 'vue-property-decorator'
import { Mutation, State, Action, Getter } from 'vuex-class'
import API from '../API/'
@Component( {
  name: 'store-search',
  components: {
  }
} )
export default class storeSearch extends Vue {
  @Getter("stores/storeList") storeList
  @Action("stores/getAllStoresWithCache") getAllStoresWithCache;
  @Prop( { type: [ String, Number ] } )
  value
  get storeId () {
    return this.value
  }
  set storeId ( v ) {
    this.$emit( 'input', v )
    this.$emit( 'change', v )
  }
  created () {
    this.getAllStoresWithCache()
    // this.getStoreList()
  }
  // getStoreList () {
  //   // this.$http( API.getStoreList, {} ).then( ( { data } ) => {
  //   //   this.storeList = data.data.list
  //   //   this.setStoreListData( this.storeList )
  //   // } )
  // }
  storeChange ( id ) {
    this.$emit( 'changeStoreId', id )
  }
}
</script>
