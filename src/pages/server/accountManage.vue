<template>
  <el-tabs v-model="activeName">
    <el-tab-pane name="monthCustomerAccount" label="月结客户对账" v-if="$permissionValidate(426)">
      <monthCustomerAccount v-if="$permissionValidate(426)"/>
    </el-tab-pane>
    <el-tab-pane
      name="trusteeshipAccount"
      label="托管商家对账"
      v-if="$permissionValidateWithEnv(1132,1131)"
    >
      <trusteeshipAccount v-if="$permissionValidateWithEnv(1132,1131)"/>
    </el-tab-pane>
  </el-tabs>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import monthCustomerAccount from './monthCustomerAccount'
import trusteeshipAccount from './trusteeshipAccount'

@Component({
  components: {
    monthCustomerAccount,
    trusteeshipAccount
  }
})
export default class AccountManage extends Vue {
  activeName = 'monthCustomerAccount'
  created() {
    this.activeName = this.$permissionValidate(426) ? 'monthCustomerAccount' : this.$permissionValidateWithEnv(1132, 1131) ? 'trusteeshipAccount' : ''
  }
}
</script>
