<template>
  <el-checkbox-group v-model="field.value" @change="change">
    <el-checkbox
      :disabled="field.disabled"
      v-for="item in dataset.value"
      :key="item[showKey]"
      :label="item[showKey]"
    >{{optionLabel(item)}}</el-checkbox>
  </el-checkbox-group>
</template>

<script type="text/ecmascript-6">
import valueMap from "./public/valueMap";
export default {
  mixins: [ valueMap ],
};
</script>

<style lang="stylus" scoped>
</style>