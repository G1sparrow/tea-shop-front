<template>
  <div class="tea-set-manage-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKey"
        placeholder="请输入茶器名称/ID"
        style="width: 300px"
        clearable
        @keyup.enter="search"
      >
        <template #append>
          <el-button @click="search"><el-icon><Search /></el-icon>搜索</el-button>
        </template>
      </el-input>
      <el-select
        v-model="categoryFilter"
        placeholder="请选择分类"
        clearable
        style="width: 150px; margin-left: 10px"
      >
        <el-option label="全部" value="" />
        <el-option label="茶具套装" value="set" />
        <el-option label="茶壶" value="pot" />
        <el-option label="茶杯" value="cup" />
        <el-option label="茶盘" value="tray" />
      </el-select>
      <el-button type="primary" @click="openAddDialog" style="margin-left: auto">
        <el-icon><Plus /></el-icon>新增茶器
      </el-button>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar" style="margin: 10px 0">
      <el-button
        size="small"
        type="warning"
        @click="batchDelete"
        :disabled="selectedIds.length === 0"
      >
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
      <span style="margin-left: 10px; color: #666">已选 {{ selectedIds.length }} 项</span>
    </div>

    <!-- 茶器列表 -->
    <el-table
      :data="filteredTeaSetList"
      border
      stripe
      hover
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="茶器名称" min-width="180" />
      <el-table-column prop="description" label="茶器描述" min-width="250" show-overflow-tooltip />
      <el-table-column prop="price" label="价格(¥)" width="100" />
      <el-table-column prop="material" label="材质" width="100" />
      <el-table-column prop="category" label="分类" width="100">
        <template #default="scope">
          <el-tag size="small">{{ getCategoryName(scope.row.category) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            active-text="上架"
            inactive-text="下架"
            active-color="#67c23a"
            inactive-color="#f56c6c"
            @change="changeStatus(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" type="primary" @click="openEditDialog(scope.row)">
            <el-icon><Edit /></el-icon>编辑
          </el-button>
          <el-button size="small" type="danger" @click="deleteTeaSet(scope.row.id)">
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
        :total="totalCount"
      >
      </el-pagination>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑茶器' : '新增茶器'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="left"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="茶器名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入茶器名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="茶器价格" prop="price">
              <el-input v-model="form.price" type="number" placeholder="请输入茶器价格" prefix="¥" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="茶器分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择茶器分类">
                <el-option label="茶具套装" value="set" />
                <el-option label="茶壶" value="pot" />
                <el-option label="茶杯" value="cup" />
                <el-option label="茶盘" value="tray" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="茶器材质" prop="material">
              <el-input v-model="form.material" placeholder="请输入茶器材质（如：紫砂/陶瓷/玻璃）" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="茶器描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入茶器描述" />
        </el-form-item>
        <el-form-item label="茶器状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="true">上架</el-radio>
            <el-radio :label="false">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">
          <el-icon><Check /></el-icon>确认提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete, Edit, Check } from '@element-plus/icons-vue'
import { apiClient } from '@/api/index.js'

const teaSetList = ref([])
const loading = ref(false)

const loadTeaSetList = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      sortBy: 'id',
      sortDir: 'asc'
    }

    if (searchKey.value) {
      params.keyword = searchKey.value
    }

    if (categoryFilter.value) {
      params.category = categoryFilter.value
    }

    const response = await apiClient.get('/admin/tea-sets', { params })
    if (response.data && response.data.code === 200) {
      const data = response.data.data
      if (data.content) {
        teaSetList.value = data.content
        totalCount.value = data.totalElements
      } else if (Array.isArray(data)) {
        teaSetList.value = data
        totalCount.value = data.length
      } else {
        teaSetList.value = []
        totalCount.value = 0
      }
    } else {
      teaSetList.value = []
      totalCount.value = 0
    }
  } catch (error) {
    console.error('获取茶器列表失败:', error)
    ElMessage.error('获取茶器列表失败')
    teaSetList.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTeaSetList()
})

const searchKey = ref('')
const categoryFilter = ref('')
const selectedIds = ref([])
const currentPage = ref(1)
const pageSize = ref(5)
const totalCount = ref(0)

