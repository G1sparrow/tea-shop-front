<template>
  <div class="order-confirm">
    <div class="container">
      <h2>确认订单</h2>

      <!-- 地址区域 -->
      <div class="address-box">
        <h3>收货地址</h3>
        <div class="address-item" v-if="address">
          <p class="name">{{ address.name }} {{ address.phone }}</p>
          <p class="detail">{{ address.address }}</p>
        </div>
        <div v-else class="no-address">
          <el-button type="primary" size="small" @click="$router.push('/user')">
            去添加收货地址
          </el-button>
        </div>
      </div>

      <!-- 商品区域 -->
      <div class="goods-box">
        <h3>商品清单</h3>
        <div class="item" v-for="item in cartList" :key="item.id">
          <div class="img"></div>
          <div class="info">
            <p class="name">{{ item.name }}</p>
            <p class="desc">{{ item.desc }}</p>
          </div>
          <div class="price">¥{{ item.price }}</div>
          <div class="count">x{{ item.count }}</div>
          <div class="total">¥{{ item.price * item.count }}</div>
        </div>
      </div>

      <!-- 价格信息 -->
      <div class="price-info">
        <div>
          <span>商品总价</span>
          <span>¥{{ totalPrice }}</span>
        </div>
        <div>
          <span>运费</span>
          <span>¥{{ freight }}</span>
        </div>
        <div class="real-price">
          <span>实付款</span>
          <span>¥{{ totalPrice + freight }}</span>
        </div>
      </div>

      <!-- 提交订单 -->
      <div class="submit-box">
        <el-button
          type="primary"
          size="default"
          @click="submitOrder"
          :disabled="!address || cartList.length === 0"
        >
          提交订单（共 ¥{{ totalPrice + freight }} 元）
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/store/cart'
import { computed, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const router = useRouter()

// 选中的购物车商品
const cartList = computed(() => cartStore.list.filter(i => i.checked))
// 总价
const totalPrice = computed(() =>
  cartList.value.reduce((sum, i) => sum + i.price * i.count, 0)
)
// 运费
const freight = ref(8)

// 模拟地址
const address = ref({
  name: '张三',
  phone: '13800138000',
  address: '浙江省杭州市西湖区茶语路88号'
})

// 提交订单
const submitOrder = () => {
  ElMessage.success('订单提交成功！前往支付')
  // 清空已结算商品
  cartStore.list = cartStore.list.filter(i => !i.checked)
  router.push('/pay')
}
</script>

<style scoped lang="scss">
.order-confirm {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.container {
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px #00000008;
}
h2 {
  margin-bottom: 1.5rem;
}
h3 {
  font-size: 16px;
  margin-bottom: 1rem;
}

.address-box,
.goods-box {
  margin-bottom: 2rem;
}
.address-item {
  border: 1px solid #eee;
  padding: 1rem;
  border-radius: 8px;
  p {
    margin: 0 0 6px;
  }
}
.no-address {
  padding: 1rem;
  text-align: center;
  color: #999;
  border: 1px dashed #eee;
  border-radius: 8px;
}

.item {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
  .img {
    width: 50px;
    height: 50px;
    background: #e8f1e8;
    border-radius: 6px;
    margin-right: 12px;
  }
  .info {
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
  .price,
  .count,
  .total {
    width: 80px;
    text-align: center;
  }
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
  margin: 2rem 0;
  font-size: 14px;
  div {
    width: 200px;
    display: flex;
    justify-content: space-between;
  }
  .real-price {
    font-size: 18px;
    font-weight: bold;
    color: #d93026;
    margin-top: 0.5rem;
  }
}

.submit-box {
  text-align: right;
  :deep(.el-button) {
    width: 260px;
    height: 46px;
    background: #2d573b;
    border: none;
    font-size: 16px;
  }
}
</style>