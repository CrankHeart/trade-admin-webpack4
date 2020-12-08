import GmvBasic from './gmvBasic.vue'
import { Component, Watch, Prop } from 'vue-property-decorator'
import API from '../../../API/'
import { sortBy } from '../../../utils'
import { saleTypes } from '../const/index'
import { emptyRoundSvg } from '../const/svgPath'
@Component({
  name: 'product-freeze-sale-brand'
})
export default class ProductFreezeSaleBrand extends GmvBasic {
  @Prop() queryType: string
  @Prop() label: string
  get title(): string {
    return '滞销商品品牌'
  }

  allData: any = []

  get tableData() {
    return this.allData.concat()
  }

  get baseConfig() {
    return {
      brandName: { name: '品牌' },
      stock: { name: '库存量' }
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
            name: v.brandName.split('/')[0],
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
            name: v.brandName.split('/')[0],
            value: v.stock
          }))
        },
      ]
    }

    return option
  }

  get requestOption() {
    let option = {
      queryType: this.queryType,
      label: this.label == '空白' ? '' : this.label
    }
    return option
  }
  @Watch('requestOption')
  requestOptionWatcher() {
    this.getData()
  }
  getData() {
    this.$http(API.unsalableBrands, this.requestOption).then(({ data }) => {
      let d = data.data || []
      this.allData = d
      this.drawChart()
    }, rej => {
      this.notifyError(rej.data.msg)
    })
  }

  afterDraw() {
    this.yexiao.on('click', ({ dataIndex }) => {
      this.$emit('choseBrand', this.allData[dataIndex])
    })
  }
}
