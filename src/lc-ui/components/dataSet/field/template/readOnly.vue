<template>
  <span :style="style" @click="fieldClick">{{showValue}}</span>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    field: "",
  },
  computed: {
    style() {
      let style = this.field.config.style
      if ( style instanceof Function ) {
        return style( this.field )
      }
      return style
    },
    showValue() {
      if ( this.dataset ) {
        let config = this.field.config.config
        let key = config.key || this.field.config.key
        let currentRecord = this.dataset.value.find( record => record[ key ] === this.field.value )
        if ( !currentRecord ) {
          return ''
        }
        if ( config.show instanceof Array ) {
          let val = []
          config.show.forEach( name => {
            val.push( currentRecord[ name ] )
          } )
          return val.join( '-' )
        }
        return currentRecord[ config.show ]
      }
      return this.field.value
    }
  },
  methods: {
    fieldClick() {
      this.field.root.emit( 'fieldClick', this.field )
    }
  },
  created() {
    let config = this.field.config.config
    if ( config ) {
      this.dataset = this.$dataSet( config );
      if ( !this.dataset.hasQuery && !this.dataset.config.data ) {
        this.dataset.query();
      }
    }
  },
};
</script>