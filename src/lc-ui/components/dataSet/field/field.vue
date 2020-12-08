<template>
  <component :is="temp" :field="field"></component>
</template>

<script>
export default {
  name: "lc-field",
  props: {
    field: ""
  },
  computed: {
    temp() {
      if ( !this.field.editor ) {
        return () => import( `./template/readOnly.vue` )
      }
      return this.field.template || ( () => Promise.resolve( require( `./template/${this.field.editor}.vue` ).default ) )
    }
  },
  methods: {}
};
</script>