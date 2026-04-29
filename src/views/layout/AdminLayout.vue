<template>
  <div class="admin-layout">
    <!-- 侧边栏 -->
    <div class="sidebar" :class="{ collapsed: isCollapsed }">
      <!-- 侧边栏头部 -->
      <div class="sidebar-header">
        <div class="logo" v-if="!isCollapsed">茶器商城管理系统</div>
        <div class="logo collapsed-logo" v-else>茶管</div>
        <el-button icon="el-icon-fold" class="collapse-btn" @click="isCollapsed = !isCollapsed"></el-button>
      </div>

      <!-- 侧边栏菜单 -->
      <el-menu
        default-active="/admin/dashboard"
        class="sidebar-menu"
        background-color="#2d573b"
        text-color="#fff"
        active-text-color="#ffd04b"
        :collapse="isCollapsed"
        collapse-transition
        router  
      > <!--关键：开启路由模式-->  
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataBoard /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        
        <el-sub-menu index="2">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/admin/products">
            <template #title>
              <span style="margin-left: 16px;">茶叶管理</span>
            </template>
          </el-menu-item>
          <!-- 新增：茶叶种类管理 -->
          <el-menu-item index="/admin/tea-categories">
            <template #title>
              <span style="margin-left: 16px;">茶叶种类管理</span>
            </template>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/admin/orders">
          <el-icon><ShoppingCartFull /></el-icon>
          <template #title>订单管理</template>
        </el-menu-item>

        <el-menu-item index="5">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>

        <el-menu-item index="6" @click="logout">
          <el-icon><SwitchButton /></el-icon>
          <template #title>退出登录</template>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 顶部导航栏 -->
      <div class="header-bar">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ breadcrumbName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-icon class="header-icon"><Bell /></el-icon>
          <el-dropdown>
            <span class="user-info">
              <el-icon><UserFilled /></el-icon>
              {{ adminInfo.username }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="fetchAdminInfo">个人信息</el-dropdown-item>
                <el-dropdown-item>修改密码</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <router-view />
      </div>

      <!-- 底部版权 -->
      <div class="footer">© 2026 茶器商城管理系统 版权所有</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  DataBoard, Goods, ShoppingCartFull, User, Setting, 
  SwitchButton, Bell, UserFilled, Menu 
} from '@element-plus/icons-vue'
import apiService from '@/api/index.js'

const router = useRouter()
const route = useRoute()
const isCollapsed = ref(false) // 侧边栏是否折叠

// 管理员信息
const adminInfo = ref({
  username: '管理员',
  role: '超级管理员'
})

// 面包屑名称映射
const breadcrumbMap = {
  'AdminDashboard': '仪表盘',
  'AdminProducts': '茶叶管理',
  'AdminTeaCategories': '茶叶种类管理', // 新增映射
  'AdminOrders': '订单管理'
}

// 当前面包屑名称
const breadcrumbName = computed(() => {
  return breadcrumbMap[route.name] || route.meta?.title || '首页'
})

// 监听路由变化，展开对应菜单
watch(() => route.name, (newName) => {
  if (newName === 'AdminProducts' || newName === 'AdminTeaCategories') {
    (document.querySelector('.el-sub-menu[index="2"]')?.$el || {}).open = true
  }
})

// 从本地存储获取管理员信息
const fetchAdminInfo = () => {
  try {
    const storedAdminInfo = localStorage.getItem('adminInfo')
    if (storedAdminInfo) {
      const adminData = JSON.parse(storedAdminInfo)
      adminInfo.value = {
        username: adminData.name || adminData.username || '管理员',
        role: '超级管理员' // 可以根据实际需求从后端获取角色信息
      }
    }
  } catch (error) {
    console.error('获取管理员信息失败:', error)
    // 如果获取失败，使用默认信息
    adminInfo.value = { username: '管理员', role: '超级管理员' }
  }
}

// 退出登录
const logout = async () => {
  try {
    // 调用后端登出API（如果有的话）
    await apiService.user.adminLogout()
  } catch (error) {
    console.error('退出登录失败:', error)
  } finally {
    // 清除本地存储的token和管理员信息
    localStorage.removeItem('token')
    localStorage.removeItem('adminInfo')
    
    ElMessage.success('退出成功')
    router.push('/admin/login')
  }
}

// 组件挂载时获取管理员信息
onMounted(() => {
  fetchAdminInfo()
})
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f5f7fa;
}

// 侧边栏样式
.sidebar {
  width: 220px;
  background: #2d573b;
  color: #fff;
  transition: width 0.3s;
  overflow: hidden;

  &.collapsed {
    width: 64px;
  }

  .sidebar-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #4a7a58;

    .logo {
      font-size: 16px;
      font-weight: bold;
    }

    .collapsed-logo {
      font-size: 14px;
    }

    .collapse-btn {
      color: #fff;
      background: transparent;
      border: none;
      font-size: 18px;
      cursor: pointer;
    }
  }

  // ========== 关键修复：菜单样式统一 ==========
  .sidebar-menu {
    border-right: none;
    height: calc(100% - 60px);
    padding-top: 16px;

    // 统一所有菜单项的行高、内边距
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 48px !important;
      line-height: 48px !important;
      padding: 0 20px !important; // 统一左右内边距
      margin: 0 !important;
      display: flex;
      align-items: center; // 图标+文字垂直居中
    }

    // 统一图标大小和间距
    :deep(.el-menu-item i),
    :deep(.el-sub-menu__title i) {
      font-size: 16px !important; // 所有图标统一尺寸
      margin-right: 12px !important; // 图标和文字之间统一间距
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px; // 固定图标宽度，确保文字左对齐
    }

    // 选中项样式统一
    :deep(.el-menu-item.is-active) {
      background-color: #4a7a58 !important;
    }

    // 子菜单样式统一
    :deep(.el-sub-menu .el-menu-item) {
      padding-left: 25px !important; // 子菜单缩进对齐
    }
  }
}

// 主容器
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 顶部导航栏
.header-bar {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-left {
    .el-breadcrumb {
      font-size: 14px;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 20px;

    .header-icon {
      font-size: 18px;
      cursor: pointer;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
    }
  }
}

// 内容包装器
.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

// 底部版权
.footer {
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-size: 12px;
  color: #999;
  border-top: 1px solid #eee;
}
</style>