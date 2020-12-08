// const testURL = 'https://op.linkedcare.cn/eop'
const testURL = process.env.NODE_ENV == 'integration' ?
  'https://eop-integration.linkedcare.cn/eop' :
  'https://eoptest.linkedcare.cn/eop'
// const testURL = 'http://192.168.188.77:8088' // 刘威
// const testURL = 'http://192.168.188.253:8080' // 伟鹏
// const testURL = 'http://192.168.188.179:8082/eop' // 谢霸天
// const testURL = 'http://192.168.189.84:8080' // 张恒
// const testURL = 'http://192.168.188.62:8087' // 汤武
// const testURL = 'http://172.24.22.216:8888' // 陈阵
// const testURL = 'http://172.24.22.52:2024/eop' // gg
// const testURL = 'http://172.24.21.21:8080' // 张岩
// const testURL = 'http://172.24.21.36:8085' // 杨卫星
// const testURL = 'http://172.24.20.151:8085/eop' // 季天浩


export const baseURL = process.env.NODE_ENV == 'production' ? 'https://op.linkedcare.cn/eop' : testURL

export default {
  login: '/user/login',
  loginFromSSO: '/user/loginFromSSO',
  ddlogin: '/user/ddlogin',
  // 商品 导入 维护 状态修改
  updatePass: '/user/updatePass',
  product: {
    download: '/excel/module',
    upload: '/excel/upload',
    status: '/excel/status'
  },
  // 分类 2种数据格式
  allTypes: '/productMaintenance/productClass',
  allTypes2: '/productMaintenance/getProductCategory3st',
  // 品牌
  allBrands: '/productMaintenance/getGoodsBrandList',
  // 物流公司信息
  allLogistic: '/logistic/getLogisticCompanyList',
  // 获取tenantId-模糊查询
  getTenantsInfoDetail: '/usersCustomerOffice/getTenantsInfoByCondition',
  // 获取officeId--模糊查询
  getOfficesByTenantId: '/usersCustomerOffice/getOfficesByTenantId',

  // 商品维护  获取列表
  getProductList: '/productMaintenance/getProductList',
  // 商品维护 状态更新
  updateProductStatus: '/productMaintenance/updateProductStatus',
  // 获取商品 托管商家
  getTrusteeshipStoreInfo: '/productMaintenance/getTrusteeshipStoreInfo',
  // 新增商家
  addStore: '/storeInfo/addStore',
  // 获取商家详情
  getStoreInfoDetail: '/storeInfo/getStoreInfoDetail',
  // 更新商家信息
  updateStoreInfo: '/storeInfo/updateStoreInfo',

  // 获取商家下sku列表
  getStoreSkuList: '/storeInfo/getSkuList',
  // 商家新增客户归属
  addCustomerOwnerShip: '/storeInfo/addCustomerOwnerShip',
  // 商家删除客户归属
  deleteCustomerOwnerShip: '/storeInfo/deleteCustomerOwnerShip',
  // 商家获取客户列表
  getStoreCustomerList: '/storeInfo/getStoreCustomerList',
  // 更新商家配置列表
  updateStoreSwitch: '/storeInfo/updateStoreSwitch',
  // 关联商家
  getRelatedShopList: '/productMaintenance/getRelatedShopList',
  // // 更新商品SPU
  // updateSpuInfo: '/productMaintenance/updateSpuInfo',
  // // 更新商品SKU
  // updateSkuInfo: '/productMaintenance/updateSkuInfo',
  // // 获取商品详细

  // 更新商品spu 标品
  updateSpuPlatformAttributes: '/productMaintenance/updateSpuPlatformAttributes',
  // 更新商品spu 商品
  updateSpuStoreAttributes: '/productMaintenance/updateSpuStoreAttributes',
  // 更新商品sku 标品
  updateSkuPlatformAttributes: '/productMaintenance/updateSkuPlatformAttributes',
  // 更新商品sku 商品
  updateSkuStoreAttributes: '/productMaintenance/updateSkuStoreAttributes',

  getProductExtroInfoList: '/productMaintenance/getProductExtroInfoList',

  // 验证虚拟商品小包装商品是否可用
  checkSuitSkuAvailable: '/productMaintenance/checkSuitSkuAvailable',
  // 编辑 查看 删除 主图附图
  fileUpload: '/productMaintenance/fileUpload',
  getPicPath: '/productMaintenance/getPicturePath',
  delPicPath: '/productMaintenance/deletePicturePath',
  // 上传资质图片的有效期
  updateAptitudeDate: '/productMaintenance/updateAptitudeDate',
  // 找货助手
  getGoodsAssistByTime: '/productMaintenance/getGoodsAssist',
  // 找货助手备注信息
  saveGoodsAssistComment: '/productMaintenance/saveGoodsAssistComment',
  // 获取商城用户信息--客户
  getMallUserList: '/UsersMonthlyAccounting/selectByCondition4MallUser',
  // 修改商城用户信息-- all
  updateUser: '/UsersMonthlyAccounting/updateCustomerInfoById',
  // 修改商城用户信息--类型和标签
  updateMallUser: '/UsersMonthlyAccounting/updateByPrimaryKey4MallUser',
  // 删除商城用户-只有一个标签
  delMallUser: '/UsersMonthlyAccounting/emptyLabelByPrimaryKey4MallUser',
  // 获取发票列表
  getInvoiceList: '/business/invoice/getInvoiceList',
  // 获取开票信息列表
  getUserInvoiceDataList: '/business/invoice/getUserInvoiceDataList',
  // 导出选中发票
  exportDispersed: '/business/invoice/exportDispersed',
  // 导出所有发票
  export: '/business/invoice/export',
  // 发票状态修改
  updateInvoiceProgress: '/business/invoice/updateInvoiceProgress',
  // // 取消发票
  // cancelInvoice: '/business/invoice/cancelInvoice',
  // 对账单抵冲
  hedgeStatement: '/accountCheckingController/hedgeStatement',
  // 对账单发票信息
  accountInvoiceList: '/business/invoice/accountInvoiceList',
  // 对账单 -- 申请发票接口
  makeAccountEInvoice: '/business/invoice/makeAccountEInvoice',
  // 对账单 -- 新增纸质发票开票记录
  makePaperInvoice: '/business/invoice/makePaperInvoice',
  // 对账单 -- 纸质发票导出接口
  exportAccountPaperInvoice: '/business/invoice/exportAccountPaperInvoice',
  // 订单 -- 纸质发票红冲接口
  reservePaperInvoice: '/business/invoice/reservePaperInvoice',
  // 对账单 -- 纸质发票红冲接口
  reservePaperInvoiceForAccount: '/business/invoice/reservePaperInvoiceForAccount',
  // 订单 -- 新增纸质发票开票记录
  makeMemberOrderPaperInvoice: '/business/invoice/makeMemberOrderPaperInvoice',
  // 订单 -- 纸质发票导出接口
  exportOrderPaperInvoice: '/business/invoice/exportOrderPaperInvoice',
  // 获取纸质发票列表
  getInvoiceApplyList: '/business/invoice/getInvoiceApplyList',
  // 对账单 --- 纸质发票 -- 开票失败列表 -- 重新开票的接口
  reissueEInvoiceForOrder: '/business/invoice/reissueEInvoiceForOrder',
  // 对账单 -- 订单 --- 纸质发票 -- 重新开票的接口
  cancelOrderEInvoice: '/business/invoice/cancelOrderEInvoice',
  // 对账单 -- 订单 --- 电子发票 -- 重新开票的接口
  remakeEInvoice: '/business/invoice/remakeEInvoice',
  // 对账单 -- 订单 -- 电子发票 -- 发票红冲
  reverseEInvoice: '/business/invoice/reverseEInvoice',
  // 修改开发发票信息
  updateInvoiceApplyInfo: '/business/invoice/updateInvoiceApplyInfo',
  // 修改发票的信息
  updateUserInvoiceData: '/business/invoice/updateUserInvoiceData',
  // 获取订单列表
  getOrderList: '/business/order/getOrderList',
  // 获取订单详情
  getOrderDetail: '/business/order/getOrderDetail',
  // 总览
  getOverview: '/business/distribution/getOverview',
  // 出库信息
  getOutBoundDetail: '/business/distribution/getOutBoundDetail',
  // 出库信息-待出库-撤销
  withdrawDeliveryOrder: '/business/distribution/withdrawDeliveryOrder',
  // 缺货信息
  getWantSlipsInfo: '/business/distribution/getWantSlipsInfo',
  // 申请退款
  applyAfterSales: '/business/order/applyRefund',

  // 订单状态修改
  updateOrderStatus: '/business/order/updateOrderStatus',
  // 订单状态修改--月结订单结算
  updateSettlementStatus: '/business/order/settlement',
  insertLogisticsInformation: '/business/order/insertLogisticsInformation',
  // 相关联订单问题
  getOrderStatusReminder: '/business/order/getOrderStatusReminder',
  // 导出相关全部订单
  orderExport: '/business/order/export',
  // 订单列表导出（针对分散的订单）
  orderExportDispersed: '/business/order/exportDispersed',
  // 新建发货单
  newShippingInfo: '/business/order/newShippingInfo',
  // 新建发货单-接口配货
  addDeliveryOrderManual: '/business/distribution/addDeliveryOrderManual',
  // 批量更新缺货单交期
  updateDeliveryTime: '/business/order/updateDeliveryTime',
  // 单个新缺货单交期
  updateDeliveryTimeSingle: '/business/order/updateDeliveryTimeSingle',
  // 促销查询
  promotion: '/promotion/searchPromotion',
  // 促销取消 与恢复
  togglePromotion: '/promotion/togglePromotion',
  // 获取租户信息
  getTenantName: '/promotion/getTenantName',
  // 获取促销规则
  getPromotion: '/promotion/getPromotion',
  // 保存促销规则
  savePromotion: '/promotion/savePromotion',
  // 提交促销规则
  submitPromotion: '/promotion/submitPromotion',
  // 打印出货单-领健自营
  printChuKuDan: '/business/order/printChuKuDan',
  // 打印出货单-第三方
  printTrusteeshipChuKuDan: '/business/distribution/printTrusteeshipChuKuDan',
  // 保存订单详情
  saveExtraInfo: '/business/order/saveExtraInfo',
  // 2018.11.22 与臧总沟通这个更新物流的接口不用了, 里面的那些数据不需要留input框,直接显示
  // 订单详情 更新物流信息
  // updateLogisticsInformation: '/business/order/updateLogisticsInformation',
  // 添加物流信息
  addLogisticCompany: '/logistic/addLogisticCompany',
  // 添加协议商品
  addAgreeProduct: '/productMaintenance/addAgreeProduct',
  // 查询协议商品
  getAgreeProduct: '/productMaintenance/getAgreeProduct',
  // 查询协议商品规格信息 sku
  getSkuOfAgreeProduct: '/productMaintenance/getSkuOfAgreeProduct',
  // 更新协议价状态
  updateStatus: '/productMaintenance/updateStatus',
  // 协议价申请操作记录
  getOperation: '/productMaintenance/getOperation',
  // 导出协议商品
  exportAgreeProduct: '/productMaintenance/exportAgreeProduct',
  // 删除协议商品
  deleteAgreeProduct: '/productMaintenance/deleteAgreeProduct',
  // 添加月结用户
  monthlyUserAdd: '/UsersMonthlyAccounting/add',
  // 暂停/恢复 月结用户 （设置为失效）
  monthlyUserChange: '/UsersMonthlyAccounting/disableByPrimaryKey',
  // 更新月结用户
  monthlyUserUpdata: '/UsersMonthlyAccounting/updateByPrimaryKey',
  // 搜索月结用户， 必传tenantId
  monthlyUserSearchById: '/UsersMonthlyAccounting/selectByPrimaryKey',
  // 搜索月结用户，
  monthlyUserSearch: '/UsersMonthlyAccounting/selectByCondition4MonthlyAcc',
  // 用户新增
  userAdd: '/user/add',
  // 用户信息更新
  getAllUsers: '/user/getAllUsers',
  // 获取所有用户
  userUpdate: '/user/update',
  // 用户管理--删除用户
  userDel: '/user/delete',
  // 获取用户信息
  userInfo: '/user/get/userInfo',
  userInfoFromToken: '/user/get/userInfoFromToken',
  // 获取所有用户信息
  userListInfo: '/user/list/userInfo',
  /** 带更新 */
  // 角色管理 - 新增角色
  roleAdd2: '/user/role/add',
  // 角色更新
  roleUpdate2: '/user/role/update',
  // 角色删除
  roleDelete2: '/user/role/delete',
  // 查询所有角色
  roleGetAll2: '/user/role/getAllroles',
  // 获取角色下的所有权限信息
  roleGetPermission2: '/user/role/getPermissionsByRoleId',
  // 获取角色下的所有用户信息
  roleGetUser2: '/user/role/getUsersByRoleId',
  // 删除角色下某用户
  roleDelUser2: '/user/roleUserRelation/delete',
  // 角色下新增用户
  roleAddUser2: '/user/add/userRole',
  // 获取所有权限
  getAllPermissions: '/user/permission/getAllPermissions',
  // 更新角色权限
  rolePermissionUpdate2: '/user/rolePermissionRelation/update',
  // 权限新增
  permissionAdd: '/user/permission/add',
  // 权限修改
  permissionUpdate2: '/user/permission/update',
  // 权限删除
  permissionDelete2: '/user/permission/delete',
  /**/
  // 获取品牌
  getGoodsBrand: '/GoodsBrand/getGoodBrands',
  // 新增品牌
  addGoodBrand: '/GoodsBrand/addGoodBrand',
  // 更新品牌
  updateGoodBrand: '/GoodsBrand/updateGoodBrand',
  // 获取用户详情  tenantId officeId userId
  getTenantOfficeUserName: '/business/order/getTenantOfficeUserName',
  // GMV面板
  getGMV: '/datapanel/getGMV',
  // 用户类型占比
  getUserTypeProportion: '/datapanel/getUserTypeProportion',
  // 大区占比
  getRegion: '/datapanel/getRegion',
  // 市区占比
  getCity: '/datapanel/getCity',
  getProvince: '/datapanel/getProvince',
  // 销售排行
  getLcCodeRank: '/datapanel/getLcCodeRank',
  // 根据spu获取sku
  getSkuListBySpuId: '/productMaintenance/getSkuListBySpuId',
  // 导出数据报表
  dataPanelExport: '/datapanel/export',
  // 下载最近30天商品数据
  exportProductData: '/datapanel/exportProductData',
  // 客户管理 更新获取精确位置
  updateRounding: '/UsersMonthlyAccounting/updateRoundingTypeByPrimaryKey',
  // 企业惰性排行
  getCompanyLazyRank: '/datapanel/getCompanyLazyRank',
  // 常备商品沉睡排行
  getDominantProductsRank: '/datapanel/getDominantProductsRank',
  // 每日商品沉睡排行
  getDailySalesRank: '/datapanel/getDailySalesRank',
  // 上传banner
  bannerUpload: '/bannerMaintenance/bannerUpload',
  // 删除图片banner
  deleteBannerPic: '/bannerMaintenance/deleteBannerPic',
  // 查看图片banner
  getBannerPic: '/bannerMaintenance/getBannerPic',
  // 获取所有banner
  getBannersByType: '/bannerMaintenance/getBannersByType',
  // 更新跳转链接
  updateBannerLink: '/bannerMaintenance/updateBannerLink',
  // lcSkuCode转skuId
  getSkuByLcSkuCode: '/productMaintenance/getSkuByLcSkuCode',
  // 获取所有活动信息
  getAllActivities: '/couponController/getAllActivities',
  // 保存活动，生成优惠券
  addCouponActivity: '/couponController/addCouponActivity',
  // 获取优惠券详情内用户信息
  getPersonalCoupons: '/couponController/getPersonalCoupons',
  // 修改活动状态
  updateActivityStatus: '/couponController/updateActivityStatus',
  // 获取活动下已核销的券，含分页功能
  getCouponsByActivityId: '/couponController/getCouponsByActivityId',
  // 导出优惠券
  exportCoupons: '/couponController/exportCoupons',
  // 获取活动详情
  getActivityDetail: '/couponController/getActivityDetail',

  // 新增SKU
  addSkuInfo: '/productMaintenance/addSkuInfo',
  // 修改品牌，验证唯一性
  validateProductUnique: '/productMaintenance/validateProductUnique',
  // 获取商品资质
  getAptitudeInfo: '/productMaintenance/getAptitudeInfo',
  // 上传资质图片
  uploadAptitudeImg: '/productMaintenance/upload/aptitude/img',
  // 更新资质
  updateAptitudeInfo: '/productMaintenance/updateAptitudeInfo',
  // 删除资质
  deleteAptitudeInfo: '/productMaintenance/deleteAptitudeInfo',
  // 获取服务单数据
  getServiceOrders: '/serviceOrderController/getServiceOrders',
  // TODO 7.15上线需求：http://jira.linkedcare.cn:8000/browse/ET-4434 需要新增物流接口

  // 更新服务单数据
  updateServiceOrder: '/serviceOrderController/updateServiceOrder',
  // 获取物流信息
  getLogisticInfo: '/serviceOrderController/getLogisticInfo',
  // 全部退款金额
  getRefundAllAmount: '/serviceOrderController/getRefundAllAmount',
  // 获取品牌下商品信息
  getProductByBrandId: '/productMaintenance/getProductByBrandId',
  // 导出企采购买用户数量
  // exportCityCustomerDate: '/datapanel/exportCityCustomerDate',
  // 获取国内省市数据
  getAreaList: '/logistic/getAreaList',
  // 获取所有供应商信息
  getAllStoreInfos: '/productMaintenance/getAllStoreInfos',
  // 获取商家列表
  getStoreList: '/storeInfo/getStoreList',
  // 供应商列表
  getSupplierInfos: '/supplierInfoController/getSupplierInfos',
  // 供应商删除
  delSupplierInfo: '/supplierInfoController/delSupplierInfo',
  // 供应商-删除商品
  delSupplierGoods: '/supplierInfoController/delSupplierGoods',
  // 供应商修改商品历史协议价
  updateSupplierGoods: '/supplierInfoController/updateSupplierGoods',
  // 供应商--新建和修改基本信息
  saveSupplierInfo: '/supplierInfoController/saveSupplierInfo',
  // 供应商 -上传经销协议
  uploadAgreement: '/supplierInfoController/agreementUpload',
  // 供应商--获取负责人信息
  getUsersByRoleId: '/user/role/getUsersByRoleId',
  // 供应商--获取地址省市县
  getAddressList: '/supplierInfoController/getAreaList',
  // 供应商--添加商品
  addSupplierGoods: '/supplierInfoController/addSupplierGoods',
  // 供应商--查询品牌下所有商品
  getAllSkuByBrandId: '/productMaintenance/getAllSkuByBrandId',
  // 供应商-- 按照sku查询商品
  getAllSkuByLcSkuCode: '/productMaintenance/getAllSkuByLcSkuCode',
  // 供应商--查询供应商信息
  getSupplierInfoDetail: '/supplierInfoController/getSupplierInfoDetail',
  // 供应商--查询商品信息
  getSupplierSkuList: '/supplierInfoController/getSupplierGoodsBySupplierId',
  // 供应商--查询供应商品牌信息
  getSupplierBrands: '/supplierInfoController/supplierBrandRelations',
  // 供应商--更新供应商品牌信息
  updateSupplierBrand: '/supplierInfoController/updateSuppBrandRel',
  // 供应商--设置商品首选供应商
  setPreferredSupplier: '/supplierInfoController/setPreferredSupplier',
  // 供应商--获取供应商相关商品的单价
  supplierSkuInfo: '/supplierInfoController/supplierSkuInfo',
  // 供应商--根据名字和sku编码查询供应商
  supplierForSku: '/supplierInfoController/allSupplierForSku',
  // 修改供应商
  modifySupplier: '/pms/purchaseTask/selectSupplier',
  // 供应商--查询资质列表
  getAptitudeBySupplierId: '/supplierInfoController/getAptitudeBySupplierId',
  // 供应商--保存供应商资质
  saveSupplierAptitude: '/supplierInfoController/saveSupplierAptitude',
  // 供应商--删除供应商资质
  deleteSupplierAptitude: '/supplierInfoController/deleteSupplierAptitude',
  // 供应商--上传供应商资质
  uploadSupplierAptitudeImg: '/supplierInfoController/upload/aptitude/img',
  // 供应商-- 获取对账明细
  getAccountBySupplierId: '/supplierInfoController/getAccountBySupplierId',
  // 供应商-- 导出报表
  exportSupplierAccount: '/supplierInfoController/exportAccount',
  // 供应商 -- 对账明细总额
  totalAccountBySupplierId: '/supplierInfoController/totalAccountBySupplierId',
  // 企业数据gmv
  getCompanyGMV: '/datapanelCompany/getCompanyGMV',
  // 企业数据用户是数量/复购
  getCompanyNum: '/datapanelCompany/getCompanyNum',
  // 企业数据gmv 大区占比
  getCompanyRegionPro: '/datapanelCompany/getCompanyRegionPro',
  // 企业数据用户是数量/复购 大区占比
  getCompanyRegionProNum: '/datapanelCompany/getCompanyRegionProNum',
  // 企业数据gmv 客户类型占比
  getUserTypePro: '/datapanelCompany/getUserTypePro',
  // 企业数据用户是数量/复购 客户类型占比
  getUserRegionProNum: '/datapanelCompany/getUserRegionProNum',
  // 企业数据gmv 销售部门占比
  salesDepartmentsGmv: '/datapanelCompany/salesDepartmentsGmv',
  // 企业数据用户是数量/复购 销售部门占比
  salesDepartmentsNum: '/datapanelCompany/salesDepartmentsNum',
  // 企业数据用户 累计用户上次交易时间饼图
  getByLastTrading: '/datapanelCompany/getByLastTrading',
  // 企业数据gmv 客户区域占比
  getUserRegionPro: '/datapanelCompany/getUserRegionPro',
  // 企业数据用户是数量/复购 客户区域占比
  getUserTypeProNum: '/datapanelCompany/getUserTypeProNum',
  // 企业数据gmv 销售金额占比
  getSalesAmountPro: '/datapanelCompany/getSalesAmountPro',
  // 企业数据用户是数量/复购 销售金额占比
  getSalesAmountProNum: '/datapanelCompany/getSalesAmountProNum',
  // 企业数据gmv  选择城市
  getCompanyCity: '/datapanelCompany/getCity',
  // 企业数据用户是数量/复购  选择城市
  getCityNum: '/datapanelCompany/getCityNum',
  // 企业数据gmv 选择省份
  getCompanyProvince: '/datapanelCompany/getProvince',
  // 企业数据用户是数量/复购 选择省份
  getProvinceNum: '/datapanelCompany/getProvinceNum',
  // 企业数据 获取所有
  getDataDetail: '/datapanelCompany/getDataDetail',

  // 企业数据 用户数据 不点击月分数据 导出
  getDataDetailForEndType: '/datapanelCompany/getDataDetailForEndType',
  // 企业数据 点击截至上月累计用户 数据
  getDataDetailForLastTradingType: '/datapanelCompany/getDataDetailForLastTradingType',
  // 企业数据 月平均
  getRePurchaseByYear: '/datapanelCompany/getRePurchaseByYear',
  // 诊所管理查询
  // getOfficesInfo: '/UsersMonthlyAccounting/getOfficesInfo',
  // 更新 诊所
  // updateOfficesInfo: '/UsersMonthlyAccounting/updateOfficesInfo',
  // 更新采购单
  // updateProcurement: '/procurement/updateProcurement',
  // 查询采购单列表
  selectProcurement: '/procurement/selectProcurement',
  // 采购单列表审核
  procurementListApprove: '/procurement/auditProcurement',
  // 采购单拆单
  procurementBreakLine: '/pms/purchaseOrder/createSubPurchaseOrder',
  // 新增采购计划
  addPurchasePlanPlan: '/purchasePlan/addPlan',
  // 查询采购计划列表（查询未来计划，查询进行中的计划）
  getPlanByStatus: '/purchasePlan/getPlanByStatus',
  // 查询采购计划列表（查询未来计划，查询进行中的计划）
  searchPurchasePlan: '/purchasePlan/searchPlan',
  // 采购详情-导入计划内任务
  uploadInPlanFile: '/purchaseTaskMeta/uploadInPlanFile',
  // 采购详情-导出计划内任务
  exportTaskMeta: '/purchaseTaskMeta/exportTaskMeta',
  // 采购详情-未开始查询列表
  searchSkuMeta: '/purchaseTaskMeta/searchSkuMeta',
  // 采购详情-未开始-根据品牌获取采购员
  getUserByBrandId: '/brandBuyer/getUserByBrandId',
  // 采购详情-未开始-保存单行SKU
  updateTaskMeta: '/purchaseTaskMeta/updateTaskMeta',
  // 采购详情-未开始-开始计划
  updatePlanStatus: '/purchasePlan/updatePlanStatus',
  // 采购详情-进行中-查询列表
  searchPlanSkuSum: '/planSkuSum/searchPlanSkuSum',
  // 采购详情-进行中-导入
  uploadOutPlanFile: '/purchaseTaskMeta/uploadOutPlanFile',
  // 采购详情-进行中-导出
  exportPlanSkuSum: '/planSkuSum/exportPlanSkuSum',
  // 采购详情-进行中-删除
  delPlanSkuSum: '/planSkuSum/delPlanSkuSum',
  // 根据id查询采购计划信息
  getPurchasePlanById: '/purchasePlan/getPlanById',
  // 采购详情-待盘点-查询列表
  searchPlanSkuSumSnapshot: '/planSkuSumSnapshot/searchPlanSkuSumSnapshot',
  // 采购详情-待盘点-列表上盘点
  updatePlanSkuSumSnapshot: '/planSkuSumSnapshot/updatePlanSkuSumSnapshot',
  // 采购详情-待盘点-导出
  exportPlanSkuSumSnapshot: '/planSkuSumSnapshot/exportPlanSkuSumSnapshot',
  // 采购任务-待盘点-交付详情
  missionModelSnapshot: '/planSkuSumSnapshot/missionModelSnapshot',
  // 采购任务-直发试图-查询列表
  searchPurchaseTask: '/purchaseTask/searchPurchaseTask',
  // 采购任务-导出
  exportPurchaseTask: '/purchaseTask/exportPurchaseTask',
  exportPurchaseTask2: '/purchaseTaskMeta/exportPlanOutTaskMeta',
  // 采购任务-交付详情
  purchaseTaskDetails: '/purchaseTaskMeta/deliveryDetail',
  // 采购任务-获取所有采购员
  getAllBuyers: '/brandBuyer/getAllBuyers',
  // 新增采购单
  addProcurement: '/procurement/addProcurement',
  // 获取缺货单
  selectDeliveryOrder: '/procurement/selectDeliveryOrder',
  // 删除采购单
  deleteProcurement: '/procurement/deleteProcurement',
  // 提交采购单
  submitProcurement: '/procurement/submitProcurement',
  // 导出单个采购单
  exportProcurement: '/procurement/exportProcurement',
  // 导出单个采购单合同
  exportProcurementPDF: '/procurement/exportProcurementPDF',
  // 采购计划申请退货或退款
  applyServiceOrder: '/procurement/applyServiceOrder',
  // 交期更新
  updatePlanSkuDetail: '/procurement/updatePlanSkuDetail',
  // 结算采购单
  settleProcurement: '/procurement/settleProcurement',
  // 结算采购退货单
  settleServiceOrder: '/procurement/settleServiceOrder',
  // 取消采购退货单
  cancelServiceOrder: '/procurement/cancelServiceOrder',
  // 新建采购单搜索商品
  selectProductList: '/procurement/selectProductList',
  // 查询采购服务单列表
  selectServiceOrder: '/procurement/selectServiceOrder',
  // 取消采购单
  cancelProcurement: '/procurement/cancelProcurement',
  // 更新采购服务单数据
  updateProcurementServiceOrder: '/procurement/updateServiceOrder',
  // 获取相关SKU
  getSkuVoByCodes: '/procurement/getSkuVoByCodes',
  // 获取订购视图中的商品列表
  getSupplySku: '/procurement/getSupplySku',
  // 获取商品交付情况
  deliveryDetail: '/procurement/deliveryDetail',
  // 审核退货单
  purchaseReturnOrder: '/pms/purchaseReturnOrder/review',
  // 取消退货单
  purchaseCancelOrder: '/pms/purchaseReturnOrder/cancel',
  // 导出订购视图SKU
  exportSupplySku: '/procurement/exportSupplySku',
  // 获取规则列表
  getRulesList: '/pms/brandBuyer/page',
  // 获取采购品牌列表
  getBrandBuyerList: '/pms/brandBuyer/getBrandBuyerList',
  // 导出采购分配规则列表
  exportBrandBuyer: '/pms/brandBuyer/exportExcel',
  // 导入采购分配规则列表
  importBrandBuyer: '/pms/brandBuyer/importExcel',
  // 导出采购单列表
  exportProcurementList: '/procurement/exportPurchaseOrder',
  // 导出退货单列表
  exportPurchaseRetrunOrder: '/pms/purchaseReturnOrder/exportExcel',
  // 查询出库记录头信息
  getOutBoundTitle: '/pms/wmsShipmentConfirm/getOutBoundTitle',
  // 同步品牌数据
  synchronization: '/pms/brandBuyer/synchOmsGoodsBrand',
  // 修改采购负责人
  editBrandBuyer: '/pms/brandBuyer/editBrandBuyer',
  // 查询最大退货数量
  getReturnOrExchangeSkuNum: '/pms/purchaseOrder/getReturnOrExchangeSkuNum',
  // 根据用户分类 大区 查询office
  getUsersByCondition: '/couponController/getUsersByCondition',
  // 商品数据 静态属性
  productTotal: '/datapanelProduct/productTotal',
  // 商品数据 品牌流向 品牌top
  brandTop: '/datapanelProduct/brandTop',
  // 商品数据 品牌流向 品牌top排行
  brandRank: '/datapanelProduct/brandRank',
  // 商品数据 品牌流向 品牌spuTOP排行
  brandSpuRank: '/datapanelProduct/brandSpuRank',
  // 商品数据 品牌流向 品牌 地图
  mapDetails: '/datapanelProduct/mapDetails',
  // 商品数据 品牌流向 生成数据
  findDetails: '/datapanelProduct/findDetails',
  // 品牌属性流向 商品属性分布
  spuAttributeAmount: '/datapanelProduct/spuAttributeAmount',
  // spu热销榜
  spuSelling: '/datapanelProduct/spuSelling',
  brandSelling: '/datapanelProduct/brandSelling',
  spuSellingRank: '/datapanelProduct/spuSellingRank',

  // 滞销
  unsalableSpuNum: '/datapanelProduct/unsalableSpuNum',
  unsalableProductAttribute: '/datapanelProduct/unsalableProductAttribute',
  unsalableBrands: '/datapanelProduct/unsalableBrands',
  unsalableProducts: '/datapanelProduct/unsalableProducts',
  findUnsalableProductsDetail: '/datapanelProduct/findUnsalableProductsDetail',
  // 每月总计

  getMonthlySummarys: '/datapanelProduct/getMonthlySummarys',

  getAvgPurchaseByYearAndMonth: '/datapanelCompany/getAvgPurchaseByYearAndMonth',
  // 用户画像 列表
  getOfficesList: '/usersCustomerOffice/getOfficesInfo',
  // 用户画像详情
  getOfficesDetail: '/usersCustomerOffice/getOfficeItem',
  // 更新用户画像信息
  updateOfficeDetail: '/usersCustomerOffice/updateOfficesInfo',
  // 获取会员品牌等级
  getBrandPriceLevel: '/usersCustomerOffice/levelList',
  // 更新会员品牌等级
  updateBrandPriceLevel: '/usersCustomerOffice/updatePriceLevel',
  // 获取会员历史订单
  getOfficeOrderList: '/usersCustomerOffice/orderList',
  // 用户画像 -- 订单核对记录
  accountCheckList: '/usersCustomerOffice/accountCheckList',
  // 用户画像 -- 获取会员权益
  getMemberBenefits: '/usersCustomerOffice/getMemberBenefits',
  // 用户画像 -- 保存会员权益
  saveMemberBenefits: '/usersCustomerOffice/saveMemberBenefits',
  // 用户画像 -- 导出对账单
  exportAccountCheck: '/accountCheckingController/exportAccountCheck',
  // 消息管理
  // 获取资质消息总计
  getMsgTotal: '/messageCenter/getMsgTotal',
  // 获取资质即将过期消息提醒详情列表
  getMessageDetail: '/messageCenter/getMessageDetail',
  // // 资质消息已处理
  // aptitudeMsgHandled: '/messageCenter/aptitudeMsgHandled',
  // 消息已处理
  msgHandled: '/messageCenter/msgHandled',
  // 获取交易额数据
  getAccumulativeAmount: '/usersCustomerOffice/accumulativeAmount',
  // 上传商品图片
  uploadGoodsImg: '/productMaintenance/upload/goods/img',
  // 删除商品图片
  deleteGoodsImg: '/productMaintenance/deleteGoodsImgInfo',
  // 更新商品图片顺序
  updateGoodsImgInfo: '/productMaintenance/updateGoodsImgInfo',
  // 用户画像详情 获取优惠券信息
  getEffectiveCouponNum: '/usersCustomerOffice/getEffectiveCouponNum',
  // erp监控
  getErpMonitors: '/erpMonitor/getErpMonitors',
  // 用户画像 商品渗透率
  getPurchasingHistoryVos: '/usersCustomerOffice/getPurchasingHistoryVos',
  // 监控数据
  getCountMonitors: '/erpMonitor/getCountMonitors',
  // 创建活动 保存
  saveThemeEvent: '/themeEvent/saveThemeEvent',
  // 创建活动 保存楼层
  saveThemeEventFloor: '/themeEvent/saveThemeEventFloor',
  // 活动  上传图片
  uploadThemeEventImg: '/themeEvent/upload/themEvent/img',
  // 获取活动
  getThemeEventByCondition: '/themeEvent/getThemeEventByCondition',
  // 获取次活动详情
  getThemeEventDetail: '/themeEvent/getsubThemeEvent',
  // 获取主活动详情
  getHomeThemeEventDetail: '/themeEvent/getHomePage',
  // 获取活动楼层商品
  getSubEventFloorProductPaging: '/themeEvent/getSubEventFloorProductPaging',
  // 删除活动楼层
  delThemeEventFloor: '/themeEvent/delThemeEventFloor',
  // 更新楼层顺序
  updateFloorSequence: '/themeEvent/updateFloorSequence',
  // 更新商品归属
  updateSpuNonBusinessInfo: '/productMaintenance/updateSpuNonBusinessInfo',
  // 更新客户所属耗材负责人
  batchUpdateConsumablesPerson: '/usersCustomerOffice/batchUpdateConsumablesPerson',
  // 商品数据 周转分布
  getSkuSummarys: '/datapanelProduct/getSkuSummarys',
  // 商品数据 周转商品属性
  getSkuPropertySummarys: '/datapanelProduct/getSkuPropertySummarys',
  // 商品数据 周转商品  导出表格
  getSkuSummarysDetail: '/datapanelProduct/getSkuSummarysDetail',
  // 月结订单发起核对
  launchedAccountChecking: '/accountCheckingController/launchedAccountChecking',
  // 获取核对订单列表
  getAccountCheckingList: '/accountCheckingController/getAccountCheckingList',
  // 保存银行流水
  saveBankSnBatch: '/accountCheckingController/saveBankSnBatch',
  // 删除核对订单
  obsoleteOrder: '/accountCheckingController/obsoleteOrder',
  // 核对订单
  checkOrders: '/accountCheckingController/checkOrders',
  // 删除银行流水
  delBankSn: '/accountCheckingController/delBankSn',
  // 导出核对订单列表
  exportCheckingList: '/accountCheckingController/exportCheckingList',
  // 托管商家对账单列表
  trusteeshipStatements: '/accountCheckingController/trusteeshipStatements',
  // 对账单列表
  statementList: '/accountCheckingController/statementList',
  // 对账单详情
  statementDetail: '/accountCheckingController/statementDetail',
  // 订单对账明细
  checkingOrderDetail: '/accountCheckingController/checkingOrderDetail',
  // 出库单对账明细
  getInoutStockGoodsDetail: '/accountCheckingController/getInoutStockGoodsDetail',
  // 对账单核对确认
  confirmStatement: '/accountCheckingController/confirmStatement',
  // 对账单作废
  obsoleteStatement: '/accountCheckingController/obsoleteStatement',
  // 对账单支付信息
  paymentInfo: '/accountCheckingController/paymentInfo',
  // 对账单 -- 抹平差额，内部支付
  handelSpecialVoucher: '/accountCheckingController/handelSpecialVoucher',
  // 对账单 -- 批量发起上月对账
  initiateBatchKey: '/accountCheckingController/initiateBatchKey',
  // 修改订单分类
  updateOrderBasicInfo: '/business/order/updateOrderBasicInfo',
  // sass订单监控监控
  getSassOrderMonitors: '/orderMonitor/getMonitors',
  // sass订单重新推送
  rePushOrder: '/orderMonitor/rePushOrder',
  // sass订单设置已处理
  orderMonitorHandled: '/orderMonitor/handled',
  // 新建物流模板
  saveFreightTemplate: '/logistic/saveFreightTemplate',
  // 更新物流模板
  updateFreightTemplate: '/logistic/updateFreightTemplate',
  // 获取物流模板列表（分页）
  getFreightTemplateList: '/logistic/getFreightTemplateList',
  // 删除物流模板
  deleteFreightTemplate: '/logistic/deleteFreightTemplate',
  // 获取物流模板详情
  getFreightTemplateDetail: '/logistic/getFreightTemplateDetail',
  // 更新发票信息
  updateInvoiceBasicInfo: '/business/invoice/updateInvoiceBasicInfo',
  // 地推优惠申请 协议价申请
  // getDiscountApplyList: '/discountApply/getDiscountApplyList',
  // 地推优惠申请 协议价申请 审核
  discountApply: '/discountApply/audit',
  // 地推优惠申请 获取地推优惠配置
  getDiscountSettings: '/discountApply/getSettings',
  // 地推优惠申请 更新地推优惠配置
  updateDiscountSettings: '/discountApply/updateSettings',
  // 地推优惠申请 获取操作日志
  getSettingOpereationLog: '/discountApply/getSettingOpereationLog',
  // 大客户报价 手动上传报价单
  newCustomerQuote: '/bigCustomerQuote/newCustomerQuote',
  // 大客户报价 手动上传报价商品
  addQuoteItem: '/bigCustomerQuote/addQuoteItem',
  // 大客户报价上传
  uploadExcelFile: '/bigCustomerQuote/uploadExcelFile',
  // 大客户报价 获取列表
  getQuoteList: '/bigCustomerQuote/getQuoteList',
  // 大客户报价 获取详情页商品信息
  getQuoteItemList: '/bigCustomerQuote/getQuoteItemList',
  // 大客户报价 更新详情页商品信息
  updateQuoteItem: '/bigCustomerQuote/updateQuoteItem',
  // 大客户报价 删除报价单
  deleteQuote: '/bigCustomerQuote/deleteQuote',
  // 大客户报价 删除商品信息
  deleteQuoteItem: '/bigCustomerQuote/deleteQuoteItem',
  // 大客户报价 导出报价
  exportExcelFile: '/bigCustomerQuote/exportExcelFile',
  // 大客户报价 详情 批量设置价位
  batchUpdateQuotePrice: '/bigCustomerQuote/batchUpdateQuotePrice',
  // 大客户报价 更新报价单状态
  updateQuoteStatus: '/bigCustomerQuote/updateQuoteStatus',
  findUserLogByCondition: '/findByCondition',
  // 菜单管理列表
  menuList: '/menu/list',
  // 菜单管理 新增
  menuInsert: '/menu/insert',
  // 菜单管理 更新
  menuUpdate: '/menu/update',
  // 菜单管理 删除
  menuDelete: '/menu/delete',
  // 非菜单权限列表
  permissionListUrl: '/permission/listUrl',
  // 新增非菜单权限
  permissionInsert: '/permission/insert',
  // 修改非菜单权限
  permissionUpdate: '/permission/update',
  // 删除非菜单权限
  permissionDelete: '/permission/delete',
  // 菜单权限列表
  permissionListMenu: '/permission/listMenu',

  roleList: '/role/list',
  roleInsert: '/role/insert',
  roleUpdate: '/role/update',
  roleDelete: '/role/delete',
  // 列出该角色对应的菜单权限
  rolePermissionMenu: '/role/listRoleMenu',
  // 更新菜单列表成功
  updateRolePermission: '/role/updateRolePermission',
  // 非菜单权限列表
  rolePermissionList: '/role/listPermission',
  // 更新非菜单权限和角色的关系
  roleUpdateList: '/role/updateRolePermission',
  // 角色对应用户的列表
  roleListUser: '/role/listUser',
  // 新增用户角色关系
  roleInsertUser: '/role/insertUserInRole',
  // 角色用户解绑
  roleDeleteUser: '/role/deleteUserInRole',
  // 商品目录册： 查询
  getCatalogSpuList: '/catalog/getCatalogSpuList',
  // 商品目录册： 详情
  getListOfCatalogSku: '/catalog/getListOfCatalogSku',
  // 新增组
  groupInsert: '/group/insert',
  // 组列表
  groupList: '/group/list',
  // 删除组
  groupDelete: '/group/delete',
  // 更新组
  groupUpdate: '/group/update',
  // 列出关联组的用户
  groupListUser: '/group/listUser',
  // 关联用户到组
  groupInsertUser: '/group/insertUserInGroup',
  // 组中删除用户
  groupDeleteUser: '/group/deleteUserInGroup',
  // 经销商列表
  listStore: '/user/listStore',
  // 活动数据看板 查询
  selectDiscountSales: '/discountSales/select',
  // 活动数据看板 活动详情
  detailDiscountSales: '/discountSales/detail',
  // 查询仓库列表
  searchWarehouse: '/warehouse/list',
  // 获取仓库列表
  mappingWarehouse: '/warehouse/mapping',
  // 获取角色类型
  listRoleType: '/role/listRoleType',
  // 虚拟sku看板 查询接口
  getVirtualSkuList: '/virtualSku/getSkuList',
  // 虚拟sku看板 导出
  exportVirtualSkuList: '/virtualSku/export',
  // 获取促销活动内商品
  getPromotionProduct: '/promotion/getTargetProduct',
  // 获取满足条件订单列表(非月结, 根据订单搜索)
  getPaymentVoucherOrders: '/paymentVoucher/orders',
  // 获取满足条件订单列表(月结, 根据对账单搜索)
  getPaymentVoucherStatements: '/paymentVoucher/statements',
  // 获取非月结订单关联金额等参数
  getPaymentVoucherOrderItem: '/paymentVoucher/order',
  // 获取付款凭证编号
  getPaymentVoucherSn: '/paymentVoucher/voucherSn',
  // 保存审批（新建时）
  savePaymentVoucher: '/paymentVoucher/save',
  // 保存审批（编辑时）、保存核销
  updatePaymentVoucher: '/paymentVoucher/update',
  // 提交审批
  submitReviewPaymentVoucher: '/paymentVoucher/submitReview',
  // 提交核销
  submitWriteOffPaymentVoucher: '/paymentVoucher/submitWriteOff',
  // 获取付款凭证列表
  getPaymentVoucherList: '/paymentVoucher/list',
  // 付款凭证详情
  paymentVoucherDetail: '/paymentVoucher/detail',
  // 付款凭证上传凭证文件
  paymentVoucherUploadImg: '/paymentVoucher/upload/img',
  // 删除付款凭证文件
  deleteVoucherImage: '/paymentVoucher/deleteVoucherImage',
  // 审批 通过付款凭证
  reviewPaymentVoucher: '/paymentVoucher/review',
  // 核销 通过付款凭证
  writeOffPaymentVoucher: '/paymentVoucher/writeOff',
  // 审批/核销 退回付款凭证
  rejectPaymentVoucher: '/paymentVoucher/reject',
  // // 导出付款凭证(订单模式)
  // exportOrdersPaymentVoucher: '/paymentVoucher/exportOrders',
  // 导出付款凭证(对账单模式)
  exportStatementsPaymentVoucher: '/paymentVoucher/exportStatements',
  // 作废付款凭证
  obsoletePaymentVoucher: '/paymentVoucher/obsolete',
  // 删除付款凭证图片
  deletePaymentVoucherImage: '/paymentVoucher/deleteImage',
  // 删除付款凭证单条信息
  deletePaymentVoucherItem: '/paymentVoucher/deleteItem',
  // 获取协议价策略列表
  getCorpSettingOperateLog: '/usersCustomerOffice/getCorpSettingOperateLog',
  // 新增协议价策略
  updatePersonalizedSetting: '/usersCustomerOffice/updatePersonalizedSetting',
  // 获取协议价默认策略
  getDefaultSetting: '/usersCustomerOffice/getDefaultSetting',
  // 大客户报价 拉取所有协议申请单
  getProductQuoteList: '/usersCustomerOffice/getProductQuoteList',
  // 查询协议价申请单接口
  getDiscountApplyList: '/discountApply/getDiscountApplyList',
  // 获取协议申请单详情
  getApplyDetail: '/discountApply/getApplyDetail',
  // 导出单个协议申请单
  exportApplyDetail: '/discountApply/exportApplyDetail',
  // 保存协议申请单审核
  saveApplyDetail: '/discountApply/saveApplyDetail',
  // 提交协议申请单审核
  submitApplyDetail: '/discountApply/submitApplyDetail',
  // 重新报价
  requote: '/bigCustomerQuote/requote',
  // 操作日志
  operationList: '/logs/operationList',
  // 系统日志
  systemList: '/logs/systemList',
  // 配货规则类型
  getAllWmsType: '/distributeRule/getAllWmsType',
  // 商家自定义配货规则
  getSkuDistributeRules: '/distributeRule/getSkuDistributeRules',
  // 删除商家自定义配货规则
  deleteSkuDistributeRule: '/distributeRule/deleteSkuDistributeRule',
  // 新增商家自定义配货规则
  saveSkuDistributeRules: '/distributeRule/saveSkuDistributeRules',
  // 更新商家自定义配货规则
  updateSkuDistributeRule: '/distributeRule/updateSkuDistributeRule',
  // 商家的默认配货规则
  getStoreDistributeRules: '/distributeRule/getStoreDistributeRules',
  // 更新商家默认配货规则
  updateStoreDistributeRule: '/distributeRule/updateStoreDistributeRule',
  // 获取发票的监控日志
  invoiceMonitorList: '/invoiceMonitor/list',
  // 重试失败的发票
  invoiceMonitorRetry: '/invoiceMonitor/retry',
  // 获取客户采购申请协议价
  getCustomerQuoteItemList: '/bigCustomerQuote/getCustomerQuoteItemList',
  // 保存客户采购申请协议价报价
  customerUpdateQuoteItem: '/bigCustomerQuote/customerUpdateQuoteItem',
  // 提交客户采购申请协议价报价
  updateCustomerQuoteStatus: '/bigCustomerQuote/updateCustomerQuoteStatus',
  // 批量提交客户采购申请协议价策略
  batchUpdateCustomerQuotePrice: '/bigCustomerQuote/batchUpdateCustomerQuotePrice',
  // 分期付款 配置
  getInstalment: '/instalment/getInstalment',
  // 分期付款 配置 新增
  addInstalment: '/instalment/addInstalment',
  // 分期付款 配置 更新
  updateInstalment: '/instalment/updateInstalment',
  // 分期付款配置 删除
  deleteInstalment: '/instalment/deleteInstalment',
  // 查询发票列表
  invoiceList: '/business/invoice/getUserInvoiceDataList',
  // 添加发票
  addInvoice: '/business/invoice/addUserInvoiceData',
  // 更新发票
  updateInvoice: '/business/invoice/updateUserInvoiceData',
  // 删除发票
  deleteInvoice: '/business/invoice/deleteUserInvoiceData',
  // 设置默认发票
  setDefaultInvoice: '/business/invoice/setDefaultUserInvoiceData',
  // 订单详情提交发票信息
  saveInvoiceInfo: '/business/invoice/saveInvoiceInfo',
  // 订单详情 退换货 获取默认数量 金额
  getRefundAmount: '/serviceOrderController/getRefundAmount',
  // 商家发票配置 更新
  saveStoreInvoiceInfo: '/storeInfo/saveStoreInvoiceInfo',
  // 内容管理系统
  getArticleLists: '/cms/searchCms',
  addArticle: '/cms/addCms',
  updateArticle: '/cms/updateCms',
  deleteArticle: '/cms/delCmsById',
  getArticleById: '/cms/getCmsById',
  getArticleByName: '/cms/getCmsListByName',
  uploadImgArticle: '/cms/upload/img',
  importProcurement: '/procurement/importProcurement',
  getPurchaseRequires: '/procurement/getPurchaseRequires',
  addOutPlanTask: '/purchaseTaskMeta/addOutPlanTask',
  uploadLegalAttorney: '/supplierInfoController/upload/legalAttorney',
  uploadQualityProtocol: '/supplierInfoController/upload/qualityProtocol',
  launchAccountDelivery: '/accountCheckingController/launchAccountDelivery',
  items4Account: '/accountCheckingController/items4Account', // 对账单列表
  getBatchJobResult: '/asyncJob/getBatchJobResult', // 查询异步导出状态
  checkWithGoodsForAccountOrder: '/accountCheckingController/checkWithGoodsForAccountOrder', // 检测是否是随货发票
  getJobResult: '/asyncJob/getJobResult', // 异步导入Excel单个任务查询接口
  getGroundDiscountDetail: '/discountApply/groundDiscountDetail', // 查询地推优惠详情
  // 查询客户信息
  getOfficeInfoByCustomerName: '/usersCustomerOffice/getOfficeInfoByCustomerName',
  exportWithGoodsInvoice: '/business/invoice/exportWithGoodsInvoice',
  updateRemarkBySn: '/procurement/updateRemarkBySn', // 更新采购单详情备注
  addRemarkBySn: '/pms/purchaseOrder/updateRemarkByProcurementSn', // 添加采购单详情备注
  invoiceListByCondition: '/business/invoice/listByCondition', // 开票记录列表
  getInvoiceSettlementDimension: '/business/invoice/getInvoiceSettlementDimension', // 检测是订单还是对账单
  getPendingInvoiceOrderList: '/financial/getPendingInvoiceOrderList', // 待开票订单
  getPendingInvoiceAcctStatmentList: '/financial/getPendingInvoiceAcctStatmentList', // 待开对票账单列表
  redDashElecInvoice: '/business/invoice/redDashElecInvoice', // 电子发票红冲
  globalUpdateUser: '/user/updateUser',
  // 待开随货发票列表
  listPaperWithGoodInvoice: '/business/invoice/listPaperWithGoodInvoice',
  // 驳回待开随货发票
  rejectPendingInvoice: '/business/invoice/rejectPendingInvoice',
  remakeSingleEInvoice: '/business/invoice/remakeSingleEInvoice', // 开票记录里单张发票红冲后重开发票
  getInvoiceDetail: '/business/invoice/getInvoiceDetail ', // 发票应收单关系
  checkIfAllInvoiced: '/accountCheckingController/checkIfAllInvoiced', // 对账单是否全部开票
  // makePaperInvoice: '/business/invoice/makePaperInvoice',

  previousList: '/financial/previousList', // 往期可开票单据
  currentPeriodReceivables: '/financial/currentPeriodReceivables', // 当前可开票单据
  rejectInvoiceApply: '/business/invoice/rejectInvoiceApply', // 驳回发票
  exportFinancialReceivesInvoice: '/business/invoice/exportFinancialReceivesInvoice', // 导出发票
  customerReceivables: '/business/invoice/customerReceivables', // 客户应收欠款
  getReceivableArrears: '/arrears/getReceivableArrears', // 显示客户名称-欠款详情
  searchUsersArrears: '/arrears/searchUsersArrears', // 客户应收欠款
  orderPaymentInfo: '/accountCheckingController/orderPaymentInfo', // 获取订单支付信息
  launchedStatement: '/accountCheckingController/launchedStatement',
  getPersonInCharge: '/paymentVoucher/getPersonInCharge', // 销售负责人
  getTransactionList: '/financial/getTransactionList', // 交易流水列表
  signReverse: '/paymentVoucher/signReverse', // 凭证逆核销标记（重新核销）
  getWrittenOffList: '/financial/getWrittenOffList', // 核销详情接口
  refundList: '/paymentVoucher/refundList', // 获取可退款的对账单
  getRefundServiceOrders: '/paymentVoucher/serviceOrders', // 获取可退款的服务单
  // getRefundStatementList: '/accountCheckingController/getRefundStatementList', // 获取可退款的对账单
  stockChangeLog: '/logs/stockChangeLogList', // 库存log
  importAgreePriceExcelFile: '/productMaintenance/importAgreePriceExcelFile', // 协议价导入
  paymentVoucherExport: '/paymentVoucher/export', // 退款记录导出
  getProductSkuList4Console: '/productMaintenance/getProductSkuList4Console', // 商品定价列表
  getProductSkuDetail4Console: '/productMaintenance/getProductSkuDetail4Console', // 商品定价编辑
  updateProductSkuInfo: '/productMaintenance/updateProductSkuInfo', // 商品定价保存
  getGuidePrice4Console: '/productMaintenance/getGuidePrice4Console', // 商品指导价
  importProductSkuPriceFile: '/productMaintenance/importProductSkuPriceFile', // 商品定价导入
  exportProductSkuPrice: '/productMaintenance/exportProductSkuPrice', // 商品定价导出
  getPricingStrategyDetail: '/productPricingStrategy/getPricingStrategyDetail', // 定价策略
  updatePricingStrategyInfo: '/productPricingStrategy/updatePricingStrategyInfo', // 保存定价策略
  kingdeePushLogList: '/logs/kingdeePushLogList', // 金蝶日志
  getPaymentVoucherRefund: '/paymentVoucher/list/refundable', // 获取可退款的付款凭证
}
