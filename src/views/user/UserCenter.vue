<template>
  <div class="user-page">
    <div class="user-layout">
      <!-- 左侧菜单 -->
      <div class="user-menu">
        <div class="user-info">
          <div class="avatar"></div>
          <p class="name">{{ form.name || '茶友' }}</p>
        </div>

        <div class="menu-list">
          <div
            v-for="item in menuList"
            :key="item.key"
            class="menu-item"
            :class="{ active: activeMenu === item.key }"
            @click="activeMenu = item.key"
          >
            {{ item.name }}
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="user-content">
        <!-- 1. 订单管理 -->
        <div v-if="activeMenu === 'order'">
          <h3>我的订单</h3>
          <div class="order-tabs">
            <span v-for="t in orderTabs" :key="t" :class="{ active: orderTab === t }" @click="orderTab = t">
              {{ t }}
            </span>
          </div>
          <div v-loading="loading" class="order-list">
            <div v-if="orders.length === 0" class="order-empty">暂无订单</div>
            <div v-else class="order-item" v-for="order in orders" :key="order.id">
              <div class="order-header">
                <span class="order-no">订单号: {{ order.orderNo }}</span>
                <span class="order-status">{{ order.status }}</span>
              </div>
              <div class="order-content">
                <div v-for="(item, index) in order.items" :key="index" class="order-product">
                  <div class="product-info">
                    <div class="product-name">{{ item.name }}</div>
                    <div class="product-price">¥{{ item.price.toFixed(2) }}</div>
                  </div>
                  <div class="product-quantity">×{{ item.quantity }}</div>
                </div>
              </div>
              <div class="order-footer">
                <span class="order-time">{{ order.createTime }}</span>
                <div class="order-total">
                  <span>总计: </span>
                  <span class="total-price">¥{{ order.totalPrice.toFixed(2) }}</span>
                </div>
              </div>
              <div class="order-actions">
                <el-button v-if="order.status === '待付款'" type="primary" size="small">去付款</el-button>
                <el-button v-else-if="order.status === '待收货'" type="primary" size="small">确认收货</el-button>
                <el-button v-else-if="order.status === '待评价'" type="primary" size="small">去评价</el-button>
                <el-button v-else text size="small">查看详情</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. 地址管理 -->
        <div v-if="activeMenu === 'address'">
          <h3>收货地址</h3>
          <el-button type="primary" size="small" style="margin-bottom:1rem">新增地址</el-button>
          <div class="address-item" v-for="i in 2" :key="i">
            <div class="default" v-if="i===1">默认</div>
            <p>张三 13800138000</p>
            <p>浙江省杭州市西湖区茶语路88号</p>
            <div class="btns">
              <el-button text>编辑</el-button>
              <el-button text type="danger">删除</el-button>
            </div>
          </div>
        </div>

        <!-- 3. 个人信息 -->
        <div v-if="activeMenu === 'info'">
          <h3>个人信息</h3>
          <el-form label-width="80px" style="max-width:400px;margin-top:1rem">
            <el-form-item label="用户名">
              <el-input v-model="form.name" readonly />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="form.phone" readonly />
            </el-form-item>
          </el-form>
        </div>

        <!-- 4. 退出登录 -->
        <div v-if="activeMenu === 'logout'">
          <h3>确定退出登录？</h3>
          <el-button type="primary" @click="logout">确认退出</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { apiService } from '@/api'

const router = useRouter()

// 左侧菜单
const activeMenu = ref('order')
const menuList = ref([
  { key: 'order', name: '我的订单' },
  { key: 'address', name: '收货地址' },
  { key: 'info', name: '个人信息' },
  { key: 'logout', name: '退出登录' },
])

// 订单标签
const orderTab = ref('全部')
const orderTabs = ref(['全部', '待付款', '待发货', '待收货', '待评价'])

// 订单列表
const orders = ref([])
const loading = ref(false)

// 表单
const form = reactive({
  name: '',
  phone: ''
})

