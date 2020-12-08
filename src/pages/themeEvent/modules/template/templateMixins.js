const isPlainObj = ( obj ) => !Object.keys( obj ).length
export default {
  name: 'template-mixins',
  props: {
    value: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      initModuleData: {},
      extendProps: [],
      productConfig: []
    }
  },
  computed: {
    moduleData: {
      get() {
        return this.value
      },
      set( v ) {
        this.$emit( 'change', v )
        this.$emit( 'input', v )
      }
    },
    floorProducts() {
      // let o = {}
      let arr = []
      this.value.floorProducts.forEach( val => {
        // let {spuId} = val
        // if ( !o[ spuId ] ) {
        // o[ spuId ] = val
        arr.push( {
          ...val,
          ...val.goodsVO,
          goodsVO: undefined
        } )
        // }
      } )
      return arr
    },
    floorContainers() {
      return this.value.floorContainers
    },
    productList() {
      return this.floorProducts.length && this.floorProducts || this.floorContainers
    }
  },
  created() {
    let o = {}

    if ( !isPlainObj( this.initModuleData ) ) {
      o = this.initModuleData
    }
    this.moduleData = Object.assign( {}, o, this.moduleData, { myProps: [].concat( this.extendProps ) }, {
      productConfig: this.productConfig
    } )
  }
}