const filteredTeaSetList = computed(() => {
  return teaSetList.value
})

const getCategoryName = (key) => {
  const map = {
    set: '茶具套装',
    pot: '茶壶',
    cup: '茶杯',
    tray: '茶盘'
  }
  return map[key] || '未知'
}

const search = () => {
  currentPage.value = 1
  loadTeaSetList()
}

const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id)
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  loadTeaSetList()
}
const handleCurrentChange = (val) => {
  currentPage.value = val
  loadTeaSetList()
}

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const form = reactive({
  id: '',
  name: '',
  description: '',
  price: '',
  material: '',
  category: '',
  status: true
})

const rules = {
  name: [{ required: true, message: '请输入茶器名称', trigger: 'blur' }],
  price: [{
    required: true,
    message: '请输入茶器价格',
    trigger: 'blur',
    type: 'number',
    min: 0.01
  }],
  category: [{ required: true, message: '请选择茶器分类', trigger: 'change' }],
  material: [{ required: true, message: '请输入茶器材质', trigger: 'blur' }],
  description: [{ required: true, message: '请输入茶器描述', trigger: 'blur' }]
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, {
    id: '', name: '', description: '', price: '',
    material: '', category: '', status: true
  })
  dialogVisible.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const submitForm = async () => {
  try {
    await formRef.value.validate()

    const teaSetData = {
      ...form,
      price: Number(form.price)
    }

    if (isEdit.value) {
      try {
        const response = await apiClient.put(`/admin/tea-sets/${form.id}`, teaSetData)
        if (response.data && response.data.code === 200) {
          ElMessage.success('茶器编辑成功')
          loadTeaSetList()
        } else {
          ElMessage.error('编辑茶器失败')
        }
      } catch (error) {
        console.error('编辑茶器失败:', error)
        ElMessage.error('编辑茶器失败')
      }
    } else {
      try {
        const response = await apiClient.post('/admin/tea-sets', teaSetData)
        if (response.data && response.data.code === 200) {
          ElMessage.success('茶器新增成功')
          loadTeaSetList()
        } else {
          ElMessage.error('新增茶器失败')
        }
      } catch (error) {
        console.error('新增茶器失败:', error)
        ElMessage.error('新增茶器失败')
      }
    }

    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('请完善表单信息后提交')
  }
}

const deleteTeaSet = (id) => {
  ElMessageBox.confirm(
    '确定要删除该茶器吗？删除后不可恢复',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await apiClient.delete(`/admin/tea-sets/${id}`)
      if (response.data && response.data.code === 200) {
        ElMessage.success('茶器删除成功')
        loadTeaSetList()
      } else {
        ElMessage.error('删除茶器失败')
      }
    } catch (error) {
      console.error('删除茶器失败:', error)
      ElMessage.error('删除茶器失败')
    }
  })
}

const batchDelete = () => {
  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedIds.value.length} 个茶器吗？删除后不可恢复`,
    '批量删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await apiClient.delete('/admin/tea-sets/batch', {
        data: selectedIds.value
      })
      if (response.data && response.data.code === 200) {
        ElMessage.success('批量删除成功')
        selectedIds.value = []
        loadTeaSetList()
      } else {
        ElMessage.error('批量删除茶器失败')
      }
    } catch (error) {
      console.error('批量删除茶器失败:', error)
      ElMessage.error('批量删除茶器失败')
    }
  })
}

const changeStatus = async (row) => {
  try {
    const response = await apiClient.put(`/admin/tea-sets/${row.id}/status`, {}, {
      params: { status: row.status }
    })
    if (response.data && response.data.code === 200) {
      ElMessage.success(`茶器${row.status ? '上架' : '下架'}成功`)
    } else {
      ElMessage.error('更新茶器状态失败')
      row.status = !row.status
    }
  } catch (error) {
    console.error('更新茶器状态失败:', error)
    ElMessage.error('更新茶器状态失败')
    row.status = !row.status
  }
}
</script>

<style scoped lang="scss">
.tea-set-manage-page {
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