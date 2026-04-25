<template>
  <div class="pay-page">
    <div class="pay-box">
      <h2>订单支付</h2>
      <div class="price">¥{{ price }}</div>
      <el-button type="primary" @click="paySuccess">确认支付</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const price = ref(0)

// 模拟获取订单价格
setTimeout(() => {
  price.value = 136
}, 100)

const paySuccess = () => {
  ElMessage.success('支付成功！')
  router.push('/user')
}
</script>

<style scoped lang="scss">
.pay-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}
.pay-box {
  background: #fff;
  padding: 3rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 20px #0000000a;
}
.price {
  font-size: 28px;
  font-weight: bold;
  color: #d93026;
  margin: 1rem 0 2rem;
}
</style>