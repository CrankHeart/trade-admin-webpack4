<template>
  <div>
    <article-template oper="edit" :data="articleData"></article-template>
  </div>
</template>

<script>
import articleTemplate from './components/articleTemplate.vue'
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex'

export default {
  name: 'article-edit',
  components: {
    articleTemplate
  },
  data() {
    return {
      articleData: {},
    }
  },
  methods: {
    ...mapActions( {
      getArticle: 'article/getArticle',
    } ),
    loadData() {
      let id = this.$route.params.id;
      this.getArticle( id ).then( data => {
        this.articleData = data.contentManagement
      } )
    }
  },
  activated() {
    this.loadData()
  },
  deactivated() {
    this.articleData = {}
  }
}
</script>

<style lang="stylus" scoped></style>


