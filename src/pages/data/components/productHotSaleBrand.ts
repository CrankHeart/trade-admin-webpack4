import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import API from '../../../API/'
import { sortBy } from '../../../utils'
import { emptyRoundSvg } from '../const/svgPath'
import { thoundandSeparator } from '@/utils'
@Component( {
  name: 'product-hot-sale-brand'
} )
export default class ProductHotSaleBrand extends GmvBasic {

  @Prop() begindate: string
  @Prop() saleType: string

  get title (): string {
    return '各品牌占比'
  }

  allData: any = []

  get tableData () {
    return this.allData.concat()
  }

  get baseConfig () {
    return this.saleType == '1' ? {
      saleNum: { name: '销售量' },
      brandName: { name: '品牌' }
    } : {
      saleAmount: { name: '销售额' },
      brandName: { name: '品牌' }
    }
  }
  get option () {
    let option = {
      tooltip: {
        trigger: 'item',
        formatter: ( { data, name, percent } ) => {
          return this.saleType == '1' ? `${name}<br/>销售量：${( data.value || 0 )} <br/>占比：${percent}% ` : `${name}<br/>销售额： ¥ ${thoundandSeparator( ( data.value || 0 ) )} <br/>占比：${percent}%`
        }
      },
      color: [ 'rgb(135,193,69)', 'rgb(65,140,198)' ],
      legend: [
        {
          left: 20,
          top: 20,
          data: this.allData.map( v => ( {
            name: v.brandName.split( '/' )[ 0 ],
            icon: 'path://' + emptyRoundSvg
          } ) ),
          itemWidth: 5,
          orient: 'vertical',
          height: 300
        }
      ],
      series: [
        {
          name: '全平台销量',
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
          data: this.allData.map( v => ( {
            ...v,
            value: this.saleType == '1' ? v.saleNum : v.saleAmount,
            name: v.brandName.split( '/' )[ 0 ]
          } ) )
        },
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
    this.$http( API.brandSelling, this.requestOption ).then( ( { data } ) => {
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
