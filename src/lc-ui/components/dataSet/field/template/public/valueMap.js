export default {
  data() {
    return {
      dataset: ""
    };
  },
  props: {
    field: "",
  },
  computed: {
    config() {
      return this.field.config.config
    },
    showKey() {
      return this.config.key || this.field.config.key
    }
  },
  methods: {
    optionLabel( item ) {
      let key = this.config.show;
      if ( !key ) {
        return "";
      }
      if ( typeof key === "string" ) {
        return item[ key ];
      }
      let val = [];
      key.forEach( ( k ) => {
        val.push( item[ k ] );
      } );
      return val.join( "-" );
    },
    change( val ) {
      this.field.checkRules();
      let map = this.field.map;
      if ( map instanceof Array ) {
        if ( val instanceof Array ) {
          // 暂时不做考虑
          // let arr = []
          // val.forEach(v=>{
          //     let record = this.dataset.value.find(
          //         record => record[this.showKey] === v
          //     );
          //     let obj = {};
          //     obj
          //     map.forEach((item) => {
          //         if (typeof item === "string") {
          //             obj[item] = record[item]
          //         } else {
          //             obj[item.to] = record[item.from]
          //         }
          //     });
          //     arr.push(obj)
          // })
          // this.field.value = arr
        } else if ( val ) {
          let record = this.dataset.value.find(
            record => record[ this.showKey ] === val
          );
          map.forEach( ( item ) => {
            if ( typeof item === "string" ) {
              this.$set( this.field.parent.value, item, record[ item ] );
            } else {
              this.$set( this.field.parent.value, item.to, record[ item.from ] );
            }
          } );
        } else {
          map.forEach( ( item ) => {
            if ( typeof item === "string" ) {
              this.$set( this.field.parent.value, item, undefined );
            } else {
              this.$set( this.field.parent.value, item.to, undefined );
            }
          } );
        }
      }
    }
  },
  created() {
    this.dataset = this.$dataSet( this.config )
    this.field.optionDs = this.dataset
    if ( !this.dataset.hasQuery && this.dataset.config.queryUrl ) {
      this.dataset.query();
    }
  },
};
