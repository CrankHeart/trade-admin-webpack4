export default [
  // {
  //   date: 'v2.0.10 - ',
  //   records: [
  //     {
  //       title: '商品',
  //       detail: [
  //         'A: [商品详情页] spu/sku上添加图片管理配置',
  //         'D: [商品详情页] 原页面中删除图片管理',
  //         'O: [商品详情页] 资质管理优化'
  //       ]
  //     },
  //     {
  //       title: '数据中心',
  //       detail: [
  //         'O: 数据中心后端代码优化，前端配合修改'
  //       ]
  //     },
  //     {
  //       title: '客户画像',
  //       detail: [
  //         'A: [用户画像详情] 新增canvas画图'
  //       ]
  //     }

  //   ]
  //   // 



  // }
  // {
  //   date: 'v2.0.7 - 2018/03/06',
  //   records: [
  //     {
  //       title: '新建采购单',
  //       detail: [
  //         'A: 添加【新建普通采购单】模块',
  //         'O: 原【新建采购单】模块改为【新建直发采购单】',
  //         'O: 【新建直发采购单】去除通过品牌与lcCode添加商品，所有商品均有缺货单中获取',
  //         'A: 针对采购单新增权限'
  //       ]
  //     },
  //     {
  //       title: '订单详情',
  //       detail: [
  //         'A: 商品出货信息新增商品退款模块',
  //         'O: 商品信息优化展示结果，合并同类商品'
  //       ]
  //     },
  //     {
  //       title: '数据中心-企业数据',
  //       detail: [
  //         'A: 新增销售金额分类',
  //         'A: 用户数据表新增普通用户复购率',
  //         'O: 优化总gmv传递参数'
  //       ]
  //     }
  //   ]
  // },
  // {
  //   date: 'v2.0.6 - 2018/02/08',
  //   records: [
  //     {
  //       title: '券码创建',
  //       detail: [
  //         'O: 去除特价券创建入口及相关',
  //         'O: 原有的【使用者限定】改为【发放者限定】，增加快速加入诊所 的模块',
  //         'O: 优化券码创建输入顺序，锁定券码生成数量与officeId限定数量'
  //       ]
  //     },
  //     {
  //       title: '新建采购单',
  //       detail: [
  //         'A: 新增按品牌加入sku商品模块',
  //         'A: 新增品牌快速搜索模块',
  //         'A: 新增品牌下商品快速搜索模块'
  //       ]
  //     },
  //     {
  //       title: '其他改动',
  //       detail: [
  //         'O: 服务中心部分字段修改'
  //       ]
  //     }
  //   ]
  // },
  // {
  //   date: 'v2.0.5 - 2018/01/26',
  //   records: [
  //     {
  //       title: '订单详情',
  //       detail: [
  //         'O: 订单详情中 字段修改'
  //       ]
  //     },
  //     {
  //       title: '采购中心',
  //       detail: [
  //         'A: 新增采购列表与新建采购单',
  //         'A: 隐形新增缺货单'
  //       ]
  //     },
  //     {
  //       title: '字段修改',
  //       detail: [
  //         'O: 全平台原有的会员等级A/B/C 改为 平台会员/企采会员/集团会员'
  //       ]
  //     }
  //   ]
  // },
  // {
  //   date: 'v2.0.4 - 2019/01/08',
  //   records: [
  //     {
  //       title: '企业数据',
  //       detail: [
  //         'A: 新增企业数据可视化视图',
  //         'O: 原有的企业数据往下移动，命名为企业数据2'
  //       ]
  //     },
  //     {
  //       title: '客户中心',
  //       detail: [
  //         'A: 新增门诊管理'
  //       ]
  //     },
  //     {
  //       title: 'tenant组件搜索优化',
  //       detail: [
  //         'O: 在客户管理中修改货币精确度同步至tenant组件缓存中'
  //       ]
  //     }
  //   ]
  // },
  // {
  //   date: 'v2.0.3 - ',
  //   records: [
  //     {
  //       title: '商品详情',
  //       detail: [
  //         'A: 商品详情spu name/store/brand/unit 修改为可编辑，并添加唯一性验证',
  //         'O: 商品图片展示 图片地址增加时间戳，去除缓存'
  //       ]
  //     },
  //     {
  //       title: 'tenant组件搜索优化',
  //       detail: [
  //         'O: 在客户管理中修改货币精确度同步至tenant组件缓存中'
  //       ]
  //     }
  //   ]
  // },
  // {
  //   date: 'v2.0.2 - 2017/12/18',
  //   records: [
  //     {
  //       title: '管理后台 权限配置',
  //       detail: [
  //         'A: 整个管理后台新增权限，其中1-2级页面级权限前端控制，页面内权限按实际需求由前后端配合控制',
  //         'A: 权限控制调整路由加载机制，初始化后根据权限加载路由',
  //         'O: 一级权限按钮点击跳转调整'
  //       ]
  //     },
  //     {
  //       title: '发票管理',
  //       detail: [
  //         'O: 发票管理数据库调整，抽离出单独数据表，前后端部分调整'
  //       ]
  //     },
  //     {
  //       title: '商品维护',
  //       detail: [
  //         'F: 初次进去页面，品牌搜索条件的下拉无品牌列表的bug'
  //       ]
  //     },
  //     {
  //       title: '发票管理',
  //       detail: [
  //         'O: 删除【供应商】搜索项与展示项'
  //       ]
  //     },
  //     {
  //       title: '权限管理 编辑',
  //       detail: [
  //         'O: 权限编辑时禁止修改权限值',
  //         'F: 初次编辑二级权限时，父级权限没有正确代入的bug'
  //       ]
  //     },
  //     {
  //       title: '商品详情新增',
  //       detail: [
  //         'A: sku/新增sku 新增试用（trial）字段'
  //       ]
  //     },
  //     {
  //       title: '其他调整',
  //       detail: [
  //         'O: 商品详情Sku select 提取出公用组件',
  //         'O: 部分文件命名调整',
  //         'O: 重新调整了登录信息缓存机制'
  //       ]
  //     }
  //   ]
  // },
  // {
  //   date: 'v2.0.1 - 2017/12/04',
  //   records: [
  //     {
  //       title: '新增 满赠促销活动 类型',
  //       detail: [
  //         'A: 促销列表新增满赠类型查询',
  //         'A: 促销新增满赠类型创建',
  //         'F：促销满减创建 规则在初始状态无法设置的bug',
  //         'O: 促销详情展示优化，新增满赠促销类型展示'
  //       ]
  //     },
  //     {
  //       title: '订单详情 部分优化',
  //       detail: [
  //         'O: 价格总计-> 促销策略展示效果 在字数超长的情况下展示tips',
  //         'O: 出货信息-> 新增部分展示字段【specificatio/lcCode/number/remark/code】，新增表格展示控制'
  //       ]
  //     },
  //     {
  //       title: '促销满减折扣优化 ',
  //       detail: [
  //         'O: 提取出品牌快速搜索组件作为公共组件'
  //       ]
  //     },
  //     {
  //       title: '页面管理banner 部分优化',
  //       detail: [
  //         'F: 修复banner link在修改保存后按钮一直处于loading状态的bug'
  //       ]
  //     },
  //     {
  //       title: '企业名称搜索组件 优化',
  //       detail: [
  //         'F: 企业名称在清空后再次搜索时无法清除的bug，监听输入框，在输入框清空后主动情况企业信息'
  //       ]
  //     },
  //   ]
  // },
  // {
  //   date: 'v2.0.0 - 2017/11/20',
  //   records: [
  //     {
  //       title: '新增服务中心',
  //       detail: [
  //         'A: 原订单查询中的退换货信息转移至服务中心，可查询信息并进行相关操作'
  //       ]
  //     },
  //     {
  //       title: '订单搜索优化',
  //       detail: [
  //         'O: 订单状态优化，去除退换货状态以及部分冗余状态'
  //       ]
  //     },
  //     {
  //       title: '数据中心优化',
  //       detail: [
  //         'F: 商品销量，日期在空状态下切换tab可能报错',
  //         'A: 商品最近30天销量增加导出功能'
  //       ]
  //     },
  //     {
  //       title: '部分样式与代码优化',
  //       detail: [
  //         'O: 屏幕高度获取并存储至vuex，剔除原有的函数获取方式',
  //         'O: 增加对window.resize的监听，响应屏幕高度的变化',
  //         'O: navbar z-index层级下降，抬升dialog-wrap的层级，优化dialog展示效果',
  //         'O: dialog header color 修改'
  //       ]
  //     },
  //   ]
  // }
]