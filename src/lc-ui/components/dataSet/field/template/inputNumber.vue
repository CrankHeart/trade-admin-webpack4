<template>
  <el-input-number :disabled="field.disabled" v-model="num" :min="field.min" :max="field.max"></el-input-number>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    field: "",
  },
  data() {
    return {
      num: this.field.value
    }
  },
  watch: {
    num() {
      let fixed = this.field.fixed
      let mi
      if ( fixed !== undefined && fixed !== null ) {
        mi = Math.pow( 10, fixed )
        if ( Number.isInteger( this.num * mi ) ) {
          this.field.value = this.num
        } else {
          let value = Math.round( ( this.num + Number.EPSILON ) * mi ) / mi
          this.$nextTick( () => {
            this.num = value
            this.field.value = value
          } )
        }
      } else {
        this.field.value = this.num
      }
    },
    'field.value'() {
      this.num = this.field.value
    }
  }
};
</script>