<template>
  <div class="info-info">
    <el-card>
      <p>
        <span>账户名</span>
        {{user.loginName}}
      </p>
      <p>
        <span>邮箱地址</span>
        {{user.emailAddress}}
      </p>
      <p>
        <span>姓名</span>
        {{user.userName}}
      </p>
      <p>
        <span>ID</span>
        {{user.id}}
      </p>
      <p>
        <span>角色</span>
        <em class="role" v-for="(role,index) in roleArr" :key="index">{{role}}</em>
      </p>
      <p>
        <span>供应商</span>
        {{user.storeName}}
      </p>
    </el-card>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import { State, Action } from 'vuex-class'
@Component( {
  name: 'info-info',
  components: {
  }
} )
export default class InfoInfo extends Vue {
  @State( state => state.login.usr ) user
  @State( state => state.login.roleArr ) roleArr
  @Action( 'login/getUsr' ) getUsr
  created () {
    this.getUsr()
  }
}
</script>
<style lang="stylus" scoped>
.el-card
  max-width 550px
p
  padding-left 80px
  line-height 30px
  min-height 30px
  span
    margin-left -80px
    width 70px
    margin-right 15px
    float left
    display block
    font-weight bold
    text-align right
  em
    display block
    font-style normal
</style>


