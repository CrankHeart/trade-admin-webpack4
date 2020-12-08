import { Component, Watch, Inject } from 'vue-property-decorator'

import GmvBasic from './gmvBasic.vue'
import API from '../../../API'
import { discountType } from '../const'

@Component( {
  name: 'activity-data',
  components: {
    GmvBasic
  }
} )
export default class ActivityData extends GmvBasic {
  // app.title = '堆叠柱状图'
  @Inject() formatMyDate

  hasView: boolean = false

  activityData: any[] = []

  get dateRange () {
    return this.other.dateRange
  }

  get xAxisData () {
    let keys = Object.keys( this.activityData )
    keys.sort( ( a, b ) => {
      let num_a = +a.split( '-' ).map( v => {
        if ( v.length === 1 ) {
          v = '0' + v
        }
        return v
      } ).join( '' )
      let num_b = +b.split( '-' ).map( v => {
        if ( v.length === 1 ) {
          v = '0' + v
        }
        return v
      } ).join( '' )
      return num_a - num_b
    } )

    return keys || []
  }

  get seriesData () {

    let activityData = this.activityData
    let seriesData: any[] = []
    let length = this.xAxisData.length
    let colors = [ 'rgba(38, 164, 214, 1)', '#94bf3c', '#ffc020' ]

    discountType.forEach( ( v, sIndex ) => {
      let data = Array( length ).fill( 0 )
      let barObj = {
        type: 'bar',
        name: v.name,
        data: data,
        itemStyle: {
          normal: {
            color: colors[ sIndex ]
          }
        }
      }

      this.xAxisData.forEach( ( key, index ) => {
        activityData[ key ].forEach( ( item ) => {
          if ( item.discountType === v.id ) {
            barObj.data[ index ] += 1
          }
        } )
      } )

      seriesData.push( barObj )
    } )
    return seriesData
  }

  get option () {
    let legend = discountType.map( v => v.name )
    let option: any = {
      legend: {
        data: legend
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a}：{c}个',
        axisPointer: {
          type: 'shadow',
          label: {
            show: true
          }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          // boundaryGap: true,
          type: 'category',
          data: [],
          axisLabel: {
            // rotate: 70,
            textStyle: {
              fontSize: 12,
              color: '#9397a2'
            }
          },
        }
      ],
      yAxis: [
        {
          type: 'value',
          // max: 25
        },
      ],
      series: this.seriesData
    }
    let result = this.xAxisData.map( v => {
      let arr = v.split( '-' )
      return `${arr[ 0 ]}年${arr[ 1 ]}月第${arr[ 2 ]}周`
    } )
    option.xAxis[ 0 ].data = result

    return option
  }

  @Watch( 'dateRange', {
    deep: true
  } )
  watchDateRange ( newVal ) {
    this.getData()
  }

  formatTitle (): string {
    return '每周活动数量统计'
  }

  get discountStartTime () {
    let start = this.dateRange[ 0 ]
    return this.formatMyDate( start, 'yyyy-MM-dd hh:mm:ss' )
  }

  get discountEndTime () {
    let end = this.dateRange[ 1 ]
    return this.formatMyDate( end, 'yyyy-MM-dd hh:mm:ss', true )
  }

  getData () {
    // this.$permissionValidateWithNotify( 681 )
    if ( this.dateRange.length !== 2 ) {
      return
    }
    let start = this.dateRange[ 0 ]
    let end = this.dateRange[ 1 ]

    this.yexiao.showLoading()
    this.$http( API.selectDiscountSales, {
      discountStartTime: this.discountStartTime,
      discountEndTime: this.discountEndTime
    } ).then( ( { data } ) => {
      this.activityData = data.data || []

      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }

  afterDraw () {
    let self = this
    this.yexiao.on( 'click', res => {
      console.log( 'res', res )
      let { seriesIndex, dataIndex } = res
      let key = this.xAxisData[ dataIndex ]
      let type = discountType[ seriesIndex ]
      let data = self.activityData[ key ].filter( v => v.discountType === type.id )[ 0 ] || {}
      self.$emit( 'change', {
        ...data,
        discountStartTime: self.discountStartTime,
        discountEndTime: self.discountEndTime
      } )
    } )
  }

}
