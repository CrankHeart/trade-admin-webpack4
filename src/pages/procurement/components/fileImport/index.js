import FileImport from "./FileImport.vue";

FileImport.install = Vue => Vue.component( FileImport.name, FileImport );

// 支持使用标签的方式引入
if ( typeof window !== "undefined" && window.Vue ) {
  window.Vue.use( FileImport );
}

export default FileImport;
