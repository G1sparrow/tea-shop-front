<template>
  <div class="dashboard-page">
    <!-- 数据概览卡片 -->
    <div class="stats-card-group">
      <div class="stats-card">
        <div class="card-header">
          <span class="card-title">商品总数</span>
          <el-icon class="card-icon"><Goods /></el-icon>
        </div>
        <div class="card-value">{{ productCount }}</div>
        <div class="card-trend">
          <span class="trend-up">↑ 12%</span> 较上月
        </div>
      </div>
      <div class="stats-card">
        <div class="card-header">
          <span class="card-title">订单总数</span>
          <el-icon class="card-icon"><ShoppingCart /></el-icon>
        </div>
        <div class="card-value">{{ orderCount }}</div>
        <div class="card-trend">
          <span class="trend-up">↑ 8%</span> 较上月
        </div>
      </div>

      <div class="stats-card">
        <div class="card-header">
          <span class="card-title">今日销售额</span>
          <el-icon class="card-icon"><Money /></el-icon>
        </div>
        <div class="card-value">¥{{ todaySales }}</div>
        <div class="card-trend">
          <span class="trend-down">↓ 5%</span> 较昨日
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-group">
      <div class="chart-card">
        <div class="chart-header">
          <span>近7日订单趋势</span>
          <el-select v-model="chartType" size="small" style="width: 100px">
            <el-option label="订单数" value="order" />
            <el-option label="销售额" value="sales" />
          </el-select>
        </div>
        <div class="chart-content" id="orderChart"></div>
      </div>
      <div class="chart-card">
        <div class="chart-header">
          <span>商品分类占比</span>
        </div>
        <div class="chart-content" id="categoryChart"></div>
      </div>
    </div>

    <!-- 最近订单列表 -->
    <div class="recent-orders-card">
      <div class="card-header">
        <span class="card-title">最近订单</span>
        <el-button size="small" type="primary" @click="$router.push('/admin/orders')">查看全部</el-button>
      </div>
      <el-table 
        :data="formattedRecentOrders" 
        border 
        stripe 
        hover 
        style="width: 100%"
        :loading="loading"
      >
        <el-table-column prop="id" label="订单ID" width="100" />
        <el-table-column prop="username" label="下单用户" width="120" />
        <el-table-column prop="amount" label="订单金额" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="scope.row.status === '已支付' ? 'success' : (scope.row.status === '待发货' ? 'warning' : 'info')"
              size="small"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="下单时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button size="small" type="text">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { Goods, ShoppingCart, User, Money } from '@element-plus/icons-vue'
// 引入ECharts（需先安装：npm install echarts）
import * as echarts from 'echarts'

import { getDashboardStats, getRecentOrders } from '@/api/index.js'

// 统计数据
const productCount = ref(0)
const orderCount = ref(0)
const todaySales = ref(0)
const chartType = ref('order')

const recentOrderList = ref([])
const loading = ref(true)

// 格式化最近订单数据
const formattedRecentOrders = computed(() => {
  return recentOrderList.value.map(order => {
    return {
      ...order,
      amount: order.amount ? `¥${order.amount.toFixed(2)}` : '¥0.00',
      status: order.status ? order.status.replace('_', ' ') : '未知',
      time: order.time ? order.time.substring(0, 19) : ''
    }
  })
})

// 获取仪表板统计数据
const loadDashboardData = async () => {
  try {
    loading.value = true
    // 获取统计数据
    const statsRes = await getDashboardStats()
    if (statsRes.data && statsRes.data.code === 200) {
      productCount.value = statsRes.data.data?.productCount || 0
      orderCount.value = statsRes.data.data?.orderCount || 0
      todaySales.value = statsRes.data.data?.todaySales || 0
    } else {
      // 设置默认值，以防API不可用
      productCount.value = 0
      orderCount.value = 0
      todaySales.value = 0
    }
    
    // 获取最近订单
    const ordersRes = await getRecentOrders({ limit: 5 })
    if (ordersRes.data && ordersRes.data.code === 200) {
      recentOrderList.value = ordersRes.data.data || []
    } else {
      // 设置默认值，以防API不可用
      recentOrderList.value = []
    }
  } catch (error) {
    console.error('获取仪表板数据失败:', error)
    // 发生错误时也设置默认值
    productCount.value = 0
    orderCount.value = 0
    todaySales.value = 0
    recentOrderList.value = []
  } finally {
    loading.value = false
  }
}

// 订单趋势图表
const initOrderChart = () => {
  const chartDom = document.getElementById('orderChart')
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['4/12', '4/13', '4/14', '4/15', '4/16', '4/17', '4/18']
    },
    yAxis: { type: 'value' },
    series: [{
      name: chartType.value === 'order' ? '订单数' : '销售额',
      type: 'line',
      smooth: true,
      data: chartType.value === 'order' ? [12, 15, 10, 18, 20, 16, 19] : [2500, 3200, 1800, 4500, 5200, 3800, 4800],
      itemStyle: { color: '#2d573b' },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#2d573b88' }, { offset: 1, color: '#2d573b22' }]) }
    }]
  }
  myChart.setOption(option)
  // 自适应窗口大小
  window.addEventListener('resize', () => myChart.resize())
}

// 分类占比图表
const initCategoryChart = () => {
  const chartDom = document.getElementById('categoryChart')
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: { trigger: 'item' },
    legend: { top: '0%', left: 'center' },
    series: [{
      name: '商品分类',
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 8, name: '绿茶' },
        { value: 6, name: '乌龙茶' },
        { value: 5, name: '红茶' },
        { value: 5, name: '茶具套装' }
      ],
      itemStyle: {
        color: (params) => {
          const colorList = ['#2d573b', '#4a7a58', '#669978', '#82b898']
          return colorList[params.dataIndex]
        }
      }
    }]
  }
  myChart.setOption(option)
  window.addEventListener('resize', () => myChart.resize())
}

// 监听图表类型切换
watch(chartType, () => {
  initOrderChart()
})

// 初始化图表
onMounted(() => {
  loadDashboardData() // 加载仪表板数据
  nextTick(() => {
    initOrderChart()
    initCategoryChart()
  })
})
</script>

<style scoped lang="scss">
.dashboard-page {
  .stats-card-group {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;

    .stats-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .card-title {
          font-size: 14px;
          color: #666;
        }

        .card-icon {
          font-size: 18px;
          color: #2d573b;
        }
      }

      .card-value {
        font-size: 28px;
        font-weight: bold;
        color: #333;
        margin-bottom: 8px;
      }

      .card-trend {
        font-size: 12px;
        color: #999;

        .trend-up {
          color: #67c23a;
        }

        .trend-down {
          color: #f56c6c;
        }
      }
    }
  }

  .chart-group {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 20px;
    margin-bottom: 20px;

    .chart-card {
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);

      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        font-weight: 500;
      }

      .chart-content {
        width: 100%;
        height: 300px;
      }
    }
  }

  .recent-orders-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .card-title {
        font-weight: 500;
        font-size: 16px;
      }
    }
  }
}
</style>