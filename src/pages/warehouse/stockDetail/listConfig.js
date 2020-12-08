import {
  changeGoodsStatus,
  isOrNot,
  bland
} from '../optionConfig/index'
export default {
  queryUrl: '',
  visibleCtr: true,
  queryFields: {
    labelWidth: '130px',
    fields: [ {
      name: '货主',
      key: 'num',
      editor: 'select',
      clearable: true,
      filterable: true,
      config: changeGoodsStatus
    }, {
      name: 'SKU编码',
      key: 'num',
      editor: 'input'
    }, {
      name: '商品名称',
      key: 'num',
      editor: 'input'
    }, {
      name: '商品标签',
      key: 'num',
      editor: 'select',
      clearable: true,
      config: changeGoodsStatus
    }, {
      name: '品牌',
      key: 'num',
      editor: 'select',
      clearable: true,
      filterable: true,
      config: bland
    }, {
      name: '批号',
      key: 'num',
      editor: 'input'
    }, {
      name: '入库日期',
      key: 'num',
      editor: 'date',
      type: 'daterange',
      clearable: true,
      placeholder: '请选择时间范围进行查询'
    }, {
      name: '所属仓库',
      key: 'num',
      editor: 'select',
      clearable: true,
      filterable: true,
      config: changeGoodsStatus
    }, {
      name: '库存状态',
      key: 'num',
      editor: 'select',
      clearable: true,
      filterable: true,
      config: changeGoodsStatus
    }, {
      name: '失效日期',
      key: 'num',
      editor: 'date',
      type: 'daterange',
      clearable: true,
      placeholder: '请选择时间范围进行查询'
    } ]
  },
  page: true,
  fieldWidth: '200px',
  record: {
    fields: [ {
      name: '货主',
      key: 'num'
    }, {
      name: '所属仓库',
      key: 'num'
    }, {
      name: 'SKU编码',
      key: 'num'
    }, {
      name: '商品标签',
      key: 'num'
    }, {
      name: '商品名称',
      key: 'num'
    }, {
      name: '规格',
      key: 'num'
    }, {
      name: '品牌',
      key: 'num'
    }, {
      name: '单位',
      key: 'num'
    }, {
      name: '实际库存',
      key: 'num',
      type: 'date'
    }, {
      name: '批次',
      key: 'num'
    }, {
      name: '批号',
      key: 'num'
    }, {
      name: '生产日期',
      key: 'num'
    }, {
      name: '失效日期',
      key: 'num'
    }, {
      name: '入库日期',
      key: 'num',
      type: 'date'
    }, {
      name: '库存状态',
      key: 'num',
      type: 'date'
    } ]
  }
}
