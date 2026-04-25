<template>
  <!-- 点击卡片跳转详情页 -->
  <div class="card" @click="goToDetail">
    <div class="img">
      <img v-if="tea.imageUrl" :src="tea.imageUrl" :alt="tea.name" />
      <div v-else class="placeholder-img">暂无图片</div>
    </div>
    <div class="info">
      <h3>{{ tea.name }}</h3>
      <p class="desc">{{ tea.description || tea.desc }}</p>
      <div class="bottom">
        <span class="price">¥{{ tea.price }}</span>
        <!-- 加入购物车按钮：圆形加号 -->
        <div class="add-cart-btn" @click.stop="add">
          <span class="plus">+</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/store/cart'
import { useRouter } from 'vue-router'

const props = defineProps({ tea: Object })
const cartStore = useCartStore()
const router = useRouter()

const goToDetail = () => {
  if (props.tea && props.tea.id) {
    router.push(`/product/${props.tea.id}`)
  } else {
    console.error('茶叶信息不完整，无法跳转到详情页:', props.tea)
  }
}

const add = () => cartStore.addCart(props.tea)
</script>

<style scoped lang="scss">
.card {
  background: #fff; 
  border-radius: 16px; 
  overflow: hidden; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  cursor: pointer; /* 卡片加鼠标手势 */
  
  .img { 
    height: 160px; 
    background: #e8f1e8; /* 参考图浅绿背景 */
    display: flex;
    align-items: center;
    justify-content: center;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .placeholder-img {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #999;
      font-size: 14px;
    }
  }
  
  .info { 
    padding: 1rem; 
    h3 { 
      margin-bottom: 6px; 
      font-size: 16px;
      color: #333;
    } 
    p.desc { 
      color: #999; 
      font-size: 13px; 
      margin-bottom: 10px;
    } 
  }
  
  .bottom { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    
    .price { 
      font-size: 16px; 
      font-weight: 600; 
      color: #333;
    }
    
    /* 核心：圆形加号按钮（匹配参考图） */
    .add-cart-btn {
      width: 28px;
      height: 28px;
      border: 1px solid #ddd; /* 浅灰色边框 */
      border-radius: 50%; /* 圆形 */
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: #fff; /* 白色背景 */
      
      .plus {
        font-size: 14px;
        color: #666; /* 灰色加号 */
        line-height: 1; /* 垂直居中 */
      }
      
      /* 鼠标悬浮效果（可选） */
      &:hover {
        border-color: #2d573b;
        .plus {
          color: #2d573b;
        }
      }
    }
  }
}
</style>