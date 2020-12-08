const types = [ {
    name: "审核通过",
    code: 1
  },
  {
    name: "审核驳回",
    code: 0
  }
]
export default {
  fields: [ {
      name: '',
      key: "auditState",
      editor: "radio",
      required: true,
      config: {
        key: "code",
        show: [ "name" ],
        data: types
      }
    },
    {
      name: "审核意见",
      key: "remark",
      editor: "input",
      type: "textarea"
    }
  ]
}
