import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import API from '../../../API/'
import { sortBy } from '../../../utils'
import { saleTypes } from '../const/index'
import { emptyRoundSvg } from '../const/svgPath'
@Component({
  name: 'product-freeze-sale-spu'
})
export default class ProductFreezeSaleSpu extends GmvBasic {
  @Prop() queryType: string
  @Prop() label: string
  @Prop() brand: any
  get title(): string {
    return '滞销商品'
  }

  allData: any = []

  get tableData() {
    return this.allData.concat()
  }

  get baseConfig() {
    return {
      productName: { name: '商品名' },
      stock: { name: '库存量' }
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
          data: this.allData.map(v => v.productName)
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
            ...v,
            name: v.productName,
            value: v.stock
          }))
        }
      ]
    }
    return option
  }

  get requestOption() {
    let brand: any = this.brand || {}
    let option = {
      queryType: this.queryType,
      label: this.label == '空白' ? '' : this.label,
      brandId: brand.brandId
    }
    return option
  }
  @Watch('requestOption')
  requestOptionWatcher() {
    this.getData()
  }
  getData() {
    this.$http(API.unsalableProducts, this.requestOption).then(({ data }) => {
      let d = data.data || []
      this.allData = d.slice(0, 20)
      this.drawChart()
    }, rej => {
      this.notifyError(rej.data.msg)
    })
  }

}
