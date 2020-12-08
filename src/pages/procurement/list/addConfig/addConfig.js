import supplierConfig from './options/supplierConfig'
import wareHouseConfig from './options/wareHouseConfig'
import typeConfig from './options/typeConfig'
export default {
    id: "addList",
    title: "新建普通采购单",
    fields: [ {
            name: "供应商",
            key: "suppliersId",
            editor: "select",
            config: supplierConfig
        },
        {
            name: "入库仓",
            key: "wareHouse",
            editor: "select",
            config: wareHouseConfig
        },
        {
            value: "同步供应商采购关系和报价",
            key: "isSync",
            editor: "check",
            layout: {
                lg: 6
            }
        },
        {
            value: "当前供应商设为首选",
            key: "isPreferred",
            editor: "check",
            layout: {
                lg: 6
            }
        },
        {
            name: "结算方式",
            key: "jiesuan",
            editor: "select",
            config: supplierConfig
        },
        {
            name: "开户行",
            key: "bankName"
        },
        {
            name: "银行账号",
            key: "settlementAccounts"
        },
        {
            name: "发票类型",
            key: "invoiceType",
            editor: "select",
            config: supplierConfig
        },
        {
            key: "textarea",
            editor: "input",
            type: "textarea"
        }
    ],
    layout:{
        sm: 12,
        modules:[{
            key: 'card1',
            title: '基础信息',
            content: ['suppliersId','wareHouse','isSync','isPreferred']
        },{
            key: 'card2',
            title: '供应商付款信息',
            content: ['jiesuan','bankName','settlementAccounts','invoiceType'],
            sm: 8
        },{
            key: 'card3',
            title: '备注信息',
            labelWidth: "0px",
            sm: 24
        }]
    }
}