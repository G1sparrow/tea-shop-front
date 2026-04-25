import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus' // 引入提示组件

export const useCartStore = defineStore('cart', {
  state: () => ({
    list: []
  }),
  actions: {
    addCart(item) {
      const has = this.list.find(i => i.id === item.id)
      if (has) {
        has.count += item.count || 1
      } else {
        this.list.push({
          ...item,
          count: item.count || 1,
          checked: true
        })
      }
      // 友好提示
      ElMessage.success(`已将【${item.name}】加入购物车`)
    }
  }
})