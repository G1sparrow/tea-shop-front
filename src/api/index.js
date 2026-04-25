import axios from 'axios';

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // 后端API的基础URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加认证token到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 统一处理错误
    if (error.response?.status === 401) {
      // 检查请求配置中是否标记为需要认证
      if (error.config.requiresAuth !== false) {
        // 不再自动重定向，让业务逻辑处理401错误
        // 保留错误供业务逻辑处理
      }
    }
    return Promise.reject(error);
  }
);

// API服务函数
export const apiService = {
  // 用户端产品相关API
  userProduct: {
    // 获取所有产品
    getAllProducts(params = {}) {
      return apiClient.get('/user/products', params);
    },
    
    // 根据ID获取产品
    getProductById(id) {
      return apiClient.get(`/user/products/${id}`);
    },
    
    // 根据分类获取产品
    getProductsByCategory(category) {
      return apiClient.get(`/user/products/category/${category}`);
    },
    
    // 搜索产品
    searchProducts(keyword) {
      return apiClient.get(`/user/products/search?keyword=${encodeURIComponent(keyword)}`);
    },
    
    // 获取商品溯源信息
    getProductTracing(productId) {
      return apiClient.get(`/user/products/${productId}/tracing`);
    },
    
    // 获取商品品鉴信息
    getProductTasting(productId) {
      return apiClient.get(`/user/products/${productId}/tasting`);
    },
    
    // 获取商品冲泡指南
    getProductBrewingGuide(productId) {
      return apiClient.get(`/user/products/${productId}/brewing-guide`);
    }
  },

  // 管理端产品相关API
  adminProduct: {
    // 获取所有产品
    getAllProducts(params = {}) {
      return apiClient.get('/admin/products', params);
    },
    
    // 根据ID获取产品
    getProductById(id) {
      return apiClient.get(`/admin/products/${id}`);
    },
    
    // 根据分类获取产品
    getProductsByCategory(category) {
      return apiClient.get(`/admin/products/category/${category}`);
    },
    
    // 搜索产品
    searchProducts(keyword) {
      return apiClient.get(`/admin/products/search?keyword=${encodeURIComponent(keyword)}`);
    }
  },

  // 用户相关API
  user: {
    // 注册
    register(userData) {
      return apiClient.post('/user/register', userData);
    },
    
    // 登录
    login(credentials) {
      // 登录API不需要认证
      const config = { requiresAuth: false };
      return apiClient.post('/user/login', credentials, config)
        .then(response => {
          // 如果登录成功，保存token
          if (response.data && response.data.data && response.data.data.token) {
            localStorage.setItem('token', response.data.data.token);
          }
          return response;
        });
    },
    
    // 退出登录
    logout() {
      localStorage.removeItem('token');
      return Promise.resolve();
    },
    
    // 获取当前用户信息
    getCurrentUser() {
      const token = localStorage.getItem('token');
      if (!token) {
        return Promise.reject(new Error('No token found'));
      }
      return apiClient.get('/user/me', {
        requiresAuth: true
      });
    },
    
    // 获取用户信息
    getProfile(userId) {
      return apiClient.get(`/user/profile`, {
        params: { userId },
        requiresAuth: true
      });
    },
    
    // 更新用户信息
    updateProfile(profileData) {
      return apiClient.put('/user/profile', profileData, {
        requiresAuth: true
      });
    }
  },

  // 购物车相关API
  cart: {
    // 获取用户购物车
    getUserCart(userId) {
      return apiClient.get('/user/cart', {
        params: { userId },
        requiresAuth: true
      });
    },
    
    // 添加到购物车
    addToCart(userId, cartData) {
      return apiClient.post('/user/cart', cartData, {
        params: { userId },
        requiresAuth: true
      });
    },
    
    // 更新购物车商品数量
    updateCartItem(userId, productId, quantity) {
      return apiClient.put(`/user/cart/${productId}`, {}, {
        params: { userId, quantity },
        requiresAuth: true
      });
    },
    
    // 从购物车删除商品
    removeFromCart(userId, productId) {
      return apiClient.delete(`/user/cart/${productId}`, {
        params: { userId },
        requiresAuth: true
      });
    },
    
    // 清空购物车
    clearCart(userId) {
      return apiClient.delete('/user/cart/clear', {
        params: { userId },
        requiresAuth: true
      });
    }
  },

  // 用户端订单相关API
  userOrder: {
    // 创建订单
    createOrder(userId, orderData) {
      return apiClient.post('/user/orders', orderData, {
        params: { userId },
        requiresAuth: true
      });
    },
    
    // 获取订单详情
    getOrderById(orderId) {
      return apiClient.get(`/user/orders/${orderId}`, {
        requiresAuth: true
      });
    },
    
    // 获取用户订单列表
    getUserOrders(userId, params = {}) {
      return apiClient.get(`/user/orders/user/${userId}`, { 
        params,
        requiresAuth: true 
      });
    }
  },

  // 管理端订单相关API
  adminOrder: {
    // 获取所有订单（管理员）
    getAllOrders(params = {}) {
      return apiClient.get('/admin/orders', { 
        params,
        requiresAuth: true 
      });
    },
    
    // 更新订单状态
    updateOrderStatus(orderId, status) {
      return apiClient.put(`/admin/orders/${orderId}/status`, {}, {
        params: { status },
        requiresAuth: true
      });
    }
  }
};

export default apiService;

// 导出apiClient
export { apiClient };

// 仪表板相关API
export const getDashboardStats = () => {
  return apiClient.get('/admin/dashboard/stats');
};

export const getRecentOrders = (params = {}) => {
  return apiClient.get('/admin/dashboard/recent-orders', { params });
};