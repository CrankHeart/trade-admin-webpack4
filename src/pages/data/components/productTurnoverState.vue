<script lang="ts">
import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import { productTurnoverShowTypes, productTurnoverTurnTypes } from '../const'
import { goodLabels } from '../../product/const'
import API from '../../../API/'
import { emptyRoundSvg } from '../const/svgPath'
import { matchArrItem } from '../../../utils'

@Component( {
  name: 'product-turnover-state'
} )
export default class ProductTurnoverState extends GmvBasic {
  @Prop()
  showType: number
  @Prop()
  year: number
  @Prop()
  month: number
  @Prop()
  turnType: number
  get requestOption () {
    return {
      showType: this.showType,
      turnType: this.turnType,
      year: this.year,
      month: this.month
    }
  }
  get title () {
    return '商品属性分布'
  }
  @Watch( 'requestOption' )
  requestOptionWatcher ( v ) {
    this.getData()
  }
  get baseConfig () {
    let item = matchArrItem( this.showType, productTurnoverShowTypes, 'id' )
    return {
      name: { name: '类型' },
      [ item.prop ]: { name: item.name }
    }
  }
  getData () {
    this.$http( API.getSkuPropertySummarys, this.requestOption ).then( ( { data } ) => {
      let prop = matchArrItem( this.showType, productTurnoverShowTypes, 'id' ).prop
      let d = data.data || []
      this.allData = d.map( v => ( { ...v, value: v[ prop ], name: matchArrItem( v.goodLabel, goodLabels, 'id' ).name } ) )
      this.drawChart()
    } )
  }

  allData: any = []
  get tableData () {
    return this.allData.concat()
  }
  get option () {
    let option = {
      tooltip: {
        trigger: 'item'
      },
      legend: [
        {
          left: 20,
          top: 20,
          data: this.allData,
          itemWidth: 10,
          width: '100%'
        }
      ],
      color: [ 'rgb(135,193,69)', 'rgb(65,140,198)' ],
      series: [
        {
          name: matchArrItem( this.showType, productTurnoverShowTypes, 'id' ).name,
          type: 'pie',
          radius: [ '0%', '60%' ],
          center: [ '55%', '63%' ],
          label: {
            normal: {
              show: true
            },
            emphasis: {
              show: true
            }
          },
          data: this.allData
        },
      ]
    }

    return option
  }
}
</script>

