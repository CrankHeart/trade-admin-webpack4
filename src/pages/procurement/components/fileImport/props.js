// props
export default {
  showFileImport: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "", // 文件上传 对话框标题 导入条码文件
  },
  placeholder: {
    type: String,
    default: "请上传文件", // 请选择xlsx文件进行上传
  },
  tips: {
    type: String,
    default: "请上传excel文件", // 请上传excel文件/请上传xlsx,xls文件，最多5000条记录 ，
  },
  uploadUrl: {
    type: String,
    default: "", // 文件上传路径
  },
  downMethod: {
    type: String,
    default: "get", // get/post
  },
  downUrl: {
    type: String,
    default: "", // 模板地址下载路径 服务器下载
  },
  templateUrl: {
    type: String,
    default: "", // 模板地址下载路径 本地下载
  },
  params: {
    type: Object,
    default: () => ({}), // 文件上传额外参数
  },
  fileTypes: {
    type: Array,
    default: () => ["xlsx", "xls", "csv"],
  },
  tableConfig: {
    type: Array,
    default: () => [],
  },
};
