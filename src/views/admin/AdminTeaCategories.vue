<template>
  <div class="tea-category-manage-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input 
        v-model="searchKey" 
        placeholder="请输入种类名称" 
        style="width: 300px" 
        clearable 
        @keyup.enter="search"
      >
        <template #append>
          <el-button @click="search"><el-icon><Search /></el-icon>搜索</el-button>
        </template>
      </el-input>
      <el-button type="primary" @click="openAddDialog" style="margin-left: auto">
        <el-icon><Plus /></el-icon>新增种类
      </el-button>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar" style="margin: 10px 0">
      <el-button size="small" type="warning" @click="batchDelete" :disabled="selectedIds.length === 0">
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
      <span style="margin-left: 10px; color: #666">已选 {{ selectedIds.length }} 项</span>
    </div>

    <!-- 种类列表 -->
    <el-table 
      :data="filteredCategoryList" 
      border 
      stripe 
      hover 
      style="width: 100%"
      @selection-change="handleSelectionChange"
      :loading="loading"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="种类名称" min-width="150" />
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column label="创建时间" width="150">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="150">
        <template #default="scope">
          {{ formatDate(scope.row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" type="primary" @click="openEditDialog(scope.row)">
            <el-icon><Edit /></el-icon>编辑
          </el-button>
          <!-- <el-button size="small" type="info" @click="openDetailDialog(scope.row)">
            <el-icon><View /></el-icon>详情
          </el-button> -->
          <el-button size="small" type="danger" @click="deleteCategory(scope.row.id)">
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination" style="margin-top: 20px; text-align: right">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[5, 10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCategoryCount"
      >
      </el-pagination>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑种类' : '新增种类'" width="600px" destroy-on-close>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="种类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入种类名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="form.description" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入种类描述" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">
          <el-icon><Check /></el-icon>确认提交
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" :title="selectedCategory.name + ' - 详情'" width="600px" destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ selectedCategory.id }}</el-descriptions-item>
        <el-descriptions-item label="种类名称">{{ selectedCategory.name }}</el-descriptions-item>
        <el-descriptions-item label="描述">{{ selectedCategory.description || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(selectedCategory.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ formatDate(selectedCategory.updateTime) }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ElDescriptions, ElDescriptionsItem } from 'element-plus/es/components/descriptions/index'
import { Search, Plus, Delete, Edit, Check, View } from '@element-plus/icons-vue'
import { apiClient } from '@/api/index.js'

// 种类数据
const categoryList = ref([])
const loading = ref(false) // 加载状态

// 获取种类列表
const fetchCategoryList = async () => {
  try {
    loading.value = true
    const response = await apiClient.get('/admin/categories')
    
    if (response.data && response.data.code === 200) {
      categoryList.value = response.data.data || []
      totalCategoryCount.value = categoryList.value.length
    } else {
      categoryList.value = []
      totalCategoryCount.value = 0
    }
  } catch (error) {
    console.error('获取种类列表失败:', error)
    ElMessage.error('获取种类列表失败')
    categoryList.value = []
    totalCategoryCount.value = 0
  } finally {
    loading.value = false
  }
}

// 初始化加载数据
fetchCategoryList()

// 搜索和筛选
const searchKey = ref('')
const selectedIds = ref([]) // 选中的种类ID
const currentPage = ref(1) // 当前页
const pageSize = ref(10) // 每页条数

// 筛选后的种类列表
const filteredCategoryList = computed(() => {
  let list = [...categoryList.value]
  // 关键词搜索
  if (searchKey.value) {
    list = list.filter(item => 
      item.name.toLowerCase().includes(searchKey.value.toLowerCase()) || 
      item.id.toString().includes(searchKey.value)
    )
  }
  // 分页处理
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return list.slice(start, end)
})

// 总种类数量（用于分页）
const totalCategoryCount = ref(0)

// 搜索
const search = async () => {
  currentPage.value = 1 // 搜索后重置页码
  await fetchCategoryList() // 重新获取数据
}

// 处理表格选择
const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id)
}

// 分页事件
const handleSizeChange = async (val) => {
  pageSize.value = val
  currentPage.value = 1
  // 不需要重新获取数据，只需更新分页
}
const handleCurrentChange = async (val) => {
  currentPage.value = val
  // 不需要重新获取数据，只需更新分页
}

// 弹窗相关
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const selectedCategory = ref({})

// 表单数据
const form = reactive({
  id: '',
  name: '',
  description: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入种类名称', trigger: 'blur' }]
}

// 新增种类
const openAddDialog = () => {
  isEdit.value = false
  // 重置表单
  Object.assign(form, { 
    id: '', 
    name: '', 
    description: ''
  })
  dialogVisible.value = true
}

// 编辑种类
const openEditDialog = (row) => {
  isEdit.value = true
  // 赋值
  Object.assign(form, { 
    id: row.id,
    name: row.name,
    description: row.description
  })
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()
    
    const categoryData = {
      ...form
    }
    
    let response
    if (isEdit.value) {
      // 编辑
      response = await apiClient.put(`/admin/categories/${form.id}`, categoryData)
    } else {
      // 新增
      response = await apiClient.post('/admin/categories', categoryData)
    }
    
    if (response.data && response.data.code === 200) {
      ElMessage.success(isEdit.value ? '种类编辑成功' : '种类新增成功')
      // 重新获取数据
      await fetchCategoryList()
      dialogVisible.value = false
    } else {
      ElMessage.error(isEdit.value ? '编辑种类失败' : '新增种类失败')
    }
  } catch (error) {
    console.error(isEdit.value ? '编辑种类失败:' : '新增种类失败:', error)
    ElMessage.error('请完善表单信息')
  }
}

// 单个删除
const deleteCategory = async (id) => {
  ElMessageBox.confirm('确定要删除该茶叶种类吗？删除后可能影响相关商品，请谨慎操作！', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await apiClient.delete(`/admin/categories/${id}`)
      if (response.data && response.data.code === 200) {
        ElMessage.success('删除成功')
        // 重新获取数据
        await fetchCategoryList()
      } else {
        ElMessage.error('删除种类失败')
      }
    } catch (error) {
      console.error('删除种类失败:', error)
      ElMessage.error('删除种类失败')
    }
  })
}

// 批量删除
const batchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的种类')
    return
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个茶叶种类吗？删除后可能影响相关商品，请谨慎操作！`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 这里可以实现批量删除，但为了安全起见，我们逐个删除
    for (const id of selectedIds.value) {
      try {
        await apiClient.delete(`/admin/categories/${id}`)
      } catch (error) {
        console.error('删除种类失败:', error)
      }
    }
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    // 重新获取数据
    await fetchCategoryList()
  })
}

// 打开详情弹窗
const openDetailDialog = (row) => {
  selectedCategory.value = row
  detailDialogVisible.value = true
}

// 格式化日期函数
const formatDate = (dateString) => {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? '—' : date.toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.tea-category-manage-page {
  .search-bar {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .action-bar {
    display: flex;
    align-items: center;
  }
}
</style>