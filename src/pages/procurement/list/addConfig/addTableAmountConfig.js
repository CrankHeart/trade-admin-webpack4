export default {
    id: "addListTableAmount",
    fields: [ {
            name: "商品总金额",
            key: "goodsAmount"
        },
        {
            name: "运费",
            key: "freight",
            editor: "inputNumber"
        },
        {
            name: "优惠金额",
            key: "discountAmount",
            editor: "inputNumber"
        },
        {
            name: "应付金额",
            key: "totalAmount"
        }
    ]
}