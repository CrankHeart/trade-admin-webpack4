<template>
  <component v-if="dataSet" :is="temp" :records="records" :dataSet="dataSet">
    <template slot="card-title" slot-scope="{card}">
      <slot name="card-title" :card="card"></slot>
    </template>
    <template slot="card-bottom" slot-scope="{card}">
      <slot name="card-bottom" :card="card"></slot>
    </template>
    <template slot="table-top">
      <slot name="table-top"></slot>
    </template>
    <template slot="table-center">
      <slot name="table-center"></slot>
    </template>
    <template slot="table-bottom">
      <slot name="table-bottom"></slot>
    </template>
  </component>
</template>

<script>
export default {
  name: "lc-dataset",
  props: {
    bindId: {
      default() {
        return ""
      }
    },
    dataset: {
      default() {
        return ""
      }
    }
  },
  data() {
    return {
      dataSet: ''
    }
  },
  computed: {
    temp() {
      let template = this.dataSet.config.template
      if ( template ) {
        if ( typeof ( template ) === 'string' ) {
          return () => Promise.resolve( require( `./template/${template}.vue` ).default )
        }
        return this.dataSet.config.template
      }
      if ( this.dataSet.isArray ) {
        return () => import( `./template/table.vue` )
      }
      return () => import( `./template/form.vue` )
    },
    records() {
      return this.dataSet.isArray ? this.dataSet.records : [ this.dataSet ]
    }
  },
  created() {
    this.dataSet = this.bindId ? this.$dataSet( this.bindId ) : this.dataset;
  }
}
</script>