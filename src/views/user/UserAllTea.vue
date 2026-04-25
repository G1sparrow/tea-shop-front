<template>
  <div class="all-tea-page">
    <!-- 页面标题 + 分类筛选 -->
    <div class="page-header">
      <h2>所有茶叶</h2>
      <div class="tabs">
        <button 
          v-for="t in tabs" 
          :key="t.key" 
          :class="{ active: activeTab === t.key }" 
          @click="onTabChange(t.key)"
        >
          {{ t.name }}
        </button>
      </div>
    </div>

    <!-- 茶叶列表 -->
    <div class="tea-grid">
      <ProductCard 
        v-for="item in filterTeas" 
        :key="item.id" 
        :tea="item" 
      />
    </div>

    <!-- 空数据提示 -->
    <div v-if="filterTeas.length === 0" class="empty">
      暂无该分类的茶叶~
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import { apiService } from '@/api'

// 分类标签配置
const tabs = ref([
  { key: 'all', name: '全部' },
  { key: 'GREEN_TEA', name: '绿茶' },
  { key: 'OOLONG_TEA', name: '乌龙' },
  { key: 'BLACK_TEA', name: '红茶' }
])
const activeTab = ref('all') // 默认选中全部
const teas = ref([])
const loading = ref(false)

// 按分类筛选茶叶
const filterTeas = computed(() => {
  if (activeTab.value === 'all') return teas.value
  return teas.value.filter(item => item.category === activeTab.value)
})

// 加载茶叶数据
const loadTeas = async () => {
  try {
    loading.value = true
    const response = await apiService.userProduct.getAllProducts({
      params: {
        page: 0,
        size: 50
      }
    })
    teas.value = response.data.data.content || []
  } catch (error) {
    console.error('加载茶叶数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 当分类切换时加载对应分类的产品
const loadTeasByCategory = async (category) => {
  try {
    loading.value = true
    if (category === 'all') {
      await loadTeas()
    } else {
      const response = await apiService.userProduct.getProductsByCategory(category)
      teas.value = response.data.data || []
    }
  } catch (error) {
    console.error('加载茶叶数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听分类变化
const onTabChange = async (tabKey) => {
  activeTab.value = tabKey
  await loadTeasByCategory(tabKey)
}

onMounted(async () => {
  await loadTeas()
})
</script>

<style scoped lang="scss">
.all-tea-page {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

// 页面头部（标题+筛选）
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  h2 {
    font-size: 20px;
    color: #333;
  }

  // 筛选标签样式（和首页统一）
  .tabs {
    display: flex;
    gap: 10px;

    button {
      padding: 6px 18px;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      background: #f5f5f5;
      color: #333;

      &.active {
        background: #2d573b;
        color: #fff;
      }
    }
  }
}

// 茶叶网格布局（4列，响应式）
.tea-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

// 空数据提示
.empty {
  text-align: center;
  padding: 3rem 0;
  color: #999;
  font-size: 14px;
}
</style>