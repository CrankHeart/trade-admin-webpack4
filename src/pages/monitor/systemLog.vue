
<script lang="ts">
import { Component } from 'vue-property-decorator'
import OperationLog from './operationLog.vue'
import lcCondition from './../../components/condition.vue'
import lcTable from './../../components/table/index'
import API from './../../API'
import { modules, logLevels } from './const'

@Component( {
  name: 'system-log'
} )
export default class SystemLog extends OperationLog {
  config = [
    { prop: 'module', label: '模块', width: '130px' },
    { prop: 'methodName', label: '方法名', width: '130px' },
    { prop: 'bizSeqId', label: '单据号', width: '130px' },
    // { prop: 'updatedByUserId', label: '用户id', width: '100px' },
    { prop: 'logLevel', label: '日志级别', width: '100px' },
    { prop: 'logContent', label: '日志详情' },
    { prop: 'createTime', label: '记入时间', width: '180px' },

  ]
  condition = [
    { value: void 0, key: 'module', label: '模块', type: 'select', options: modules },
    { value: void 0, key: 'methodName', label: '方法名', type: 'text' },
    { value: void 0, key: 'bizSeqId', label: '单据号', type: 'text' },
    { value: void 0, key: 'logLevel', label: '日志级别', type: 'select', options: logLevels },
    // { value: void 0, key: 'updatedByUserId', label: '用户id', type: 'select', options: this.users },
    { value: void 0, key: 'create', label: '操作时间', type: 'daterange' }
  ]

  logQueryLink = API.systemList
}

</script>

