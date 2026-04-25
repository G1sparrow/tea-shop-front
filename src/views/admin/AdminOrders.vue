<template>
  <div class="order-manage-page">
    <!-- 搜索&筛选栏 -->
    <div class="search-bar">
      <el-input 
        v-model="searchKey" 
        placeholder="请输入订单号/用户名" 
        style="width: 300px" 
        clearable 
        @keyup.enter="search"
      >
        <template #append>
          <el-button @click="search"><el-icon><Search /></el-icon>搜索</el-button>
        </template>
      </el-input>
      <el-select 
        v-model="statusFilter" 
        placeholder="请选择订单状态" 
        clearable 
        style="width: 150px; margin-left: 10px"
      >
        <el-option label="全部" value="" />
        <el-option label="待支付" value="pending" />
        <el-option label="已支付/待发货" value="paid" />
        <el-option label="已发货/待收货" value="shipped" />
        <el-option label="已完成" value="completed" />
        <el-option label="已取消" value="cancelled" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 240px; margin-left: 10px"
        @change="search"
      />
      <div style="margin-left: auto; display: flex; gap: 10px">
        <el-button type="success" @click="exportOrders">
          <el-icon><Download /></el-icon>导出订单
        </el-button>
        <el-button type="primary" @click="refreshOrders">
          <el-icon><Refresh /></el-icon>刷新数据
        </el-button>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div class="action-bar" style="margin: 10px 0">
      <el-select v-model="batchStatus" placeholder="批量修改状态" style="width: 150px">
        <el-option label="标记为待发货" value="paid" />
        <el-option label="标记为已发货" value="shipped" />
        <el-option label="标记为已完成" value="completed" />
        <el-option label="取消订单" value="cancelled" />
      </el-select>
      <el-button 
        size="small" 
        type="warning" 
        @click="batchUpdateStatus" 
        :disabled="selectedIds.length === 0 || !batchStatus"
        style="margin-left: 10px"
      >
        <el-icon><Check /></el-icon>执行
      </el-button>
      <span style="margin-left: 10px; color: #666">已选 {{ selectedIds.length }} 个订单</span>
    </div>

    <!-- 订单列表 -->
    <el-table 
      :data="filteredOrderList" 
      border 
      stripe 
      hover 
      style="width: 100%"
      @selection-change="handleSelectionChange"
      :loading="loading"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="orderNo" label="订单号" min-width="160" />
      <el-table-column prop="username" label="下单用户" width="120" />
      <el-table-column prop="phone" label="联系电话" width="130" />
      <el-table-column prop="address" label="收货地址" min-width="200" show-overflow-tooltip />
      <el-table-column prop="totalAmount" label="订单金额(¥)" width="110" />
      <el-table-column prop="payAmount" label="实付金额(¥)" width="110" />
      <el-table-column prop="status" label="订单状态" width="120">
        <template #default="scope">
          <el-tag 
            :type="getStatusTagType(scope.row.status)"
            size="small"
          >
            {{ getStatusName(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" width="180" />
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button size="small" type="primary" @click="viewOrderDetail(scope.row)">
            <el-icon><View /></el-icon>详情
          </el-button>
          <el-button 
            size="small" 
            type="success" 
            @click="updateOrderStatus(scope.row, 'shipped')"
            v-if="scope.row.status === 'paid'"
          >
            <el-icon><Ship /></el-icon>发货
          </el-button>
          <el-button 
            size="small" 
            type="danger" 
            @click="cancelOrder(scope.row.id)"
            v-if="scope.row.status === 'pending' || scope.row.status === 'paid'"
          >
            <el-icon><Delete /></el-icon>取消
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination" style="margin-top: 20px; text-align: right">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount"
      >
      </el-pagination>
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog 
      v-model="detailVisible" 
      title="订单详情" 
      width="800px" 
      destroy-on-close
    >
      <div v-if="currentOrder" class="order-detail">
        <!-- 订单基本信息 -->
        <div class="detail-header">
          <div class="header-left">
            <span class="order-no">订单号：{{ currentOrder.orderNo }}</span>
            <span class="order-status">
              状态：<el-tag :type="getStatusTagType(currentOrder.status)">{{ getStatusName(currentOrder.status) }}</el-tag>
            </span>
          </div>
          <div class="header-right">
            下单时间：{{ currentOrder.createTime }}
          </div>
        </div>

        <!-- 收货信息 -->
        <div class="detail-section" style="margin: 16px 0">
          <h4 style="margin-bottom: 8px">收货信息</h4>
          <div class="info-row">
            收件人：{{ currentOrder.username }} | 联系电话：{{ currentOrder.phone }}
          </div>
          <div class="info-row">
            收货地址：{{ currentOrder.address }}
          </div>
        </div>

        <!-- 商品清单 -->
        <div class="detail-section">
          <h4 style="margin-bottom: 8px">商品清单</h4>
          <el-table :data="currentOrder.products" border style="width: 100%">
            <el-table-column prop="name" label="商品名称" min-width="200" />
            <el-table-column prop="spec" label="规格" width="120" />
            <el-table-column prop="price" label="单价(¥)" width="100" />
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="amount" label="小计(¥)" width="100" />
          </el-table>
        </div>

        <!-- 金额信息 -->
        <div class="detail-section" style="margin-top: 16px">
          <h4 style="margin-bottom: 8px">金额信息</h4>
          <div class="amount-row">
            <span>商品总价：¥{{ currentOrder.totalAmount }}</span>
            <span>优惠金额：¥{{ currentOrder.discountAmount }}</span>
            <span>实付金额：¥{{ currentOrder.payAmount }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { 
  Search, Download, Refresh, Check, View, Ship, Delete 
} from '@element-plus/icons-vue'
import { apiClient } from '@/api/index.js'

// 订单数据
const orderList = ref([])

// 加载订单数据
const loadOrderList = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      sortBy: 'createTime',
      sortDir: 'desc'
    }
    
    // 添加搜索条件
    if (searchKey.value) {
      params.keyword = searchKey.value
    }
    
    if (statusFilter.value) {
      params.status = statusFilter.value
    }
    
    if (dateRange.value.length === 2) {
      params.startDate = dateRange.value[0]
      params.endDate = dateRange.value[1]
    }
    
    const response = await apiClient.get('/admin/orders', { params })
    if (response.data && response.data.code === 200) {
      const data = response.data.data
      if (data.content) {
        orderList.value = data.content
        totalCount.value = data.totalElements
      } else if (Array.isArray(data)) {
        orderList.value = data
        totalCount.value = data.length
      } else {
        orderList.value = []
        totalCount.value = 0
      }
    } else {
      orderList.value = []
      totalCount.value = 0
    }
  } catch (error) {
    console.error('获取订单列表失败:', error)
    ElMessage.error('获取订单列表失败')
    orderList.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

// 页面状态
const loading = ref(false)
const searchKey = ref('')
const statusFilter = ref('')
const dateRange = ref([])
const selectedIds = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const batchStatus = ref('')
const totalCount = ref(0)

// 详情弹窗
const detailVisible = ref(false)
const currentOrder = ref(null)

// 订单列表（直接使用后端返回的数据，后端已经处理了筛选和分页）
const filteredOrderList = computed(() => {
  return orderList.value
})

// 组件挂载时加载数据
onMounted(() => {
  loadOrderList()
})

// 状态名称转换
const getStatusName = (status) => {
  const map = {
    pending: '待支付',
    paid: '已支付/待发货',
    shipped: '已发货/待收货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || '未知'
}

// 状态标签类型转换
const getStatusTagType = (status) => {
  const map = {
    pending: 'info',
    paid: 'warning',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return map[status] || 'info'
}

// 搜索
const search = () => {
  currentPage.value = 1
  loadOrderList()
}

// 刷新数据
const refreshOrders = () => {
  loadOrderList()
}

// 导出订单
const exportOrders = () => {
  ElMessageBox.confirm(
    '确定要导出当前筛选条件下的所有订单吗？',
    '导出确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    loading.value = true
    try {
      const params = {}
      
      if (searchKey.value) {
        params.keyword = searchKey.value
      }
      
      if (statusFilter.value) {
        params.status = statusFilter.value
      }
      
      if (dateRange.value.length === 2) {
        params.startDate = dateRange.value[0]
        params.endDate = dateRange.value[1]
      }
      
      // 创建导出URL
      const url = new URL('/api/admin/orders/export', window.location.origin)
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
      
      // 添加token
      const token = localStorage.getItem('token')
      if (token) {
        url.searchParams.append('token', token)
      }
      
      // 打开下载链接
      window.open(url.toString(), '_blank')
      ElMessage.success('订单导出成功，文件已开始下载')
    } catch (error) {
      console.error('导出订单失败:', error)
      ElMessage.error('导出订单失败')
    } finally {
      loading.value = false
    }
  })
}

// 表格选择事件
const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id)
}

// 分页事件
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadOrderList()
}
const handleCurrentChange = (val) => {
  currentPage.value = val
  loadOrderList()
}

// 查看订单详情
const viewOrderDetail = (row) => {
  currentOrder.value = { ...row }
  detailVisible.value = true
}

// 单个修改订单状态
const updateOrderStatus = (row, newStatus) => {
  const statusName = getStatusName(newStatus)
  ElMessageBox.confirm(
    `确定要将订单【${row.orderNo}】标记为${statusName}吗？`,
    '状态修改',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await apiClient.put(`/admin/orders/${row.id}/status`, {}, {
        params: { status: newStatus }
      })
      if (response.data && response.data.code === 200) {
        ElMessage.success(`订单已标记为${statusName}`)
        // 重新加载订单列表
        loadOrderList()
      } else {
        ElMessage.error('修改订单状态失败')
      }
    } catch (error) {
      console.error('修改订单状态失败:', error)
      ElMessage.error('修改订单状态失败')
    }
  })
}

