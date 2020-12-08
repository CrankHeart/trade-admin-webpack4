import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop, Inject } from 'vue-property-decorator'
import API from '../../../API/'
import { provinces } from '../const/'
import { thoundandSeparator } from '@/utils'

@Component( {
  name: 'gmv-region'
} )
export default class GmvRegion extends GmvBasic {

  // @Prop()
  // year: number
  // @Watch('year')
  // yearWatcher(v) {
  //   // if (typeof v !== 'string') return;
  //   this.getData()
  // }
  @Prop()
  month: number
  @Watch( 'month' )
  monthWatcher ( v ) {
    this.getData()
  }

  @Prop()
  userType: any
  @Watch( 'userType' )
  userTypeWatcher ( v ) {
    this.getData()
  }
  @Prop()
  province: any
  @Watch( 'province' )
  provinceWatcher ( v, o ) {
    if ( v.name == o.name ) return
    this.myTitle = this.geo.geoCn
    this.getData()
  }

  myTitle: string = '全国'
  get title () {
    return this.myTitle
  }
  geoJson: any = null

  get config () {
    return 'china' !== this.geo.geoPY ? [
      { prop: 'city', label: '地区' },
      { prop: 'gmv', label: 'GMV' }
    ] : [
      { prop: 'province', label: '地区' },
      { prop: 'gmv', label: 'GMV' }
    ]
  }
  get tableData () {
    return this.allData
  }
  get geo () {
    let province: any = this.province
    let name = province.name
    return {
      geoCn: name || '全国',
      geoPY: provinces[ name ] || 'china'
    }
  }
  injectScript () {
    return import( '../../../utils/map/' + this.geo.geoPY + '.json' )
  }
  getData () {
    this.$nextTick( () => {
      let o: any = {
        year: this.year,
        month: this.month,
        email: this.realEmail
      }
      let province = this.province.name
      if ( province ) {
        if ( !/[省|市|区]$/.test( province ) ) {
          o.province = this.formatProvinceName( province )
        } else {
          o.province = province
        }
      }
      if ( this.userType ) {
        o.userType = this.userType
      }
      let ajax = this.$http( this.province.name ? API.getCity : API.getProvince, o )
      Promise.all( [ ajax, this.injectScript() ] ).then( ( [ { data }, geoJson ] ) => {
        data.data = data.data || []
        this.geoJson = geoJson
        this.allData = data.data.concat( { 'city': 'null', 'gmv': '', 'province': '' } ) // 数据占位  避免出现空数据后canvas报错 
        this.drawChart()
      }, rej => {
        this.notifyError( rej.data.msg )
      } )
    } )
  }

  allData: any = []
  get option () {
    let option = {
      tooltip: {
        trigger: 'item',
        // formatter: `{b}<br/>销量: ¥{c}`
        formatter: function ( { name, value } ) {
          // console.log(name, value)
          if ( value ) {
            return `${name}<br/>销量: ¥${thoundandSeparator( value )}`
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
    this.allData.forEach( v => {
      if ( max ) {
        max = max <= v.gmv ? v.gmv : max
      } else {
        max = v.gmv
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
          value: v.gmv,
          name: v.city
        } )
      } else {
        v.province = v.province || '其他'
        option.series[ 0 ].data.push( {
          ...v,
          value: v.gmv,
          name: v.province.replace( /[省|市]$/, '' )
        } )
      }

    } )

    option.visualMap.max = max
    return option
  }
  get notChinaMap (): boolean {
    return this.geo.geoPY !== 'china'
  }
  formatProvinceName ( t ) {
    switch ( t ) {
      case '宁夏':
        return '宁夏回族自治区';
      case '广西':
        return '广西壮族自治区';
      case '北京':
      case '上海':
      case '天津':
      case '重庆':
        return t + '市';
      case '香港':
      case '台湾':
      case '澳门':
      case '全国':
        return t;
      default: return t + '省'
    }
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

  afterDraw () {
    this.yexiao.off( 'click' )

    if ( this.geo.geoPY == 'china' ) {
      this.yexiao.on( 'click', ( params ) => {
        this.$emit( 'chose-city', params )
      } )
    }
  }
}