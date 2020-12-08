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
      name: '出库单号',
      key: 'num',
      editor: 'input'
    }, {
      name: '关联单号',
      key: 'num',
      editor: 'input'
    }, {
      name: '单据类型',
      key: 'num',
      editor: 'select',
      clearable: true,
      config: changeGoodsStatus
    }, {
      name: '物流公司',
      key: 'num',
      editor: 'input'
    }, {
      name: '快递单号',
      key: 'num',
      editor: 'input'
    }, {
      name: '下推时间',
      key: 'num',
      editor: 'date',
      type: 'daterange',
      clearable: true,
      placeholder: '请选择时间范围进行查询'
    }, {
      name: '出库日期',
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
      name: '出库单号',
      key: 'num'
    }, {
      name: '关联单号',
      key: 'num'
    }, {
      name: '单据类型',
      key: 'num'
    }, {
      name: '出库数量',
      key: 'num'
    }, {
      name: '物流公司',
      key: 'num'
    }, {
      name: '快递单号',
      key: 'num'
    }, {
      name: '下推时间',
      key: 'num'
    }, {
      name: '出库时间',
      key: 'num'
    } ]
  }
}