// 加载订单列表
const loadOrders = async () => {
  try {
    loading.value = true
    // 这里应该调用后端API获取订单列表
    // 暂时使用模拟数据
    orders.value = [
      {
        id: 1,
        orderNo: 'TEA20240101001',
        totalPrice: 298.00,
        status: '待付款',
        createTime: '2024-01-01 10:00:00',
        items: [
          {
            name: '西湖龙井',
            price: 298.00,
            quantity: 1
          }
        ]
      },
      {
        id: 2,
        orderNo: 'TEA20240102002',
        totalPrice: 198.00,
        status: '已完成',
        createTime: '2024-01-02 14:30:00',
        items: [
          {
            name: '铁观音',
            price: 198.00,
            quantity: 1
          }
        ]
      }
    ]
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单失败')
  } finally {
    loading.value = false
  }
}

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.error('请先登录')
      router.push('/login')
      return
    }
    
    const response = await apiService.user.getCurrentUser()
    const userData = response.data.data
    
    form.name = userData.username
    form.phone = userData.phone
  } catch (error) {
    console.error('加载用户信息失败:', error)
    // 如果是401错误，表示token无效，需要重新登录
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('token')
      router.push('/login')
    } else {
      ElMessage.error('加载用户信息失败')
    }
  }
}

onMounted(() => {
  // 检查登录状态
  const token = localStorage.getItem('token');
  if (!token) {
    ElMessage.error('请先登录');
    router.push('/login');
    return;
  }
  
  // 延迟加载用户信息，避免与页面渲染冲突
  setTimeout(() => {
    // 总是加载用户信息，以便在左侧菜单显示用户名
    loadUserInfo();
    
    if (activeMenu.value === 'info') {
      loadUserInfo()
    } else if (activeMenu.value === 'order') {
      loadOrders()
    }
  }, 100);
})

// 监听菜单变化，当切换到个人信息时加载数据
watch(activeMenu, (newVal) => {
  if (newVal === 'info') {
    loadUserInfo()
  } else if (newVal === 'order') {
    loadOrders()
  }
})

// 退出登录
const logout = () => {
  localStorage.removeItem('userId')
  localStorage.removeItem('username')
  localStorage.removeItem('token')
  ElMessage.success('退出成功')
  router.push('/')
}
</script>


<style scoped lang="scss">
.user-page {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.user-layout {
  display: flex;
  gap: 2rem;
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px #00000008;
}

/* 左侧菜单 */
.user-menu {
  width: 200px;
  border-right: 1px solid #eee;
  padding-right: 1rem;
}
.user-info {
  text-align: center;
  margin-bottom: 2rem;
}
.avatar {
  width: 70px;
  height: 70px;
  background: #e8f1e8;
  border-radius: 50%;
  margin: 0 auto 10px;
}
.name {
  font-weight: bold;
  color: #333;
}
.menu-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.menu-item {
  padding: 10px 14px;
  border-radius: 6px;
  cursor: pointer;
  &.active {
    background: #e8f1e8;
    color: #2d573b;
    font-weight: 500;
  }
}

/* 右侧内容 */
.user-content {
  flex: 1;
  padding-left: 1rem;
}
h3 {
  margin-bottom: 1rem;
  color: #333;
}

/* 订单 */
.order-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  span {
    cursor: pointer;
    &.active {
      color: #2d573b;
      font-weight: bold;
    }
  }
}
.order-empty {
  color: #999;
  padding: 2rem 0;
  text-align: center;
}

/* 地址 */
.address-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  position: relative;
  p {
    margin: 0 0 6px;
  }
}
.default {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #2d573b;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
}
.btns {
  margin-top: 10px;
}

/* 订单列表 */
.order-list {
  margin-top: 1rem;
}

.order-item {
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f9f9f9;
  border-bottom: 1px solid #eee;
  
  .order-no {
    font-size: 14px;
    color: #666;
  }
  
  .order-status {
    font-size: 14px;
    font-weight: 500;
    color: #2d573b;
  }
}

.order-content {
  padding: 1rem;
}

.order-product {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  .product-info {
    flex: 1;
    
    .product-name {
      font-size: 14px;
      color: #333;
      margin-bottom: 4px;
    }
    
    .product-price {
      font-size: 14px;
      color: #666;
    }
  }
  
  .product-quantity {
    font-size: 14px;
    color: #999;
  }
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-top: 1px solid #eee;
  
  .order-time {
    font-size: 12px;
    color: #999;
  }
  
  .order-total {
    font-size: 14px;
    
    .total-price {
      font-weight: 500;
      color: #ff4d4f;
    }
  }
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #eee;
  background: #f9f9f9;
}
</style>