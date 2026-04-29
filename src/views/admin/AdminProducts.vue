<template>
  <div class="product-manage-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKey"
        placeholder="请输入商品名称/ID"
        style="width: 300px"
        clearable
        @keyup.enter="search"
      >
        <template #append>
          <el-button @click="search">
            <el-icon><Search /></el-icon>搜索
          </el-button>
        </template>
      </el-input>

      <el-select
        v-model="categoryFilter"
        placeholder="请选择分类"
        clearable
        style="width: 150px; margin-left: 10px"
        @change="handleCategoryChange"
      >
        <el-option label="全部" value="" />
        <el-option label="绿茶" value="GREEN_TEA" />
        <el-option label="乌龙茶" value="OOLONG_TEA" />
        <el-option label="红茶" value="BLACK_TEA" />
        <el-option label="白茶" value="WHITE_TEA" />
        <el-option label="普洱茶" value="PUERH_TEA" />
        <el-option label="茶具" value="TEA_SET" />
      </el-select>

      <el-button type="primary" style="margin-left: auto" @click="openAddDialog">
        <el-icon><Plus /></el-icon>新增商品
      </el-button>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar" style="margin: 10px 0">
      <el-button
        size="small"
        type="warning"
        :disabled="selectedIds.length === 0"
        @click="batchDelete"
      >
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
      <span style="margin-left: 10px; color: #666">已选 {{ selectedIds.length }} 项</span>
    </div>

    <!-- 商品列表 -->
    <el-table
      :data="productList"
      border
      stripe
      hover
      :loading="loading"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="商品名称" min-width="180" />
      <el-table-column
        prop="description"
        label="商品描述"
        min-width="250"
        show-overflow-tooltip
      />
      <el-table-column prop="price" label="价格(¥)" width="100" />
      <el-table-column prop="category" label="分类" width="100">
        <template #default="scope">
          <el-tag size="small">{{ getCategoryName(scope.row.category) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            class="status-switch"  
            active-text="上架"
            inactive-text="下架"
            active-color="#67c23a"
            inactive-color="#f56c6c"
            @change="changeStatus(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="260">
        <template #default="scope">
          <el-button size="small" type="primary" @click="openEditDialog(scope.row)">
            <el-icon><Edit /></el-icon>编辑
          </el-button>
          <el-button size="small" type="info" @click="openDetailDialog(scope.row)">
            <el-icon><View /></el-icon>详情
          </el-button>
          <el-button size="small" type="danger" @click="deleteProduct(scope.row.id)">
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination" style="margin-top: 20px; text-align: right">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[5,10,20,50]"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '新增商品'" width="700px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品价格" prop="price">
              <el-input v-model.number="form.price" type="number" placeholder="请输入价格">
                <template #prefix>¥</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品分类" prop="category">
              <el-select v-model="form.category" placeholder="请选择分类">
                <el-option label="绿茶" value="GREEN_TEA" />
                <el-option label="乌龙茶" value="OOLONG_TEA" />
                <el-option label="红茶" value="BLACK_TEA" />
                <el-option label="白茶" value="WHITE_TEA" />
                <el-option label="普洱茶" value="PUERH_TEA" />
                <el-option label="茶具" value="TEA_SET" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input v-model.number="form.stock" type="number" placeholder="库存数量" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="商品状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="true">上架</el-radio>
            <el-radio value="false">下架</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="商品图片">
          <el-upload
            class="avatar-uploader"
            :action="`${apiBaseUrl}/api/admin/upload/image`"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.imageUrl" :src="form.imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="商品描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入描述" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认提交</el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗（简略，保证不报错） -->
    <el-dialog v-model="detailDialogVisible" title="商品详情" width="800px">
      <div>详情功能已预留</div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete, Edit, View } from '@element-plus/icons-vue'
import { apiClient } from '@/api/index.js'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

// 列表
const productList = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索
const searchKey = ref('')
const categoryFilter = ref('')
const selectedIds = ref([])

// 弹窗
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const selectedProduct = ref({})

// 表单
const form = reactive({
  name: '',
  price: 0,
  category: '',
  status: true,
  stock: 0,
  imageUrl: '',
  description: ''
})

// 上传头
const uploadHeaders = {
  Authorization: 'Bearer ' + localStorage.getItem('token') || ''
}

// 规则
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, type: 'number', min: 0.01, message: '请输入合法价格', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  stock: [{ required: true, type: 'number', min: 0, message: '请输入库存', trigger: 'blur' }],
  description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
}

