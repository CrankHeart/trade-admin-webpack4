<template>
  <el-cascader
    :disabled="field.disabled"
    v-model="field.value"
    :placeholder="config.placeholder"
    :options="options"
    :clearable="field.clearable"
    :filterable="field.filterable"
    style="width: 100%;"
  ></el-cascader>
</template>

<script type="text/ecmascript-6">
export default {
  data() {
    return {
      dataset: {},
    };
  },
  props: {
    field: "",
  },
  computed: {
    config() {
      return this.field.config.config;
    },
    value() {
      return this.config.key;
    },
    label() {
      return this.config.show;
    },
    children() {
      return this.config.children;
    },
    options() {
      let options = this.dataset.value;
      if ( !this.value && !this.label && !this.children ) {
        if ( Array.isArray( options ) ) {
          return options;
        }
        return []
      }
      if ( Array.isArray( options ) ) {
        return this.formatOptions( options );
      }
      return []
    },
  },
  methods: {
    formatOptions( val ) {
      if ( !val ) {
        return;
      }
      let arr = [];
      val.forEach( ( item ) => {
        let option = {
          value: item[ this.value ],
          label: item[ this.label ],
        };
        let children = item[ this.children ];
        if ( children ) {
          option.children = this.formatOptions( children );
        }
        arr.push( option );
      } );
      return arr;
    },
  },
  created() {
    this.dataset = this.$dataSet( this.config )
    this.field.optionDs = this.dataset
    if ( !this.dataset.hasQuery ) {
      this.dataset.query();
    }
  },
};
</script>

<style lang="stylus" scoped>
</style>