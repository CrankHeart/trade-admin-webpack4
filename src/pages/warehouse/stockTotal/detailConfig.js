export const Reserve = {
  queryUrl: '',
  queryFields: {
    labelWidth: '130px',
    fields: [ {
      name: '订单号',
      key: 'num',
      editor: 'input'
    } ]
  },
  page: true,
  record: {
    fields: [ {
      name: '订单号',
      key: 'num'
    }, {
      name: '占用数量',
      key: 'num'
    }, {
      name: '占用时间',
      key: 'skuNum'
    } ]
  }
}

export const Locked = {
  queryUrl: '',
  queryFields: {
    labelWidth: '130px',
    fields: [ {
      name: '订单号',
      key: 'num',
      editor: 'input'
    } ]
  },
  page: true,
  record: {
    fields: [ {
      name: '订单号',
      key: 'num'
    }, {
      name: '下推数量',
      key: 'num'
    }, {
      name: '下推锁定时间',
      key: 'skuNum'
    } ]
  }
}

export const Lack = {
  queryUrl: '',
  queryFields: {
    labelWidth: '130px',
    fields: [ {
      name: '订单号',
      key: 'num',
      editor: 'input'
    } ]
  },
  page: true,
  record: {
    fields: [ {
      name: '订单号',
      key: 'num'
    }, {
      name: '缺货数量',
      key: 'num'
    }, {
      name: '下单时间',
      key: 'skuNum'
    } ]
  }
}

export const Onway = {
  queryUrl: '',
  queryFields: {
    labelWidth: '130px',
    fields: [ {
      name: '订单号',
      key: 'num',
      editor: 'input'
    } ]
  },
  page: true,
  record: {
    fields: [ {
      name: '采购订单号',
      key: 'num'
    }, {
      name: '在途数量',
      key: 'num'
    }, {
      name: '预计到货时间',
      key: 'skuNum'
    }, {
      name: '采购单创建时间',
      key: 'skuNum'
    } ]
  }
}
