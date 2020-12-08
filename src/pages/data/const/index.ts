export const tenantMonthlyGmvTypes = {
  repurchaseGmv: { name: '复购GMV', color: '#94bf3c' },
  newlyGmv: { name: '新增GMV', color: 'rgba(184, 226, 98, 0.47)' },
  bigDeviceGmv: { name: `大设备`, color: '#26a4d6' }
  // ,target: { name: `目标GMV`, color: '#fa7c8d' }
}

export const tenantMonthlyUserTypes = {
  reNum: { name: '复购用户数', color: '#baa0ea' },
  newNum: { name: '新增用户数', color: '#f3854f' },
  num: { name: '截至上月累计用户数', color: '#26a4d6' },
  target: { name: '新增目标用户', color: '#fa7c8d' },
  rePurchase: { name: `复购率`, color: '#42d9ef' },
  kAUserPurchase: { name: `KA客户复购率`, color: '#22d9ef' }
}

export const gmvTypes = {
  // 'gmv': 1,
  // 'bigDeviceGmv': 2,
  // 'newGMV': 3,
  // 'reGMV': 4
  'gmv': 0,
  'bigDeviceGmv': 1,
  '耗材': 2,
  'newlyGmv': 3,
  'repurchaseGmv': 4
}
export const saleTypes = [
  { id: '0', name: '销售金额' },
  { id: '1', name: '销售数量' }
]
export const unsalableTime = [
  { id: '0', name: '30 - 60天' },
  { id: '1', name: '60 - 90天' },
  { id: '2', name: '90 - 180天' },
  { id: '3', name: '大于180天' }
]
export const numTypes = {
  'num': 0,
  'newNum': 1,
  'reNum': 2
}
export const provinces = {
  '河北省': 'hebei',
  '山西省': 'shanxi',
  '内蒙古省': 'neimenggu',
  '辽宁省': 'liaoning',
  '吉林省': 'jilin',
  '黑龙江省': 'heilongjiang',
  '江苏省': 'jiangsu',
  '浙江省': 'zhejiang',
  '安徽省': 'anhui',
  '福建省': 'fujian',
  '江西省': 'jiangxi',
  '山东省': 'shandong',
  '河南省': 'henan',
  '湖北省': 'hubei',
  '湖南省': 'hunan',
  '广东省': 'guangdong',
  '广西壮族自治区': 'guangxi',
  '海南省': 'hainan',
  '四川省': 'sichuan',
  '贵州省': 'guizhou',
  '云南省': 'yunnan',
  '西藏省': 'xizang',
  '陕西省': 'shanxi1',
  '甘肃省': 'gansu',
  '青海省': 'qinghai',
  '宁夏省': 'ningxia',
  '新疆省': 'xinjiang',
  '北京市': 'beijing',
  '天津市': 'tianjin',
  '上海市': 'shanghai',
  '重庆市': 'chongqing',
  '香港': 'xianggang',
  '澳门': 'aomen',
  '台湾': 'taiwan',
  '河北': 'hebei',
  '山西': 'shanxi',
  '内蒙古': 'neimenggu',
  '辽宁': 'liaoning',
  '吉林': 'jilin',
  '黑龙江': 'heilongjiang',
  '江苏': 'jiangsu',
  '浙江': 'zhejiang',
  '安徽': 'anhui',
  '福建': 'fujian',
  '江西': 'jiangxi',
  '山东': 'shandong',
  '河南': 'henan',
  '湖北': 'hubei',
  '湖南': 'hunan',
  '广东': 'guangdong',
  '广西': 'guangxi',
  '海南': 'hainan',
  '四川': 'sichuan',
  '贵州': 'guizhou',
  '云南': 'yunnan',
  '西藏': 'xizang',
  '陕西': 'shanxi1',
  '甘肃': 'gansu',
  '青海': 'qinghai',
  '宁夏': 'ningxia',
  '新疆': 'xinjiang',
  '北京': 'beijing',
  '天津': 'tianjin',
  '上海': 'shanghai',
  '重庆': 'chongqing',
}

export const productTurnoverShowTypes = [
  { id: 0, name: 'sku品种数分布', prop: 'skuCategoryNum' },
  { id: 1, name: '库存数量分布', prop: 'stockNum' },
  { id: 2, name: '库存金额分布', prop: 'totalMoney' }
]

export const productTurnoverTurnTypes = [
  { id: 0, name: '1~30天' },
  { id: 1, name: '31~60天' },
  { id: 2, name: '61~120天' },
  { id: 3, name: '121+' }
]
export const discountType = [
  { id: 0, name: '折扣' },
  { id: 1, name: '满减' },
  { id: 2, name: '满赠' }
]
export const discountState = [
  { id: 0, name: '正常' },
  { id: 1, name: '失效' }
]
