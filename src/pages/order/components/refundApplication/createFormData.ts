

export default function createFormData ( serviceType = 1 ) {
  interface FormData {
    [ x: string ]: any;
  }

  // debugger
  let defaultOption: FormData = {
    // 硬编码
    serviceType: 3,
    // 读取父级组件数据
    applyUserId: '', // memberId 父级
    memberId: '', // memberId 父级
    storeId: '', // storeId 父级
    orderSn: '', // orderSn 父级

    goodsInfo: [
      // {
      //   goodsName: '', // goodsName 父级  商品名称
      //   goodsSpecification: '',      // goodsSpecification 父级 规格
      //   goodsLcCode: '',  //  父级  LC编码
      //   goodsSkuId: '',  //  父级 
      //   priceString: '',  //  父级  
      //   skuType: '', //  父级
      //   goodsNum: 0,
      // }
    ],
    refundableNum: 0,  // 最大退款数  goodsNum < availableNum
    // 表单共享数据
    goodsNum: '',  // 退款数量  goodsNum
    refundAmount: 0,  // 退款金额 
    contact: '', // 联系人
    mobile: '', // 联系电话
    dictionaryApplyReason: '',  // 退货原因   下拉框
    applyReason: '',   //  选填
  };

  return defaultOption;
}
