<template>
  <component :is="temp" :record="record">
    <template slot="card-title" slot-scope="{card}">
      <slot name="card-title" :card="card"></slot>
    </template>
    <template slot="card-bottom" slot-scope="{card}">
      <slot name="card-bottom" :card="card"></slot>
    </template>
  </component>
</template>

<script>
export default {
  name: "lc-record",
  props: {
    record: {
      default: ""
    }
  },
  computed: {
    isFromCard() {
      return this.record.config.layout && this.record.config.layout.modules
    },
    temp() {
      let template = this.record.template
      if ( !template ) {
        if ( this.isFromCard ) {
          return () => import( `./template/fromCard.vue` )
        }
        return () => import( `./template/default.vue` )
      }
      if ( typeof ( template ) === 'string' ) {
        return () => Promise.resolve( require( `./template/${template}.vue` ).default )
      }
      return template
    }
  }
}
</script>