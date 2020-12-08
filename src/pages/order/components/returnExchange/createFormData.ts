

export default function createFormData ( serviceType = 1 ) {
  interface FormData {
    [ x: string ]: any;
  }

  // debugger
  let defaultOption: FormData = {
    // 硬编码
    // dataSource: '1',  // 写死
    goodsImage: '',   // 默认值
    purchaseProperty: '0', // 写死
    companyCode: '',  // 读取前面代码
    // 读取父级组件数据
    applyUserId: '', // memberId 父级
    goodsName: '', // skuName 父级  商品名称
    goodsSpecification: '',      // specification 父级 规格
    goodsLcCode: '',  // lcSkuCode 父级  LC编码  goodsLcCode  <==>lcSkuCode
    lcSkuCode: '',  // lcSkuCode 父级  LC编码
    orderSn: '', // orderSn 父级
    skuType: '', // skuType 父级
    goodsSkuId: '',  // skuId 父级

    // 表单共享数据
    serviceType, // 售后类型 退货-1/换货-2
    goodsNum: '',  // 退款数量  退款数量 applyNum

    availableAmount: '0', // 最大可退金额 隐藏表单判断 refundAmount <= availableAmount
    refundAmount: '0',  // 退款金额 serviceType=2 为0
    contact: '', // 联系人
    mobile: '', // 联系电话
    // 退货serviceType=1
    dictionaryApplyReason: '',  // 退货原因   下拉框
    applyReason: '', //  选填
    // 换货serviceType=2
    receiverAddress: '',  // 联系地址 receiverAddress
  };
  // 退货serviceType=1 换货serviceType=2
  if ( serviceType == 2 ) {
    //  自用属性
    Object.assign( defaultOption, {
      provinceId: '',
      cityId: '',
      countryId: '',
      detailAddress: '',  // 详细地址
    } );
  }

  return defaultOption;
}
