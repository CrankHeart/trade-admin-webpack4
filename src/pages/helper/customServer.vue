<template>
  <div id="custom-server" v-loading.body="!isShow" :element-loading-text="isCustomServer?'正在获取相关资源，请稍等！':'权限不足，请联系管理员！'">
    <server v-if="isShow"></server>
  </div>
</template>
<script lang="ts">
  import Vue from "vue"
  import { Component, Inject, Watch } from "vue-property-decorator"
  import lcTitle from "../../components/title.vue"
  import { State, Action, Getter } from "vuex-class"
  import server from "./components/server.vue"
  @Component({
    name: "custom-server",
    components: {
      lcTitle,
      server
    }
  })
  export default class CustomServer extends Vue {
    @State(state => state.login.isCustomServer)
    isCustomServer
    get isShow() {
      return this.isCustomServer
    }
  }
</script>
<style lang="stylus" scoped>
h3 {
  border-bottom: 2px solid #20a0ff;

  span {
    font-weight: normal;
    padding: 5px 15px;
    display: inline-block;
    background: #20a0ff;
    color: #fff;
    border-bottom: none;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
}
</style>
