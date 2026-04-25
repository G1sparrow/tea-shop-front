<template>
  <div class="cart-page">
    <div class="cart-container">
      <!-- 空购物车 -->
      <div v-if="cartStore.list.length === 0" class="empty">
        <p>购物车还是空的哦~</p>
        <el-button type="primary" @click="$router.push('/')">
          去选茶叶
        </el-button>
      </div>

      <!-- 有商品 -->
      <div v-else>
        <!-- 商品列表 -->
        <div class="cart-item" v-for="item in cartStore.list" :key="item.id">
          <el-checkbox v-model="item.checked" />
          <div class="item-img"></div>
          <div class="item-info">
            <p class="name">{{ item.name }}</p>
            <p class="desc">{{ item.desc }}</p>
          </div>
          <div class="item-price">¥{{ item.price }}</div>
          <div class="item-num">
            <el-button size="small" @click="item.count--" :disabled="item.count <= 1">
              -
            </el-button>
            <span>{{ item.count }}</span>
            <el-button size="small" @click="item.count++">
              +
            </el-button>
          </div>
          <div class="item-total">¥{{ item.price * item.count }}</div>
          <el-button text type="danger" @click="del(item)">删除</el-button>
        </div>

        <!-- 底部结算栏 -->
        <div class="cart-bottom">
          <el-checkbox v-model="checkAll" @change="handleCheckAll">
            全选
          </el-checkbox>
          <div class="total-info">
            已选：{{ totalCount }} 件
            <span class="total-price">
              合计：¥{{ totalPrice }}
            </span>
          </div>
          <el-button type="primary" @click="submitOrder">
            去结算
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/store/cart'
import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const router = useRouter()

// 全选
const checkAll = computed({
  get() {
    return cartStore.list.every(i => i.checked)
  },
  set(val) {
    cartStore.list.forEach(i => (i.checked = val))
  }
})

// 总数量
const totalCount = computed(() => {
  return cartStore.list
    .filter(i => i.checked)
    .reduce((sum, i) => sum + i.count, 0)
})

// 总价格
const totalPrice = computed(() => {
  return cartStore.list
    .filter(i => i.checked)
    .reduce((sum, i) => sum + i.price * i.count, 0)
})

// 删除
const del = async (item) => {
  await ElMessageBox.confirm('确定删除？', '提示')
  cartStore.list = cartStore.list.filter(i => i.id !== item.id)
  ElMessage.success('删除成功')
}

// 提交订单
const submitOrder = () => {
  if (totalCount.value === 0) {
    ElMessage.warning('请选择商品')
    return
  }
  ElMessage.success('/order')
}
</script>

<style scoped lang="scss">
.cart-page {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.cart-container {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px #0001;
}

.empty {
  text-align: center;
  padding: 3rem 0;
  color: #666;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
}

.item-img {
  width: 60px;
  height: 60px;
  background: #e8f1e8;
  border-radius: 8px;
}

.item-info {
  flex: 1;
}

.name {
  font-weight: 500;
  margin-bottom: 4px;
}

.desc {
  font-size: 12px;
  color: #999;
}

.item-price,
.item-total {
  width: 80px;
  text-align: center;
}

.item-num {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.total-info {
  display: flex;
  gap: 1rem;
}

.total-price {
  color: #d93026;
  font-weight: bold;
}
</style>