const types = [
  {name:"未付款",code: 0},
  {name:"待付尾款",code: 1},
  {name:"待月结",code: 2},
  {name:"已付款",code: 3}
]
export default {
  key: "code",
  show: ["name"],
  data: types
}