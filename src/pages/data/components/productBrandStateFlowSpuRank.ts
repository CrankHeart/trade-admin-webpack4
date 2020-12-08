import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import API from '../../../API/'
import { sortBy } from '../../../utils'
import { saleTypes } from '../const/index'
@Component({
  name: 'product-brand-flow-spu-rank'
})
export default class ProductBrandFlowSpuRank extends GmvBasic {
  @Prop() begindate: string
  @Prop() saleType: string
  @Prop() label: string

  @Prop() brand: any
  get title(): string {
    return (this.brand ? this.brand.brandName + '-' : '') + 'SPU商品' + (this.saleType == '0' ? '销售额' : '销售量') + '排行'
  }

  allData: any = []

  get tableData() {
    return this.allData.concat()
  }

  get baseConfig() {
    return this.saleType == '0' ? {
      spuName: { name: '商品' },
      saleAmount: { name: '销售额' }
    } : {
      spuName: { name: '商品' },
      saleNum: { name: '销售量' }
    }
  }

  get option() {
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
            },
            formatter: (value, index) => {
              let num = 10
              return value.length > num ? value.substr(0, num) + '...' : value
            }
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          data: this.allData.map(v => v.spuName)
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
              color: ['#f5f5f5']
            }
          }
        }
      ],
      series: [
        {
          type: 'bar',
          barWidth: 20,
          itemStyle: {
            normal: {
              color: 'rgba(38, 164, 214, 1)'
            }
          },
          data: this.allData.map(v => ({
            name: v.brandName,
            value: this.saleType == '1' ? v.saleNum : v.saleAmount
          }))
        }
      ]
    }
    return option
  }


  get requestOption() {
    let brand = this.brand || {}
    let o: any = {
      queryType: this.saleType,
      begindate: this.begindate || '2017-1-1 00:00:00',
      brandId: brand.brandId,
      label: this.label,
      start: 0,
      num: 20
    }
    return o
  }
  @Watch('requestOption')
  requestOptionWatcher() {
    this.getData()
  }
  getData() {
    this.$http(API.brandSpuRank, this.requestOption).then(({ data }) => {
      this.allData = data.data || []
      this.drawChart()
    }, rej => {
      this.notifyError(rej.data.msg)
    })
  }

  afterDraw() {
    this.yexiao.on('click', ({ dataIndex }) => {
      console.log(this.allData[dataIndex])
      this.$emit('choseSpu', this.allData[dataIndex])
    })
  }
}