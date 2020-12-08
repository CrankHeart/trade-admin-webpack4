export const regions = [
  { name: '华东', id: '华东' /* id: 1*/ },
  { name: '华北', id: '华北' /* id: 3*/ },
  { name: '华南', id: '华南' /* id: 2*/ },
  { name: '华中', id: '华中' /* id: 4*/ },
  { name: '西北', id: '西北' /* id: 5*/ },
  { name: '西南', id: '西南' /* id: 6*/ },
  { name: '东北', id: '东北' /* id: 7*/ },
  { name: '其他', id: '其他' /* id: 8*/ }
]

export let userTypes = [
  { id: 0, name: '集团客户' },
  { id: 1, name: '企采客户' },
  { id: 2, name: '普通客户' },
  { id: 3, name: '内部客户' },
  { id: 4, name: '未标记客户' },
  { id: 5, name: 'KA客户' },
  { id: 6, name: '个人客户' }
  // { id: 7, name: '企采活跃客户' },
  // { id: 8, name: '企采非活跃客户' }
]

export const memberLevels = [
  { name: '平台会员', id: 0 },
  { name: '企采会员', id: 1 },
  { name: '集团会员', id: 2 }
]

export const roundingTypes = [
  { name: '四舍五入到角', id: 0 },
  { name: '四舍五入到元', id: 1 },
  { name: '四舍五入到分', id: 2 }
]

export const isPrintPrice = [
  { name: '不打印', id: 0 },
  { name: '打印', id: 1 }
]

export const KEY = 'LINKEDCARE2017TRADEMANAGE'

export let salesDepartmentsTypes = [
  { id: 0, name: 'KA销售部' },
  { id: 1, name: '城市直销部' },
  { id: 2, name: '在线销售部' },
  { id: 3, name: '渠道销售部' },
  { id: 4, name: '运营部' },
  { id: 50, name: '未标记' }
]

export const salesDepartmentsObj = salesDepartmentsTypes.reduce( ( prev, next ) => {
  prev[ next.id ] = next
  return prev
}, {} )
