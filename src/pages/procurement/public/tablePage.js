export default {
  data() {
    return {
      page: {
        num: 10,
        cur: 1,
        total: 0,
        sizes: [10, 20, 30, 50, 100, 200]
      }
    }
  },
  methods: {
    curChange(v) {
      this.page.cur = v
      this.search()
    },
    sizeChange(v) {
      this.page.num = v
      this.page.cur = 1
      this.search()
    }
  }
}
