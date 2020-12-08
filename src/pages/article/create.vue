<template>
  <div>
    <article-template oper="create" :data="articleData"></article-template>
  </div>
</template>

<script>
import articleTemplate from './components/articleTemplate'
export default {
  name: 'article-list',
  components: {
    articleTemplate
  },
  data() {
    return {
      articleData: {}
    }
  }
}
</script>



