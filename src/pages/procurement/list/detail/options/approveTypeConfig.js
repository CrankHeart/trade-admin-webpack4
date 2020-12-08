const types = [
  {name:"审核通过",code: 1},
  {name:"审核驳回",code: 0}
]
export default {
  key: "code",
  show: ["name"],
  data: types
}