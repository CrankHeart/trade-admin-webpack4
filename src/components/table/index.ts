import Vue from 'vue'
import { Component, Prop, Inject, Watch } from 'vue-property-decorator'
import lcTableConfig from './control.vue'
import { getterConfig } from '../../utils/'
interface Sort {
  priority?: string
  order?: string
}
import { Page } from '../../typing/index'

function sortFun (): Sort {
  return {}
}
@Component( {
  name: 'table-with-page',
  template: require( './table.html' ),
  components: {
    lcTableConfig
  }
} )
export default class TableWithPage extends Vue {

  @Prop( { default: true } )
  resizable: boolean
  @Prop( { default: sortFun } )
  sort: Sort
  @Prop( { default: () => [] } )
  config: [ object ]
  @Prop( { default: () => [] } )
  data: [ object ]
  @Prop( { default: () => { } } )
  expands: any
  @Prop( { type: [ Number, String ] } )
  height
  @Prop()
  maxHeight: number
  @Prop()
  page: Page
  @Prop( { default: false, type: Boolean } )
  selection: boolean
  @Prop( { default: false } )
  loading: boolean
  @Prop( { default: '' } )
  loadingText: string
  @Prop( { default: true } )
  hasPage: boolean
  @Prop( { default: true } )
  isScroll: boolean
  @Prop( { default: void 0 } )
  scrollOptions: any
  @Prop( { default: false } )
  showSummary: boolean
  @Prop( { type: Function } )
  getSummaries: any
  @Prop( { type: Function } )
  selectable
  get scrollTable () {
    let options = this.scrollOptions || {}
    options = {
      offset: -110,
      ...options
    }
    return options
  }
  curChange ( cur ) {
    if ( cur == this.page.cur ) return
    this.$scrollTo( this.$parent.$el, 500, this.scrollTable )
    // this.$scrollTo( this.$parent.$el, 500, { offset: -110 } )
    this.$emit( 'cur-change', cur )
  }
  sizeChange ( v ) {
    this.$scrollTo( this.$parent.$el, 500, this.scrollTable )
    this.$emit( 'size-change', v )
  }
  get pageSizes () {
    let { sizes, num } = this.page
    return sizes || [ num ]
  }
  sortChange ( v ) {
    this.$emit( 'data-sort-change', v )
  }
  selectionChange ( v ) {
    this.$emit( 'data-selection-change', v )
  }
  expandFun ( v ) {
    this.$emit( 'data-expand', v )
  }
  clearSelection () {
    let mutationTable: any = this.$refs.mutationTable
    mutationTable.clearSelection()
  }
  @Prop()
  controllerName: string
  storeConfig: any[] = []
  created () {
    this.initController()
  }
  activated () {
    this.initController()
  }
  initController () {
    if ( this.controllerName ) {
      this.storeConfig = ( localStorage.getItem( `${this.controllerName}Config` ) || '' ).split( ',' ).filter( v => v )
    }
  }
  get filterConfig () {
    if ( this.controllerName && this.storeConfig.length ) {
      return this._config.filter( v => v.isChecked )
    }
    return this.config
  }
  get _config () {
    return getterConfig( this.storeConfig, this.config )
  }
  setConf ( list ) {
    localStorage.setItem( `${this.controllerName}Config`, list )
    this.storeConfig = list
  }
}
