<template>
  <el-date-picker
    :disabled="field.disabled"
    v-model="val"
    :type="config.type"
    :placeholder="placeholder"
    :picker-options="field.pickerOptions"
    :clearable="field.clearable"
    :editable="field.editable"
    @change="change"
    style="width: 100%;max-width:100%"
  ></el-date-picker>
</template>

<script type="text/ecmascript-6">
import formeDate from '../../../../dataSet/public/formeDate'
export default {
  props: {
    field: "",
  },
  data() {
    return {
      val: ''
    };
  },
  computed: {
    config() {
      return this.field.config;
    },
    placeholder() {
      return this.field.placeholder || ( this.field.type === 'daterange' ? '选择日期范围' : '选择日期' )
    }
  },
  methods: {
    change() {
      let value
      if ( Array.isArray( this.val ) ) {
        value = this.val.map( v => formeDate( v ) );
      } else {
        value = formeDate( this.val )
      }
      this.field.value = value
      this.field.checkRules();
      this.field.root.emit( "fieldBlur", this.field, this.field.parent );
    },
  },
  created() {
    this.val = this.field.value
  }
};
</script>