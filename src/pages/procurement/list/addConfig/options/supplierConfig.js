export default {
  id: "listSupplier",
  queryUrl: "/supplierInfoController/getSupplierInfos",
  key: "id",
  show: [ "supplierName" ],
  map: [ {
    from: "supplierName",
    to: "suppliers"
  }, 'taxPoint', 'bankName', 'settlementAccounts' ]
}
