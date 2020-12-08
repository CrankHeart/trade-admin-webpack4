const types = [
    {name:"同步供应商采购关系和报价",code: 1},
    {name:"当前供应商设为首选",code: 2}
]
export default {
    id: "list-type",
    key: "code",
    show: ["name"],
    data: types
}