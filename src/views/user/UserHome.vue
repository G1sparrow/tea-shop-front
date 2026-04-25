<template>
  <div class="home">
    <Banner />
    <section class="tea-list">
      <div class="head">
        <h2>精选茗茶</h2>
        <div class="tabs">
          <!-- 分类标签，样式匹配你的截图 -->
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
      <div class="grid">
        <ProductCard v-for="item in filterTeas" :key="item.id" :tea="item" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Banner from '@/components/Banner.vue'
import ProductCard from '@/components/ProductCard.vue'
import { apiService } from '@/api'

// 分类标签配置（匹配截图：全部/绿茶/乌龙/红茶）
const tabs = ref([
  { key: 'all', name: '全部' },
  { key: 'GREEN_TEA', name: '绿茶' },
  { key: 'OOLONG_TEA', name: '乌龙' },
  { key: 'BLACK_TEA', name: '红茶' }
])
const activeTab = ref('all') // 默认选中全部
const teas = ref([])
const loading = ref(false)

// 按选中标签筛选茶叶
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
        size: 20
      }
    })
    teas.value = response.data.data.content || [] // 假设后端返回格式为 {data: {content: [...]}}
  } catch (error) {
    console.error('加载茶叶数据失败:', error)
    // 可以显示错误提示给用户
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
      teas.value = response.data.data || [] // 假设后端返回格式为 {data: [...]}
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
.home { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.tea-list { margin-top: 3rem; }
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }

// 标签样式完全匹配截图
.tabs { display: flex; gap: 10px; 
  button { 
    padding: 6px 18px; 
    border: none; 
    border-radius: 20px; 
    cursor: pointer; 
    background: #f5f5f5; // 未选中底色
    color: #333;
    &.active { 
      background: #2d573b; // 选中绿色（匹配你的截图）
      color: #fff; 
    }
  }
}

.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
@media (max-width:768px) { .grid { grid-template-columns: repeat(2,1fr); } }
</style>