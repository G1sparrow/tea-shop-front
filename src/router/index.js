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
      { path: 'categories', name: 'AdminTeaCategories', component: () => import('@/views/admin/AdminTeaCategories.vue') },
      { path: 'orders', name: 'AdminOrders', component: () => import('@/views/admin/AdminOrders.vue') },
    ]
  },
  { path: '/admin/login', name: 'AdminLogin', component: () => import('@/views/admin/AdminLogin.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  // 检查是否访问管理端页面
  if (to.path.startsWith('/admin')) {
    // 排除登录页面
    if (to.path === '/admin/login') {
      next();
      return;
    }
    
    // 检查是否已登录
    if (token) {
      next();
    } else {
      next('/admin/login');
    }
  } 
  // 检查是否访问需要登录的用户端页面
  else if (['/cart', '/user', '/order', '/pay'].includes(to.path)) {
    if (token) {
      next();
    } else {
      // 重定向到登录页面，登录后返回原页面
      next({ path: '/login', query: { redirect: to.fullPath } });
    }
  } 
  else {
    // 其他页面直接允许访问
    next();
  }
});

export default router