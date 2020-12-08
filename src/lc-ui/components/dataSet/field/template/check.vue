<template>
  <el-checkbox-group v-model="checkValue" @change="change">
    <el-checkbox :disabled="field.disabled">{{field.config.value}}</el-checkbox>
  </el-checkbox-group>
</template>

<script type="text/ecmascript-6">
import valueMap from "./public/valueMap";
export default {
  props: {
    field: "",
  },
  data() {
    return {
      checkValue: false
    }
  },
  methods: {
    change() {
      this.field.value = this.checkValue ? 1 : 0
    }
  }
};
</script>

<style lang="stylus" scoped>
</style>