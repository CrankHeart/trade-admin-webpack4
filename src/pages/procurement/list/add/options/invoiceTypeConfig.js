const types = [
  {name:"增值税普通发票",code: 0},
  {name:"增值税专用发票",code: 1}
]
export default {
  key: "code",
  show: ["name"],
  data: types
}