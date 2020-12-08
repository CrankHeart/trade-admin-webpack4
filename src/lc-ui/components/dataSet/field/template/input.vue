<template>
  <el-input
    :disabled="field.disabled"
    :maxlength="field.maxlength"
    v-model="field.value"
    :type="field.type"
    :placeholder="placeholder"
    @blur="change"
  ></el-input>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    field: "",
  },
  computed: {
    placeholder() {
      return this.field.placeholder || '请输入'
    }
  },
  methods: {
    change() {
      this.field.checkRules();
      this.field.root.emit( "fieldBlur", this.field, this.field.parent );
    },
  },
};
</script>