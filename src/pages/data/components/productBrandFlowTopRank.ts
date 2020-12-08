import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import API from '../../../API/'
import { sortBy, thoundandSeparator } from '../../../utils'
import { saleTypes } from '../const/index'
@Component( {
  name: 'product-brand-flow-top-rank'
} )
export default class ProductBrandFlowTopRank extends GmvBasic {
  @Prop() saleType: string
  @Prop() begindate: string
  get title (): string {
    return 'TOP20品牌' + ( this.saleType == '0' ? '销售额' : '销售量' ) + '排行'
  }

  allData: any = []

  get tableData () {
    return this.allData.concat()
  }

  get baseConfig () {
    return this.saleType == '0' ? {
      brandName: { name: '品牌' },
      saleAmount: { name: '销售额' }
    } : {
      brandName: { name: '品牌' },
      saleNum: { name: '销售量' }
    }
  }

  get option () {

    let option = {
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'shadow',
          label: {
            show: true
          }
        }
      },
      legend: {
        data: [],
        itemGap: 50,
        bottom: 10,
        borderColor: '#000'
      },
      grid: {
        top: '7%',
        left: '2%',
        right: '2%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          axisLabel: {
            rotate: 70,
            textStyle: {
              fontSize: 12,
              color: '#9397a2'
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          data: this.allData.map( v => v.brandName.split( '/' )[ 0 ] )
        }
      ],
      yAxis: [
        {
          axisLabel: {
            textStyle: {
              fontSize: 14,
              color: '#9397a2'
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              width: 1,
              color: [ '#f5f5f5' ]
            }
          }
        }
      ],
      series: [
        {
          type: 'bar',
          itemStyle: {
            normal: {
              color: 'rgba(38, 164, 214, 1)'
            }
          },
          data: this.allData.map( v => ( {
            name: v.brandName,
            value: this.saleType == '1' ? v.saleNum : v.saleAmount
          } ) ),
          formatter: ( val ) => thoundandSeparator( val )
        }
      ]
    }
    return option
  }
  get requestOption () {
    let o: any = {
      queryType: this.saleType,
      begindate: this.begindate || '2017-1-1 00:00:00',
      start: 0,
      num: 20
    }
    return o
  }
  @Watch( 'requestOption' )
  requestOptionWatcher () {
    this.getData()
  }
  getData () {
    this.$http( API.brandRank, this.requestOption ).then( ( { data } ) => {

      this.allData = data.data || []
      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }

  afterDraw () {
    this.yexiao.on( 'click', ( { dataIndex } ) => {
      this.$emit( 'choseBrand', this.allData[ dataIndex ] )
    } )
  }
}