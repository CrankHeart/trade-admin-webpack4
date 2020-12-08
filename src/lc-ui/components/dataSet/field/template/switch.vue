<template>
  <el-switch
    :disabled="field.disabled"
    v-model="value"
    active-color="#13ce66"
    inactive-color="#ff4949"
  ></el-switch>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    field: "",
  },
  computed: {
    value: {
      get() {
        return this.field.value ? true : false
      },
      set( val ) {
        this.field.value = val ? 1 : 0
      }
    }
  }
};
</script>