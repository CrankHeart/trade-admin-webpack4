const types = [ {
  name: "审核通过",
  code: 0
},
{
  name: "审核驳回",
  code: 1
}
]
export default {
  fields: [ {
    name: '',
    key: "reviewFlag",
    editor: "radio",
    required: true,
    config: {
      key: "code",
      show: "name",
      data: types
    }
  },
  {
    name: "审核意见",
    key: "reviewMsg",
    editor: "input",
    type: "textarea",
    placeholder: "请填写审核意见，不超过100字",
    maxlength: 100
  }
  ]
}
