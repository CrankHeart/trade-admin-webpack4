import GmvRegion from './gmvRegion'
import { Component, Prop, Watch } from 'vue-property-decorator'
import API from '../../../API/'
import { provinces } from '../const/'
import { thoundandSeparator } from '@/utils'

import tenantBasic from './tenantBasic'
@Component( {
  name: 'tenant-region',
  mixins: [ tenantBasic ]
} )
export default class TenantRegion extends GmvRegion {
  get geo () {
    let province: any = this.province || {}
    let name = province.name
    return {
      geoCn: name || '全国',
      geoPY: provinces[ name ] || 'china'
    }
  }
  @Prop()
  isHistory: boolean
  @Prop()
  isSaleCity: boolean
  @Prop()
  year: number
  @Prop( { type: [ Number, String ] } )
  type
  @Prop()
  month: number
  @Prop()
  regionProvince: string
  @Prop()
  region: string
  @Prop()
  userType: number
  @Prop( { default: () => { } } )
  province: any
  @Watch( 'province' )
  provinceWatcher ( v, o ) {
  }
  @Prop()
  curTab: number
  getData () {
    this.$nextTick( () => {
      let province = this.province || {}
      let url = ( () => {
        let name = province.name
        return this.curTab === 1 ?
          ( name ? API.getCityNum : API.getProvinceNum ) :
          ( name ? API.getCompanyCity : API.getCompanyProvince )
      } )()
      let ajax = this.$http( url, ( <any> this ).ajaxOption )
      Promise.all( [ ajax, this.injectScript() ] ).then( ( [ { data }, geoJson ] ) => {
        this.geoJson = geoJson
        let d = data.data || []
        d.forEach( v => {
          v.gmv = thoundandSeparator( ( v.gmv / 10000 ) )
        } )
        this.allData = d.length ? d : d.concat( { 'city': 'null', 'gmv': '', 'province': '' } ) // 数据占位  避免出现空数据后canvas报错 
        this.drawChart()
      }, rej => {
        this.notifyError( rej.data.msg )
      } )
    } )
  }
  get config (): any {
    let prop = this.geo.geoPY == 'china' ? 'province' : 'city'
    return this.curTab ? [
      { prop, label: '地区' },
      { prop: 'num', label: '客户数量' }
    ]
      : [
        { prop, label: '地区' },
        { prop: 'gmv', label: 'GMV' }
      ]
  }
  get option () {
    let option = {
      tooltip: {
        trigger: 'item',
        // formatter: `{b}<br/>销量: ¥{c}`
        formatter: ( { name, value } ) => {
          // console.log(name, value)
          if ( this.curTab ) {
            return value && `${name}<br/>数量: ${value}` || null
          }
          return value && `${name}<br/>销量: ¥${thoundandSeparator( ( +value ) )}万` || null
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
    let prop = ''
    if ( this.curTab ) {
      prop = 'num'
    } else {
      prop = 'gmv'
    }
    this.allData.forEach( v => {
      if ( max ) {
        max = max <= v[ prop ] ? v[ prop ] : max
      } else {
        max = v[ prop ]
      }
      if ( this.geo.geoPY !== 'china' ) {
        v.city = v.city || '其他'
        if ( !new RegExp( '/市$/' ).test( v.city ) ) {
          if ( v.city == 'null' ) {
            v.city = ''
          } else {
            v.city += '市'
          }

        }
        option.series[ 0 ].data.push( {
          ...v,
          value: v[ prop ],
          name: v.city
        } )
      } else {
        v.province = v.province || '其他'
        option.series[ 0 ].data.push( {
          ...v,
          value: v[ prop ],
          name: v.province.replace( /[省|市]$/, '' )
        } )
      }

    } )

    option.visualMap.max = max
    return option
  }


}
