import approveConfig from './options/approveTypeConfig'
export default {
  fields: [
    {
      key: "auditState",
      editor: "radio",
      config: approveConfig
    },
    {
      name: "审核意见",
      key: "remark",
      editor: "input",
      type: "textarea"
    }
  ]
}