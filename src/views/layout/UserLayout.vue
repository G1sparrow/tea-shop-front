<template>
  <div class="user-layout">
    <!-- 按指定格式重构的导航栏 -->
    <header class="header">
      <div class="logo">茶语轩</div>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/all-tea">茶叶</router-link>
        <router-link to="/tea-set">茶器</router-link>
        <router-link to="/about">关于</router-link>
      </nav>
      <div class="icons">
        <el-badge :value="cartCount" :hidden="cartCount === 0" class="cart-badge">
          <div class="header-btn cart-btn" @click="$router.push('/cart')">
            <el-icon><ShoppingCart /></el-icon>
            <span>购物车</span>
          </div>
        </el-badge>
        
        <div v-if="isLoggedIn" class="user-dropdown">
          <div class="header-btn user-btn">
            <el-icon><User /></el-icon>
            <span>{{ username || '用户' }}</span>
            <el-icon class="arrow"><ArrowDown /></el-icon>
          </div>
          <div class="dropdown-menu">
            <div class="dropdown-item" @click="$router.push('/user')">个人中心</div>
            <div class="dropdown-item" @click="handleLogout">退出登录</div>
          </div>
        </div>
        
        <div v-else class="header-btn login-btn" @click="$router.push('/login')">
          <el-icon><User /></el-icon>
          <span>登录/注册</span>
        </div>
      </div>
    </header>

    <!-- 主内容区（子页面容器，保留） -->
    <main class="content-wrapper">
      <router-view />
    </main>

    <!-- 底部版权（极简保留，可选） -->
    <footer class="main-footer">
      <p>© 2026 茶语轩 版权所有</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, ShoppingCart, ArrowDown } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const isLoggedIn = ref(false)
const username = ref('')
const cartCount = ref(0)

// 检查登录状态
const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  const storedUsername = localStorage.getItem('username')
  
  isLoggedIn.value = !!token
  username.value = storedUsername || ''
}

// 更新购物车数量
const updateCartCount = () => {
  // 从localStorage获取购物车数据
  const cartData = localStorage.getItem('cart')
  if (cartData) {
    try {
      const cart = JSON.parse(cartData)
      cartCount.value = cart.length || 0
    } catch (e) {
      cartCount.value = 0
    }
  } else {
    cartCount.value = 0
  }
}

// 处理退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('username')
  isLoggedIn.value = false
  username.value = ''
  ElMessage.success('退出登录成功')
  router.push('/')
}

// 组件挂载时检查登录状态和购物车数量
onMounted(() => {
  checkLoginStatus()
  updateCartCount()
  
  // 监听storage变化，以便在其他标签页登录/登出时更新状态
  window.addEventListener('storage', checkLoginStatus)
  window.addEventListener('cartUpdated', updateCartCount)
})

// 组件卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener('storage', checkLoginStatus)
  window.removeEventListener('cartUpdated', updateCartCount)
})
</script>

<style scoped lang="scss">
// 全局布局容器
.user-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f9f7f4;
}

// 导航栏样式
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 10%;
  background: #fff;
  box-shadow: 0 2px 5px #0001;
  
  .logo {
    font-size: 1.3rem;
    font-weight: bold;
    color: var(--primary);
  }
  
  nav {
    display: flex;
    gap: 2rem;
    
    a {
      color: #333;
      text-decoration: none;
      transition: color 0.3s;
      
      &:hover {
        color: var(--primary);
      }
    }
  }
  
  .icons {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
}

// 激活的路由链接样式
nav a.router-link-active {
  color: var(--primary) !important;
  font-weight: 600;
}

// 统一样式的头部按钮
.header-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f5f5f5;
  color: #333;
  border: 1px solid transparent;
  
  .el-icon {
    font-size: 16px;
  }
  
  &:hover {
    background: var(--primary);
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(45, 87, 59, 0.3);
  }
  
  &.cart-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    
    &:hover {
      background: linear-gradient(135deg, #5568d3 0%, #653a8a 100%);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }
  
  &.login-btn {
    background: var(--primary);
    color: #fff;
    
    &:hover {
      background: #3d6e4d;
      box-shadow: 0 4px 12px rgba(45, 87, 59, 0.4);
    }
  }
  
  &.user-btn {
    background: #fff;
    border-color: var(--primary);
    color: var(--primary);
    
    .arrow {
      font-size: 12px;
      margin-left: 2px;
      transition: transform 0.3s;
    }
    
    &:hover {
      background: var(--primary);
      color: #fff;
      
      .arrow {
        transform: rotate(180deg);
      }
    }
  }
}

// 购物车徽章样式
.cart-badge {
  :deep(.el-badge__content) {
    background-color: #ff4d4f;
    border: none;
  }
}

// 用户下拉菜单
.user-dropdown {
  position: relative;
  
  &:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }
  
  .dropdown-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    min-width: 140px;
    overflow: hidden;
    z-index: 1000;
    
    .dropdown-item {
      padding: 12px 20px;
      font-size: 14px;
      color: #333;
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        background: #f5f5f5;
        color: var(--primary);
      }
      
      &:first-child {
        border-bottom: 1px solid #eee;
      }
    }
  }
}

// 主内容区样式
.content-wrapper {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  width: 100%;
}

// 底部版权样式
.main-footer {
  padding: 1rem 0;
  text-align: center;
  font-size: 13px;
  color: #999;
  border-top: 1px solid #eee;
  margin-top: 2rem;
}

// 定义主题色变量
:root {
  --primary: #2d573b;
}

// 用户名样式
.user-name {
  margin-left: 5px;
  font-size: 14px;
  color: var(--primary);
  white-space: nowrap;
}
</style>