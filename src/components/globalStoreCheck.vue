<template>
  <el-select v-model="myValue" v-if="visible" filterable size="small">
    <el-option
      v-for="item in storeList"
      :key="item.id"
      :value="item.id"
      :label="item.storeName"
    >{{item.storeName}}</el-option>
  </el-select>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { State, Mutation } from 'vuex-class'
import API from '../API'
import { debounce } from '../utils'

@Component
export default class GlobalStoreCheck extends Vue {
  @State(state => state.login.storeId) storeId
  @State(state => state.login.loginIfor) loginIfor
  @State(state => state.login.currentStoreList) storeList
  @Mutation('login/setStoreId') setStoreId
  get myValue() {
    return this.storeId
  }
  set myValue(storeId) {
    this.setStoreId(storeId)
    this.globalUpdateUser(storeId)
  }
  get visible() {
    // let path = this.$route.path
    // return (['/order/search' ] as Array<any>).includes(path)
    return !!this.storeList.length
  }
  globalUpdateUser(storeId) {
    this.$http(API.globalUpdateUser, {
      storeId,
      id: this.loginIfor.memberId
    }).then((res) => {
      // console.log(res)
      window.location.reload()
      // setTimeout(()=>{
      //   window.location.reload()
      // },3000)
    })
  }
  // (){
  //   this.$http(API.globalUpdateUser,{
  //   })
  // }
}
</script>
<style lang="stylus" scoped>
.el-select
  margin  0 10px
</style>
