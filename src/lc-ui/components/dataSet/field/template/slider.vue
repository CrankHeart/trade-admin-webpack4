<template>
  <el-slider
    :disabled="field.disabled"
    v-model="field.value"
    :min="field.min"
    :max="field.max"
    @change="change"
    :format-tooltip="field.formatTooltip"
  ></el-slider>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    field: "",
  },
  methods: {
    change() {
      this.field.checkRules();
      this.field.root.emit( "fieldBlur", this.field, this.field.parent );
    },
  },
};
</script>