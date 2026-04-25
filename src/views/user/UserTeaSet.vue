<template>
  <div class="tea-set-page">
    <!-- 页面标题 + 分类筛选 -->
    <div class="page-header">
      <h2>茶器茶具</h2>
      <div class="tabs">
        <button 
          v-for="t in tabs" 
          :key="t.key" 
          :class="{ active: activeTab === t.key }" 
          @click="activeTab = t.key"
        >
          {{ t.name }}
        </button>
      </div>
    </div>

    <!-- 茶器列表 -->
    <div class="set-grid">
      <div 
        class="set-card" 
        v-for="item in filterSets" 
        :key="item.id"
        @click="toDetail(item.id)"
      >
        <div class="card-img"></div>
        <div class="card-info">
          <h3>{{ item.name }}</h3>
          <p class="desc">{{ item.desc }}</p>
          <div class="price">¥{{ item.price }}</div>
        </div>
      </div>
    </div>

    <!-- 空数据提示 -->
    <div v-if="filterSets.length === 0" class="empty">
      暂无该分类的茶器~
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 茶器分类标签
const tabs = ref([
  { key: 'all', name: '全部' },
  { key: 'set', name: '茶具套装' },
  { key: 'pot', name: '茶壶' },
  { key: 'cup', name: '茶杯' },
  { key: 'tray', name: '茶盘' }
])
const activeTab = ref('all') // 默认选中全部

// 茶器数据
const teaSets = ref([
  // 茶具套装
  { id:1, name:'实木功夫茶具套装', desc:'一壶四杯 + 茶盘 + 公道杯', price:298, category:'set' },
  { id:2, name:'紫砂茶具礼盒装', desc:'原矿紫砂 + 手工雕刻 + 礼盒', price:598, category:'set' },
  { id:3, name:'陶瓷茶具套装', desc:'青瓷釉面 + 隔热防烫', price:198, category:'set' },
  
  // 茶壶
  { id:4, name:'宜兴紫砂壶', desc:'原矿紫泥 + 手工制作', price:398, category:'pot' },
  { id:5, name:'玻璃泡茶壶', desc:'高硼硅玻璃 + 过滤内胆', price:89, category:'pot' },
  { id:6, name:'汝窑开片茶壶', desc:'可养开片 + 出水流畅', price:258, category:'pot' },
  
  // 茶杯
  { id:7, name:'品茗杯套装', desc:'6只装 + 陶瓷釉彩', price:68, category:'cup' },
  { id:8, name:'紫砂主人杯', desc:'单个装 + 手工捏制', price:98, category:'cup' },
  { id:9, name:'玻璃小茶杯', desc:'耐热防烫 + 透明可视', price:39, category:'cup' },
  
  // 茶盘
  { id:10, name:'实木茶盘', desc:'排水式 + 鸡翅木材质', price:188, category:'tray' },
  { id:11, name:'竹制茶盘', desc:'轻便易收纳 + 防滑设计', price:79, category:'tray' },
  { id:12, name:'电木茶盘', desc:'耐用不变形 + 高端质感', price:498, category:'tray' },
])

// 按分类筛选茶器
const filterSets = computed(() => {
  if (activeTab.value === 'all') return teaSets.value
  return teaSets.value.filter(item => item.category === activeTab.value)
})

// 跳详情页（预留，可后续扩展茶器详情）
const toDetail = (id) => {
  ElMessage.info(`查看【${teaSets.value.find(i => i.id === id).name}】详情`)
  // 后续可扩展：router.push(`/set-detail/${id}`)
}
</script>

<style scoped lang="scss">
.tea-set-page {
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

  // 筛选标签（和茶叶页统一风格）
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

// 茶器网格布局（和茶叶页一致）
.set-grid {
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

// 茶器卡片（风格匹配茶叶卡片）
.set-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px #0001;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }

  .card-img {
    width: 100%;
    height: 180px;
    background: #f0f5f0; // 茶器图片占位色（贴合主题）
    border-radius: 16px 16px 0 0;
  }

  .card-info {
    padding: 1rem;

    h3 {
      font-size: 16px;
      margin-bottom: 6px;
      color: #333;
    }

    .desc {
      font-size: 13px;
      color: #999;
      margin-bottom: 10px;
      line-height: 1.4;
    }

    .price {
      font-size: 16px;
      color: #333;
      font-weight: bold;
    }
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