import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import API from '../../../API/'
import { sortBy } from '../../../utils'
import { unsalableTime } from '../const/index'
import { emptyRoundSvg } from '../const/svgPath'
@Component({
  name: 'product-freeze-sale-time'
})
export default class ProductFreezeSaleTime extends GmvBasic {

  get title(): string {
    return '滞销时间分布'
  }

  allData: any = []

  get tableData() {
    return this.allData.concat()
  }

  get baseConfig() {
    return {
      name: { name: '类型' },
      value: { name: '库存' }
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
            name: v.name,
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
          data: this.allData
        },
      ]
    }
    return option
  }
  formatType(type) {
    for (let i = 0, l = unsalableTime.length; i < l; i++) {
      let m = unsalableTime[i]
      if (m.id == type) {
        return m.name
      }
    }
    return
  }
  getData() {
    this.$http(API.unsalableSpuNum).then(({ data }) => {
      let d = data.data || {}

      this.allData = Object.keys(d).map(v => ({
        name: this.formatType(v),
        queryType: v,
        value: d[v]
      }))
      this.drawChart()
    }, rej => {
      this.notifyError(rej.data.msg)
    })
  }

  afterDraw() {
    this.yexiao.on('click', ({ dataIndex }) => {
      this.$emit('choseQueryType', this.allData[dataIndex])
    })
  }
}
