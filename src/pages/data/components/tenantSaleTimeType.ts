import GmvUser from './gmvUser'
import { Component, Prop, Watch } from 'vue-property-decorator'
import API from '../../../API/'
import { emptyRoundSvg } from '../const/svgPath'
import tenantBasic from './tenantBasic'
import { userTypeObj } from '../../order/const/orderSearchCondition'
@Component( {
  name: 'tenant-sale-time-type',
  mixins: [ tenantBasic ]
} )
export default class TenantSaleTimeType extends GmvUser {
  @Prop()
  isSaleCity: boolean
  @Prop( { default: ( new Date() ).getFullYear() } )
  year: number
  @Prop( { type: [ Number, String ] } )
  type
  @Prop( { default: ( new Date() ).getMonth() + 1 } )
  month: number
  @Prop()
  regionProvince: string
  @Prop()
  userType: number
  @Prop()
  salesDepartmentsType: number
  @Prop()
  curTab: number
  @Prop()
  region: string
  @Prop( { default: false } )
  isSalesDepartment: boolean
  formatTitle () {
    let formatTypes: any = ( <any> this ).formatTypes
    let user = userTypeObj[ this.userType ]
    return ( this.region || '' ) + ( this.regionProvince || '' ) + formatTypes( this.type ) + ( user && user.name || '' ) + '上次交易时间分类'
  }
  get baseConfig (): any {
    return {
      myLastTadeType: { name: '上次交易时间' },
      lastTadeNum: { name: '客户数量' }
    }
  }
  salesTimeType: any = {
    0: '当月（复购用户）',
    1: '<30天（不含当月复购用户）',
    2: '30~60天',
    3: '>60天',
    4: '未知',
  }
  formatSaleTimeType ( id ) {
    return this.salesTimeType[ id ]
  }
  getData () {
    this.yexiao.showLoading()
    this.$http( API.getByLastTrading, ( <any> this ).ajaxOption ).then( ( { data } ) => {
      let d = data.data || []
      this.allData = d.map( v => ( { ...v, myLastTadeType: this.formatSaleTimeType( v.lastTadeType ) } ) ).filter( v => v.lastTadeNum )
      this.drawChart()
    }, rej => {
      this.notifyError( rej.data.msg )
    } )
  }
  get option (): any {
    let colors = [
      { itemStyle: { normal: { color: '#94bf3c' } } },
      { itemStyle: { normal: { color: '#ffc020' } } },
      { itemStyle: { normal: { color: '#fe7065' } } },
      { itemStyle: { normal: { color: '#5a8eca' } } },
      { itemStyle: { normal: { color: '#dd9213' } } }
    ]
    let option = {

      tooltip: {
        trigger: 'item',
        formatter: ( { name, percent, value } ) => `${name}<br/>销量：${this.curTab ? value : '¥' + this.toTenThousand( value )} 占比：${percent}%`
      },
      legend: [
        {
          left: 20,
          top: 20,
          data: this.allData.map( v => v.myLastTadeType ),
          itemWidth: 10,
          width: '100%'
        }
      ],
      series: [
        {
          name: '全平台销量',
          type: 'pie',
          radius: [ '0%', '65%' ],
          center: [ '50%', '63%' ],
          label: {
            normal: {
              show: true,
              formatter: `{b}`
            },
            emphasis: {
              show: true
            }
          },
          data: this.allData.map( v => ( {
            ...v,
            name: v.myLastTadeType,
            value: v.lastTadeNum
          } ) )
        },
      ]
    }

    return option
  }
  afterDraw () {
    this.yexiao.on( 'click', ( { name } ) => {
      for ( let i in this.salesTimeType ) {
        if ( this.salesTimeType[ i ] === name ) {
          this.$emit( 'chose-saleTimeType', +i )
          break
        }
      }
    } )
  }
}
