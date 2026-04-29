<template>
  <div class="product-detail">
    <!-- 返回栏 -->
    <div class="back-header">
      <el-button text icon="el-icon-arrow-left" @click="$router.back()">
        返回商品列表
      </el-button>
    </div>

    <div class="container">
      <!-- 左侧：详情信息 -->
      <div class="left-section">
        <h1 class="p-title">{{ product.name }}</h1>
        <p class="p-desc">{{ product.desc }}</p>

        <!-- 溯源 -->
        <div class="panel" v-if="tracing">
          <h3 class="panel-title">茶叶溯源信息</h3>
          <div class="panel-body">
            <div class="field">
              <label>产地：</label>
              <span>{{ tracing.origin }}</span>
            </div>
            <div class="field">
              <label>采摘时间：</label>
              <span>{{ tracing.harvestTime }}</span>
            </div>
            <div class="field">
              <label>茶树品种：</label>
              <span>{{ tracing.teaVariety || "未知" }}</span>
            </div>
            <div class="field">
              <label>工艺：</label>
              <span>{{ tracing.process || "未知" }}</span>
            </div>
          </div>
        </div>

        <!-- 品鉴 -->
        <div class="panel" v-if="tasting">
          <h3 class="panel-title">品鉴指南</h3>
          <div class="panel-body">
            <div class="field">
              <label>香型：</label>
              <span>{{ tasting.fragrance }}</span>
            </div>
            <div class="field">
              <label>口感：</label>
              <span>{{ tasting.taste }}</span>
            </div>
            <div class="field">
              <label>耐泡度：</label>
              <span>{{ tasting.steepResistance }} 级</span>
            </div>
          </div>
        </div>

        <!-- 冲泡 -->
        <div class="panel" v-if="brewingGuide">
          <h3 class="panel-title">冲泡建议</h3>
          <div class="panel-body">
            <div class="field">
              <label>水温：</label>
              <span>{{ brewingGuide.waterTemperature }}℃</span>
            </div>
            <div class="field">
              <label>投茶量：</label>
              <span>{{ brewingGuide.teaAmount }} 克</span>
            </div>
            <div class="field">
              <label>冲泡时间：</label>
              <span>{{ brewingGuide.brewingTime }} 秒</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：图片 + 购买区 -->
      <div class="right-section">
        <div class="sticky-card">
          <div class="p-img">
            <img
              v-if="product.imageUrl"
              :src="product.imageUrl"
              alt="茶叶图片"
            />
            <div v-else class="no-img">暂无图片</div>
          </div>

          <div class="price-info">
            <span class="price">¥{{ product.price }}</span>
          </div>

          <div class="buy-count">
            <div class="label">购买数量</div>
            <div class="count-group">
              <el-button size="small" @click="count--" :disabled="count <= 1">
                -
              </el-button>
              <span class="num">{{ count }}</span>
              <el-button size="small" @click="count++"> + </el-button>
            </div>
          </div>

          <div class="buy-buttons">
            <el-button type="primary" size="default" @click="addCart">
              加入购物车
            </el-button>
            <el-button size="default" @click="toCart"> 去购物车 </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCartStore } from '@/store/cart'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/api'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

const product = ref({})
const count = ref(1)
const tracing = ref(null)
const tasting = ref(null)
const brewingGuide = ref(null)

const isTimerRunning = ref(false)
const remainingTime = ref(0)
let timerInterval = null

const loadProductDetail = async () => {
  try {
    const id = route.params.id
    const res = await apiService.userProduct.getProductById(id)
    product.value = res.data.data || {}
  } catch (e) {
    ElMessage.error('加载失败')
  }
}

const loadTracing = async () => {
  try {
    const id = route.params.id
    const res = await apiService.userProduct.getProductTracing(id)
    tracing.value = res.data.data
  } catch (e) {}
}

const loadTasting = async () => {
  try {
    const id = route.params.id
    const res = await apiService.userProduct.getProductTasting(id)
    tasting.value = res.data.data
  } catch (e) {}
}

const loadBrewingGuide = async () => {
  try {
    const id = route.params.id
    const res = await apiService.userProduct.getProductBrewingGuide(id)
    brewingGuide.value = res.data.data
  } catch (e) {}
}

const startTimer = () => {
  if (!brewingGuide.value) return ElMessage.warning('暂无冲泡数据')
  isTimerRunning.value = true
  remainingTime.value = brewingGuide.value.brewingTime
  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (remainingTime.value > 0) remainingTime.value--
    else {
      clearInterval(timerInterval)
      isTimerRunning.value = false
      ElMessage.success('冲泡完成！')
    }
  }, 1000)
}

const addCart = () => {
  cartStore.addCart({ ...product.value, count: count.value })
  ElMessage.success('已加入购物车')
}

const toCart = () => router.push('/cart')

onMounted(async () => {
  await loadProductDetail()
  await loadTracing()
  await loadTasting()
  await loadBrewingGuide()
})

onUnmounted(() => clearInterval(timerInterval))
</script>

<style scoped lang="scss">
.product-detail {
  max-width: 1400px;
  margin: 0 auto;
  padding: 25px 20px;
}

.back-header {
  margin-bottom: 20px;
}

.container {
  display: flex;
  gap: 45px;
  position: relative;
  align-items: flex-start;
}

/* ========== 左侧 ========== */
.left-section {
  width: 64%;
}

.p-title {
  font-size: 28px;
  font-weight: bold;
  color: #222;
  margin-bottom: 10px;
}

.p-desc {
  font-size: 15px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 35px;
}

.panel {
  margin-bottom: 30px;
}

.panel-title {
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 4px solid #36ad6a;
  color: #333;
}

.panel-body {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.field {
  display: flex;
  padding: 11px 0;
  border-bottom: 1px solid #f3f3f3;
  font-size: 15px;

  label {
    width: 110px;
    font-weight: 500;
    color: #444;
  }

  span {
    color: #333;
  }
}

.timer {
  font-size: 17px;
  font-weight: bold;
  color: #ff4d4f;
  margin-left: 10px;
}

/* ========== 右侧：与溯源顶部对齐 ========== */
.right-section {
  width: 36%;
  margin-top: 72px; /* 核心：与左侧溯源对齐 */
}

.sticky-card {
  position: sticky;
  top: 30px;
  background: #ffffff;
  border-radius: 14px;
  padding: 28px;
  box-shadow: 0 3px 18px rgba(0, 0, 0, 0.08);
}

.p-img {
  width: 100%;
  height: 360px;
  background: #fafafa;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.no-img {
  color: #999;
  font-size: 15px;
}

.price-info {
  text-align: center;
  padding: 10px 0 20px;
}

.price {
  font-size: 36px;
  color: #ff4d4f;
  font-weight: bold;
}

.buy-count {
  margin-bottom: 24px;

  .label {
    font-size: 15px;
    margin-bottom: 10px;
    color: #333;
  }
}

.count-group {
  display: flex;
  align-items: center;
  gap: 10px;

  .num {
    font-size: 16px;
    min-width: 30px;
    text-align: center;
  }
}

.buy-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;

  button {
    height: 44px;
    font-size: 15px;
    font-weight: 500;
  }
}

@media (max-width: 900px) {
  .container {
    flex-direction: column;
  }
  .left-section, .right-section {
    width: 100%;
  }
  .right-section {
    margin-top: 0;
  }
}
</style>