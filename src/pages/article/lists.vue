<template>
  <div class="article-list">
    <lc-title text="内容页管理"></lc-title>

    <lc-condition :condition="condition" @submit="loadData">
      <template slot="btn">
        <el-button class="create-btn" type="info" @click="addOper">新增</el-button>
      </template>
    </lc-condition>
    <lc-table
      :config="baseConfig"
      :data="articleList"
      @cur-change="curChange"
      :page="page"
      :key="baseConfig.length"
    >
      <template slot-scope="scope">
        <template v-if="scope.con.prop==='control' ">
          <el-button type="info" size="mini" @click="copyOper(scope.row.id)">复制链接</el-button>
          <el-button type="info" size="mini" @click="detailOper(scope.row.id)">查看</el-button>
          <el-button type="info" size="mini" @click="editOper(scope.row.id)">编辑</el-button>
          <el-button type="danger" size="mini" @click="deleteOper(scope.row.id)">删除</el-button>
        </template>
        <template
          v-else-if="scope.con.prop==='createDate'"
        >{{formatDate(scope.row[scope.con.prop])}}</template>
        <template v-else>{{scope.row[scope.con.prop]}}</template>
      </template>
    </lc-table>
  </div>
</template>

<script>
import lcTitle from '../../components/title.vue'
import lcTable from '../../components/table/index'
import lcCondition from '../../components/condition.vue'
import { mapActions } from 'vuex'
export default {
  name: 'article-list',
  components: {
    lcTitle,
    lcTable,
    lcCondition
  },
  inject: [ 'formatMyDate' ],
  props: {

  },
  data() {
    return {
      condition: [
        { value: [], key: 'rangeDate', label: '时间', type: 'daterange' },
        { value: '', key: 'name', label: '名称', type: 'text' }
      ],
      baseConfig: [
        { prop: 'id', label: 'ID', width: '80px' },
        { prop: 'name', label: '名称' },
        { prop: 'createDate', label: '创建时间', width: '180px' },
        { prop: 'control', label: '操作', width: '250px' }
      ],
      page: { cur: 1, total: 0, num: 10 },
      articleList: []
    }
  },
  methods: {
    ...mapActions( {
      getArticleList: 'article/getArticleList',
      deleteArticle: 'article/deleteArticle',
    } ),
    curChange( cur ) {
      this.page.cur = cur
      this.loadData()
    },
    initCondition() {
      let query = this.$route.query
      this.condition.forEach( val => {
        let { key, type } = val
        let v = query[ key ]
        if ( v ) {
          if ( key == 'starttime' || key == 'endtime' ) {
            val.value = new Date( v.replace( /\s/, 'T' ) )
          } else if ( type.indexOf( 'daterange' ) > -1 ) {
            if ( val.value && val.value[ 0 ] ) {
              let value = val.value
              val.value = []
              val.value[ 0 ] = new Date( value[ 0 ] )
              val.value[ 1 ] = new Date( value[ 1 ] )
            }
          } else {
            val.value = v
          }
        }
      } )
    },
    loadData() {
      let condition = this.formatOptions()
      this.getArticleList( condition ).then( ( { data } ) => {
        this.articleList = data.list;
        this.page.total = data.total;
      } )
    },
    formatOptions() {
      let param = {}
      this.condition.forEach( v => {
        let value = v.value
        if ( v.value !== '' ) {
          param[ v.key ] = v.value
        }

        if ( v.key == 'rangeDate' ) {
          if ( value && value[ 0 ] ) {
            param[ 'starttime' ] = this.formatMyDate( value[ 0 ] )
            param[ 'endtime' ] = this.formatMyDate( value[ 1 ], 'yyyy-MM-dd hh:mm:ss', true )
            delete param.rangeDate
          }
        }
      } )

      let { cur, num } = this.page
      param.num = num
      param.start = ( cur - 1 ) * num
      return param
    },
    addOper() {
      this.$router.push( '/article/create' )
    },
    editOper( id ) {
      this.$router.push( `/article/edit/${id}` )
    },
    detailOper( id ) {
      this.$router.push( `/article/detail/${id}` )
    },
    copyOper( id ) {
      // 拷贝URL地址到剪贴板,供客服粘贴
      let urlText = `#/article/detail/${id}`;
      let oInput = document.createElement( "input" );
      oInput.value = urlText;
      document.body.appendChild( oInput );
      oInput.select(); // 选择对象
      document.execCommand( "Copy" ); // 执行浏览器复制命令
      oInput.className = "oInput";
      oInput.style.display = "none";
      this.$message( {
        title: '复制成功',
        type: 'success',
        message: '复制成功:网站为:#/article/detail/6'
      } )
    },
    deleteOper( id ) {
      this.$confirm( '请确认该页面未被使用，删除后将无法访问，确定删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true,
        closeOnClickModal: false
      } ).then( () => {
        this.deleteArticle( { id } ).then( ( { data } ) => {
          this.articleList.some( ( v, index ) => {
            if ( v.id === id ) {
              this.articleList.splice( index, 1 )
              // 总数量要要减一
              this.page.total = Math.max( 0, +this.page.total - 1 )
              return true
            }
            return false
          } )
        } )
      } )
    },
    formatDate( date = {} ) {
      if ( date && date.time ) {
        return this.formatMyDate( date.time )
      }
      return ''
    }
  },
  created() {
  },
  activated() {
    this.initCondition()
    this.loadData()
  }
}
</script>

<style lang="stylus" scoped>
.create-btn
  margin-bottom 10px
</style>

