import DataSet from './dataSet.vue'
import Field from './field/field.vue'
import Record from './record/record.vue'

DataSet.install = function (Vue) {
  Vue.component(DataSet.name, DataSet)
}

Field.install = function (Vue) {
  Vue.component(Field.name, Field)
}

Record.install = function (Vue) {
  Vue.component(Record.name, Record)
}

export {
  DataSet,
  Field,
  Record
}