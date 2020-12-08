import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop, Inject } from 'vue-property-decorator'
import API from '../../../API/'
import { provinces } from '../const/'

@Component( {
  name: 'product-brand-flow-region'
} )
export default class ProductBrandStateFlowRegion extends GmvBasic {

  @Prop() begindate: string
  @Prop() saleType: string
  @Prop() brand: any
  @Prop() label: string
  @Prop() spu: any
  get title (): string {
    return ( this.brand ? this.brand.brandName + '-' : '' ) + 'SPU商品分布【' + ( this.saleType == '0' ? '销售额' : '销售量' ) + '】'
  }

  allData: any = []

  get tableData () {
    return this.allData.concat()
  }

  get baseConfig () {
    return this.saleType == '0' ? {
      province: { name: '省份' },
      saleAmount: { name: '销售额' }
    } : {
      province: { name: '省份' },
      saleNum: { name: '销售量' }
    }
  }

  get option () {
    let option = {
      tooltip: {
        trigger: 'item',
        // formatter: `{b}<br/>销量: ¥{c}`
        formatter: ( { name, value } ) => {
          // console.log(name, value)
          if ( value ) {
            return `${name}<br/>${this.saleType == '0' ? '销售额' : '销售量'}:¥${value}`
          }
          return ''
        }
      },
      visualMap: {
        min: 0,
        max: 0,
        left: 30,
        bottom: 20,
        text: [ '高', '低' ],
        realtime: false,
        calculable: true,
        inRange: {
          color: [ '#fff', '#479ae6' ]
        }
      },
      series: [
        {
          name: this.geo.geoCn + '销量',
          type: 'map',
          mapType: this.geo.geoPY,
          roam: true,
          scaleLimit: {
            min: .5
          },
          label: {
            normal: {
              show: true
            },
            emphasis: {
              show: true
            }
          },
          data: []
        }
      ]
    };
    let max;
    let key = this.saleType == '0' ? 'saleAmount' : 'saleNum'
    this.allData.forEach( v => {
      if ( max ) {
        max = max <= v[ key ] ? v[ key ] : max
      } else {
        max = v[ key ]
      }
      // if (this.geo.geoPY !== 'china') {
      //   v.city = v.city || '其他'
      //   if (!new RegExp('/市$/').test(v.city)) {
      //     if (v.city == 'null') {
      //       v.city = ''
      //     } else {
      //       v.city += '市'
      //     }

      //   }
      //   option.series[0].data.push({
      //     ...v,
      //     value: v.gmv,
      //     name: v.city
      //   })
      // } else {
      v.province = v.province || '其他'
      option.series[ 0 ].data.push( {
        ...v,
        value: v[ key ],
        name: v.province.replace( /[省|市]$/, '' )
      } )
      // }

    } )

    option.visualMap.max = max
    return option
  }

  get requestOption () {
    let brand = this.brand || {}
    let spu = this.spu || {}
    let o: any = {
      queryType: this.saleType,
      begindate: this.begindate || '2017-1-1 00:00:00',
      brandId: brand.brandId,
      spuCode: spu.spu,
      label: this.label,
      start: 0,
      num: 20
    }
    return o
  }
  @Watch( 'requestOption' )
  requestOptionWatcher () {
    this.getData()
  }
  get geo () {
    return {
      geoCn: '全国',
      geoPY: 'china'
    }
  }
  injectScript () {
    return import( '../../../utils/map/' + this.geo.geoPY + '.json' )
  }
  geoJson: any = null
  getData () {
    let ajax = this.$http( API.mapDetails, this.requestOption )

    Promise.all( [ ajax, this.injectScript() ] ).then( ( [ { data }, geoJson ] ) => {
      let d = data.data || []
      this.geoJson = geoJson
      this.allData = d.concat( { 'city': 'null', 'gmv': '', 'province': '' } ) // 数据占位  避免出现空数据后canvas报错 
      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }

  beforeDraw () {

    if ( !this.geoJson ) {
      return new Promise( ( resolve, reject ) => {
        this.notifyError( '地图数据加载失败，请尝试刷新页面。若依然无法解决问题，请联系开发或者管理！' );
        reject()
      } )
    }

    return this.asynEcharts.then( echarts => {
      echarts.registerMap( this.geo.geoPY, this.geoJson );
    } )
  }
}