import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import API from '../../../API/'
import { sortBy } from '../../../utils'
import { saleTypes } from '../const/index'
import { emptyRoundSvg } from '../const/svgPath'
@Component({
  name: 'product-freeze-sale-state'
})
export default class ProductFreezeSaleState extends GmvBasic {
  @Prop() queryType: string
  @Watch('queryType')
  queryTypeWatcher() {
    this.getData()
  }
  get title(): string {
    return '滞销商品属性'
  }

  allData: any = []

  get tableData() {
    return this.allData.concat()
  }

  get baseConfig() {
    return {
      label: { name: '类型' },
      spuNum: { name: '库存量' }
    }
  }
  get option() {
    let option = {
      tooltip: {
        trigger: 'item',
        formatter: ({ data, name, percent }) => {
          return `${name}<br/>库存量：${(data.value || 0)} 占比：${percent}% `
        }
      },
      color: ['rgb(135,193,69)', 'rgb(65,140,198)'],
      legend: [
        {
          left: 20,
          top: 20,
          data: this.allData.map(v => ({
            name: v.label,
            icon: 'path://' + emptyRoundSvg
          })),
          itemWidth: 10,
          width: '100%'
        }
      ],
      series: [
        {
          name: '全平台销量',
          type: 'pie',
          radius: ['0%', '60%'],
          center: ['55%', '63%'],
          label: {
            normal: {
              show: true
            },
            emphasis: {
              show: true
            }
          },
          data: this.allData.map(v => ({
            ...v,
            name: v.label,
            value: v.spuNum
          }))
        },
      ]
    }

    return option
  }
  getData() {
    this.$http(API.unsalableProductAttribute, { queryType: this.queryType }).then(({ data }) => {
      let d = data.data || []
      this.allData = d.map(v => ({
        ...v,
        label: v.label || '空白'
      }))
      this.drawChart()
    }, rej => {
      this.notifyError(rej.data.msg)
    })
  }

  afterDraw() {
    this.yexiao.on('click', ({ dataIndex }) => {
      this.$emit('choseLabel', this.allData[dataIndex])
    })
  }
}
