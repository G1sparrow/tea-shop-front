# 茶叶售卖系统项目文档

## 1. 项目概述

本项目是一个基于B/S架构的茶叶售卖系统，分为用户端和管理端两部分。用户端提供茶叶浏览、购买、购物车管理等功能；管理端提供产品管理、订单管理、数据统计等功能。

### 1.1 系统架构

- **前端**：Vue 3 + Pinia + Element Plus
- **后端**：Spring Boot
- **数据库**：MySQL
- **API规范**：RESTful API
- **数据交互**：JSON格式

## 2. 前端项目结构

### 2.1 目录结构

```
src/
├── api/                # API服务
│   └── index.js        # API接口定义
├── assets/             # 静态资源
│   └── css/            # 样式文件
│       └── global.scss # 全局样式
├── components/         # 组件
│   ├── Banner.vue      # 首页轮播组件
│   └── ProductCard.vue # 产品卡片组件
├── store/              # 状态管理
│   └── cart.js         # 购物车状态管理
├── views/              # 页面视图
│   ├── admin/          # 管理端页面
│   │   ├── AdminDashboard.vue  # 管理仪表盘
│   │   ├── AdminLogin.vue      # 管理登录
│   │   ├── AdminOrders.vue     # 订单管理
│   │   ├── AdminProducts.vue   # 产品管理
│   │   └── AdminTeaSets.vue    # 茶具管理
│   ├── layout/         # 布局组件
│   │   ├── AdminLayout.vue     # 管理端布局
│   │   └── UserLayout.vue      # 用户端布局
│   └── user/           # 用户端页面
│       ├── UserAbout.vue        # 关于我们
│       ├── UserAllTea.vue       # 所有茶叶
│       ├── UserCart.vue         # 购物车
│       ├── UserCenter.vue       # 用户中心
│       ├── UserHome.vue         # 首页
│       ├── UserLogin.vue        # 用户登录
│       ├── UserOrderConfirm.vue # 订单确认
│       ├── UserPay.vue          # 支付页面
│       ├── UserProductDetail.vue # 产品详情
│       └── UserTeaSet.vue       # 茶具页面
├── router/             # 路由配置
│   └── index.js        # 路由定义
├── App.vue             # 根组件
└── main.js             # 入口文件
```

### 2.2 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 最新 | 前端框架 |
| Pinia | 最新 | 状态管理 |
| Element Plus | 最新 | UI组件库 |
| Axios | 最新 | HTTP客户端 |
| Vue Router | 最新 | 路由管理 |
| SCSS | 最新 | CSS预处理器 |

## 3. 核心功能模块

### 3.1 用户端功能

1. **首页**
   - 轮播图展示
   - 茶叶分类标签（全部/绿茶/乌龙/红茶）
   - 精选茗茶展示
   - 产品卡片点击跳转详情

2. **产品浏览**
   - 分类筛选
   - 产品列表展示
   - 产品搜索

3. **产品详情**
   - 产品信息展示
   - 商品溯源信息
   - 商品品鉴信息
   - 商品冲泡指南
   - 加入购物车

4. **购物车**
   - 商品列表管理
   - 数量调整
   - 商品删除
   - 订单确认

5. **用户中心**
   - 个人信息管理
   - 订单历史查询

6. **订单管理**
   - 订单创建
   - 订单支付
   - 订单状态查询

### 3.2 管理端功能

1. **仪表盘**
   - 数据统计
   - 最近订单

2. **产品管理**
   - 产品列表
   - 产品添加/编辑/删除
   - 产品分类管理

3. **订单管理**
   - 订单列表
   - 订单状态更新

4. **茶具管理**
   - 茶具列表
   - 茶具添加/编辑/删除

### 4 数据库结构

- **users**：用户表
- **products**：产品表
- **categories**：分类表
- **orders**：订单表
- **order_items**：订单详情表
- **cart_items**：购物车表
- **tea_sets**：茶具表

## 5. 部署与运行

### 5.1 前端部署

1. 安装依赖：`npm install`
2. 开发环境运行：`npm run dev`
3. 生产环境构建：`npm run build`

### 5.2 后端部署

1. 配置数据库连接
2. 构建项目：`mvn clean package`
3. 运行：`java -jar target/teashop.jar`


