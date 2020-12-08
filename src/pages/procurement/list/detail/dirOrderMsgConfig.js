export default {
    fields: [
        {
            name: "订单号",
            key: "settlementMethod"
        },
        {
            name: "下单时间",
            key: "bankName"
        },
        {
            name: "直发客户",
            key: "settlementAccounts"
        },
        {
            name: "收货信息",
            key: "invoiceType",
            layout: {
                sm: 24
            }
        }
    ],
    layout:{
        sm: 8
    }
}