// 取消订单
const cancelOrder = (id) => {
  const order = orderList.value.find(item => item.id === id)
  ElMessageBox.confirm(
    `确定要取消订单【${order.orderNo}】吗？`,
    '取消订单',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'danger'
    }
  ).then(async () => {
    try {
      const response = await apiClient.put(`/admin/orders/${id}/status`, {}, {
        params: { status: 'cancelled' }
      })
      if (response.data && response.data.code === 200) {
        ElMessage.success('订单已取消')
        // 重新加载订单列表
        loadOrderList()
      } else {
        ElMessage.error('取消订单失败')
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      ElMessage.error('取消订单失败')
    }
  })
}

// 批量修改订单状态
const batchUpdateStatus = () => {
  const statusName = getStatusName(batchStatus.value)
  ElMessageBox.confirm(
    `确定要将选中的 ${selectedIds.value.length} 个订单批量标记为${statusName}吗？`,
    '批量修改状态',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 批量更新每个订单的状态
      const promises = selectedIds.value.map(id => 
        apiClient.put(`/admin/orders/${id}/status`, {}, {
          params: { status: batchStatus.value }
        })
      )
      
      await Promise.all(promises)
      ElMessage.success(`已成功将 ${selectedIds.value.length} 个订单标记为${statusName}`)
      selectedIds.value = []
      batchStatus.value = ''
      // 重新加载订单列表
      loadOrderList()
    } catch (error) {
      console.error('批量修改订单状态失败:', error)
      ElMessage.error('批量修改订单状态失败')
    }
  })
}
</script>

<style scoped lang="scss">
.order-manage-page {
  .search-bar {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    flex-wrap: wrap;
    gap: 10px;
  }

  .action-bar {
    display: flex;
    align-items: center;
  }

  .order-detail {
    .detail-header {
      display: flex;
      justify-content: space-between;
      padding-bottom: 12px;
      border-bottom: 1px solid #eee;
      margin-bottom: 8px;

      .order-no {
        font-weight: bold;
        margin-right: 20px;
      }
    }

    .detail-section {
      padding: 8px 0;
    }

    .info-row {
      line-height: 1.8;
      color: #666;
    }

    .amount-row {
      display: flex;
      justify-content: flex-end;
      gap: 20px;
      color: #333;
      
      span:last-child {
        font-weight: bold;
        color: #f56c6c;
      }
    }
  }
}
</style>