<template>
  <div id="user-info">
    <lc-title text="账户信息"></lc-title>

    <el-tabs v-model="activeName">
      <el-tab-pane label="个人信息" name="infoInfo" v-if="$permissionValidate(595)">
        <info-info @tab-change="tabChange"></info-info>
      </el-tab-pane>
      <el-tab-pane label="修改密码" name="infoUpDatePassWord" v-if="$permissionValidate(596)">
        <info-update-password @tab-change="tabChange"></info-update-password>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import lcTitle from '../../components/title.vue'
import infoInfo from './components/info.vue'
import infoUpdatePassword from './components/infoUpDatePassWord.vue'
@Component( {
  name: 'user-info',
  components: {
    lcTitle,
    infoInfo,
    infoUpdatePassword
  }
} )
export default class UserInfo extends Vue {

  activeName = 'infoInfo'

  tabChange ( v ) {
    this.activeName = v
  }

}
</script>


