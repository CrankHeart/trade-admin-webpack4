import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import API from '../../../API/'
import { sortBy } from '../../../utils'
import { saleTypes } from '../const/index'
import { emptyRoundSvg } from '../const/svgPath'
@Component({
  name: 'product-hot-sale-spu-top'
})
export default class ProductHotSaleSpuTop extends GmvBasic {

  @Prop() begindate: string
  @Prop() saleType: string
  @Prop() brand: any

  get title(): string {
    return (this.brand && this.brand.brandName || '') + '品牌商品分布'
  }

  allData: any = []

  get tableData() {
    return this.allData.concat()
  }

  get baseConfig() {
    return this.saleType == '1' ? {
      spuName: { name: '商品名' },
      saleNum: { name: '销售量' }
    } : {
      spuName: { name: '商品名' },
      saleAmount: { name: '销售额' }
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
            name: v.spuName,
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
      start: 0,
      num: 20,
      brandId: brand.brandId
    }
    return o
  }
  @Watch('requestOption')
  requestOptionWatcher() {
    this.getData()
  }
  getData() {
    this.$http(API.spuSellingRank, this.requestOption).then(({ data }) => {
      this.allData = data.data || []
      this.drawChart()
    }, rej => {
      this.notifyError(rej.data.msg)
    })
  }

}