// 分类映射
const getCategoryName = (k) => {
  const m = {
    GREEN_TEA: '绿茶',
    OOLONG_TEA: '乌龙茶',
    BLACK_TEA: '红茶',
    WHITE_TEA: '白茶',
    PUERH_TEA: '普洱茶',
    TEA_SET: '茶具'
  }
  return m[k] || k
}

// ====================== 核心：加载商品列表（调用后端API）======================
const fetchList = async () => {
  try {
    loading.value = true
    const res = await apiClient.get('/admin/products', {
      params: {
        page: currentPage.value - 1,
        size: pageSize.value
      }
    })
    if (res.data.code === 200) {
      productList.value = res.data.data.content
      total.value = res.data.data.totalElements
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const search = () => {
  fetchList()
}
const handleCategoryChange = () => {
  fetchList()
}

// 选择
const handleSelectionChange = (val) => {
  selectedIds.value = val.map(v => v.id)
}

// 新增
const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, { name: '', price: 0, category: '', status: true, stock: 0, imageUrl: '', description: '' })
  dialogVisible.value = true
}

// 编辑
const openEditDialog = (row) => {
  isEdit.value = true
  Object.assign(form, row)
  dialogVisible.value = true
}

// 提交
const submitForm = async () => {
  await formRef.value.validate()
  try {
    if (isEdit.value) {
      await apiClient.put(`/admin/products/${form.id}`, form)
      ElMessage.success('编辑成功')
    } else {
      await apiClient.post('/admin/products', form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (e) {
    ElMessage.error('提交失败')
  }
}

// 删除
const deleteProduct = async (id) => {
  await ElMessageBox.confirm('确认删除？')
  await apiClient.delete(`/admin/products/${id}`)
  ElMessage.success('删除成功')
  fetchList()
}

// 批量删除
const batchDelete = async () => {
  await ElMessageBox.confirm('确认删除选中？')
  await apiClient.delete('/admin/products/batch', { data: selectedIds.value })
  ElMessage.success('批量删除成功')
  fetchList()
}

// 状态切换
const changeStatus = async (row) => {
  await apiClient.put(`/admin/products/${row.id}/status`, {}, { params: { status: row.status } })
  ElMessage.success('状态已更新')
}

// 详情
const openDetailDialog = (row) => {
  selectedProduct.value = row
  detailDialogVisible.value = true
}

// 上传成功
const handleAvatarSuccess = (res) => {
  if (res.code === 200) form.imageUrl = res.data
}
const beforeAvatarUpload = (file) => {
  const isImg = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isImg) ElMessage.error('只能上传图片')
  if (!isLt10M) ElMessage.error('不能超过10MB')
  return isImg && isLt10M
}

// 初始化加载
onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
.product-manage-page {
  .search-bar {
    display: flex;
    align-items: center;
    background: #fff;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 10px;
  }
  .action-bar {
    display: flex;
    align-items: center;
  }
}
.avatar-uploader .el-upload {
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
}
.avatar {
  width: 178px;
  height: 178px;
  object-fit: cover;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// 状态开关美化
:deep(.status-switch) {
  // 美化文字
  .el-switch__label {
    font-size: 10px !important;         // 这里控制文字大小（可改为 8px、9px 等）
    font-weight: 500;       // 轻微加粗
  }
}
</style>
