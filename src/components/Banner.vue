<template>
  <div class="banner">
    <div class="text">
      <h1>一盏清茶<br>半日清欢</h1>
      <p>原产地直供 · 手工甄选 · 顺丰包邮</p>
      <el-button type="primary">探索新茶</el-button>
    </div>
  </div>
</template>
<style scoped lang="scss">
.banner {
  background: var(--banner); border-radius: 16px;
  display: flex; justify-content: space-between; align-items: center;
  padding: 3rem; margin: 1rem auto; max-width: 1200px;
  h1 { font-size: 2.4rem; line-height: 1.3; margin-bottom: 1rem; }
  p { color: #666; margin-bottom: 1.5rem; }
  .text { flex: 1; }
  .cup { width: 120px; height: 120px; background: var(--primary); opacity: 0.7; border-radius: 10px; }
  :deep(.el-button) { background: var(--primary); border: none; }
}
</style>