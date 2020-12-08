import {
  VuexClass,
  extractVuexModule,
  Mutation,
  Action,
  Getter,
  HasGetter
} from 'vuex-class-module'
import API from '../../API'
import { http } from '../../utils'

@VuexClass({
  modules: {}
})
class ArticleModule {
  articleList = []
  currentArticle = {}

  @Mutation setArticleListMutation(state, data) {
    state.articleList = data
  }

  @Mutation setCurrentArticleMutation(state, data) {
    state.currentArticle = data
  }

  @Mutation addArticleMutation(state, data) {
    state.articleList.push(data)
  }

  @Mutation updateArticleMutation(state, data) {
    if (data.index && data.params) {
      state.articleList[data.index] = data.params
    }
  }

  @Mutation removeArticleMutation(state, data) {
    state.articleList = state.articleList.filter(item => item.id != data)
  }

  @Action getArticleList({ state, commit }, params = {}) {
    return http(API.getArticleLists, params)
      .then(({ data }) => {
        // commit( 'setArticleListMutation', data.list || [] )
        return data
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }

  @Action deleteArticle({ commit }, params) {
    return http(API.deleteArticle, params)
      .then(({ data }) => {
        return Promise.resolve(data)
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }

  // 从服务器获取信息
  @Action getArticle({ state }, id) {
    // return state.articleList.find( ( item ) => item.id == id )
    //  return getMockLists({}).then( ({data}) => {
    //       let list = data.list;
    //       let findObj = list.find((item) => item.id == id);
    //       return findObj
    //   })
    return http(API.getArticleById, { cmId: +id })
      .then(({ data }) => {
        return Promise.resolve(data)
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }

  // 从store查找信息
  @Action findArticle({ state }, id) {
    return state.articleList.find(item => item.id == id)
  }

  @Action updateArticle({ state, commit }, params) {
    if (params.id) {
      // let findIndex = state.articleList.findIndex( ( item ) => item.id == params.id )
      return http(API.updateArticle, params)
        .then(data => {
          return Promise.resolve(data)
        })
        .catch(err => {
          return Promise.reject(err)
        })
    } else {
      return http(API.addArticle, params)
        .then(data => {
          return Promise.resolve(data)
        })
        .catch(err => {
          return Promise.reject(err)
        })
    }
  }
}

const storeModule = extractVuexModule(ArticleModule)
export default storeModule
