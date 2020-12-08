import Vue from 'vue'
import { Component, Provide } from 'vue-property-decorator'
@Component( {
  name: 'data-basic'
} )
export default class DataBasic extends Vue {
  isShow: boolean = true
  @Provide()
  asynEcharts = import( '../utils/myEcharts' ).then( res => res.default )
}