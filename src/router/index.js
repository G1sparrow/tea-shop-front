import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ===================== 前端用户路由（重命名后）=====================
  { 
    path: '/', 
    name: 'UserLayout', 
    component: () => import('@/views/layout/UserLayout.vue'),
    children: [
      // 所有文件路径同步加User前缀
      { path: '', name: 'Home', component: () => import('@/views/user/UserHome.vue') },
      { path: 'all-tea', name: 'AllTea', component: () => import('@/views/user/UserAllTea.vue') },
      { path: 'tea-set', name: 'TeaSet', component: () => import('@/views/user/UserTeaSet.vue') },
      { path: 'about', name: 'About', component: () => import('@/views/user/UserAbout.vue') },
      { path: 'product/:id', name: 'ProductDetail', component: () => import('@/views/user/UserProductDetail.vue') },
      { path: 'cart', name: 'Cart', component: () => import('@/views/user/UserCart.vue') },
      { path: 'user', name: 'UserCenter', component: () => import('@/views/user/UserCenter.vue') }, // 对应UserCenterPage.vue
    ]
  },

  // 前端独立页面（同步加User前缀）
  { path: '/login', name: 'Login', component: () => import('@/views/user/UserLogin.vue') },
  { path: '/order', name: 'OrderConfirm', component: () => import('@/views/user/UserOrderConfirm.vue') },
  { path: '/pay', name: 'Pay', component: () => import('@/views/user/UserPay.vue') },

  // ===================== 管理员路由（保持不变）=====================
  { 
    path: '/admin', 
    name: 'AdminLayout', 
    component: () => import('@/views/layout/AdminLayout.vue'),
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/AdminDashboard.vue') },
      { path: 'products', name: 'AdminProducts', component: () => import('@/views/admin/AdminProducts.vue') },
      { path: 'orders', name: 'AdminOrders', component: () => import('@/views/admin/AdminOrders.vue') },
      { path: 'tea-sets', name: 'AdminTeaSets', component: () => import('@/views/admin/AdminTeaSets.vue') },
    ]
  },
  { path: '/admin/login', name: 'AdminLogin', component: () => import('@/views/admin/AdminLogin.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否访问管理端页面
  if (to.path.startsWith('/admin')) {
    // 排除登录页面
    if (to.path === '/admin/login') {
      next() // 允许访问登录页面
      return
    }
    
    // 检查是否已登录（检查localStorage中的token）
    const token = localStorage.getItem('token')
    if (token) {
      next() // 已登录，允许访问
    } else {
      // 未登录，重定向到登录页面
      next('/admin/login')
    }
  } else {
    // 非管理端页面，直接允许访问
    next()
  }
})

export default router