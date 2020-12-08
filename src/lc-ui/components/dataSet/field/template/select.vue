<template>
  <el-select
    v-model="field.value"
    :placeholder="placeholder"
    @change="change"
    :multiple="field.multiple"
    :clearable="field.clearable"
    :filterable="field.filterable"
    style="width: 100%;"
    :disabled="field.disabled"
  >
    <el-option
      v-for="item in dataset.value"
      :key="item[showKey]"
      :label="optionLabel(item)"
      :value="item[showKey]"
    ></el-option>
  </el-select>
</template>

<script type="text/ecmascript-6">
import valueMap from "./public/valueMap";
export default {
  mixins: [ valueMap ],
  computed: {
    placeholder() {
      return this.field.placeholder || '请选择'
    }
  }
};
</script>