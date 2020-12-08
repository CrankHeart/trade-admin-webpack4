import { Vue, Component } from 'vue-property-decorator'

@Component( {
  name: 'standard-tabs-change'
} )
export default class StandardTabsChange extends Vue {
  tabName = 'merchant'
  tabsChange ( value ) {
    this.tabName = value
  }
  get visible () {
    return this.tabName == 'standard'
  }
}