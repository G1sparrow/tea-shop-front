<template>
  <div class="product-manage-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input v-model="searchKey" placeholder="请输入商品名称/ID" style="width: 300px" clearable @keyup.enter="search">
        <template #append>
          <el-button @click="search"><el-icon><Search /></el-icon>搜索</el-button>
        </template>
      </el-input>
      <el-select v-model="categoryFilter" placeholder="请选择分类" clearable style="width: 150px; margin-left: 10px" @change="handleCategoryChange">
        <el-option label="全部" value="" />
        <el-option label="绿茶" value="green" />
        <el-option label="乌龙茶" value="oolong" />
        <el-option label="红茶" value="black" />
      </el-select>
      <el-button type="primary" @click="openAddDialog" style="margin-left: auto"><el-icon><Plus /></el-icon>新增商品</el-button>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar" style="margin: 10px 0">
      <el-button size="small" type="warning" @click="batchDelete" :disabled="selectedIds.length === 0">
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
      <span style="margin-left: 10px; color: #666">已选 {{ selectedIds.length }} 项</span>
    </div>

    <!-- 商品列表 -->
    <el-table 
      :data="filteredProductList" 
      border 
      stripe 
      hover 
      style="width: 100%"
      @selection-change="handleSelectionChange"
      :loading="loading"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="商品名称" min-width="180" />
      <el-table-column prop="description" label="商品描述" min-width="250" show-overflow-tooltip />
      <el-table-column prop="price" label="价格(¥)" width="100" />
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
      <el-table-column label="操作" width="240">
        <template #default="scope">
          <el-button size="small" type="primary" @click="openEditDialog(scope.row)"><el-icon><Edit /></el-icon>编辑</el-button>
          <el-button size="small" type="info" @click="openDetailDialog(scope.row)"><el-icon><View /></el-icon>详情</el-button>
          <el-button size="small" type="danger" @click="deleteProduct(scope.row.id)"><el-icon><Delete /></el-icon>删除</el-button>
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
        :total="totalProductCount"
      >
      </el-pagination>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '新增商品'" width="600px" destroy-on-close>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        label-position="left"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品价格" prop="price">
              <el-input v-model="form.price" type="number" placeholder="请输入商品价格" prefix="¥" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="商品分类" prop="category">
          <el-select v-model="form.category" placeholder="请选择商品分类">
            <el-option label="绿茶" value="green" />
            <el-option label="乌龙茶" value="oolong" />
            <el-option label="红茶" value="black" />
          </el-select>
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="商品状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="true">上架</el-radio>
            <el-radio :label="false">下架</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm"><el-icon><Check /></el-icon>确认提交</el-button>
      </template>
    </el-dialog>

    <!-- 商品详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" :title="selectedProduct.name + ' - 详情管理'" width="800px" destroy-on-close>
      <el-tabs type="border-card">
        <!-- 溯源信息 -->
        <el-tab-pane label="溯源信息">
          <el-form
            ref="tracingFormRef"
            :model="tracingForm"
            label-width="100px"
            label-position="left"
          >
            <el-form-item label="产地" prop="origin">
              <el-input v-model="tracingForm.origin" placeholder="请输入产地" />
            </el-form-item>
            <el-form-item label="采摘时间" prop="harvestTime">
              <el-date-picker
                v-model="tracingForm.harvestTime"
                type="date"
                placeholder="请选择采摘时间"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="茶树品种" prop="teaVariety">
              <el-input v-model="tracingForm.teaVariety" placeholder="请输入茶树品种" />
            </el-form-item>
            <el-form-item label="工艺" prop="process">
              <el-input v-model="tracingForm.process" type="textarea" :rows="3" placeholder="请输入工艺描述" />
            </el-form-item>
            <el-form-item label="质检报告" prop="qualityReport">
              <el-input v-model="tracingForm.qualityReport" placeholder="请输入质检报告URL" />
            </el-form-item>
            <el-form-item label="茶园实拍" prop="茶园Images">
              <el-input v-model="tracingForm.茶园Images" type="textarea" :rows="2" placeholder="请输入茶园实拍图片URL（多个用逗号分隔）" />
            </el-form-item>
            <el-form-item label="生长视频" prop="growthVideo">
              <el-input v-model="tracingForm.growthVideo" placeholder="请输入生长周期短视频URL" />
            </el-form-item>
            <el-form-item label="溯源二维码" prop="qrCode">
              <el-input v-model="tracingForm.qrCode" placeholder="请输入溯源二维码URL" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 品鉴信息 -->
        <el-tab-pane label="品鉴信息">
          <el-form
            ref="tastingFormRef"
            :model="tastingForm"
            label-width="100px"
            label-position="left"
          >
            <el-form-item label="香型" prop="fragrance">
              <el-input v-model="tastingForm.fragrance" placeholder="请输入香型" />
            </el-form-item>
            <el-form-item label="口感" prop="taste">
              <el-input v-model="tastingForm.taste" type="textarea" :rows="3" placeholder="请输入口感描述" />
            </el-form-item>
            <el-form-item label="耐泡度" prop="steepResistance">
              <el-slider v-model="tastingForm.steepResistance" :min="1" :max="10" show-input />
            </el-form-item>
            <el-form-item label="适合茶具" prop="suitableTeaSet">
              <el-input v-model="tastingForm.suitableTeaSet" placeholder="请输入适合茶具" />
            </el-form-item>
            <el-form-item label="冲泡建议" prop="brewingSuggestion">
              <el-input v-model="tastingForm.brewingSuggestion" type="textarea" :rows="3" placeholder="请输入冲泡建议" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 冲泡指南 -->
        <el-tab-pane label="冲泡指南">
          <el-form
            ref="brewingFormRef"
            :model="brewingForm"
            label-width="100px"
            label-position="left"
          >
            <el-form-item label="水温(℃)" prop="waterTemperature">
              <el-input v-model="brewingForm.waterTemperature" type="number" placeholder="请输入水温" />
            </el-form-item>
            <el-form-item label="投茶量(克)" prop="teaAmount">
              <el-input v-model="brewingForm.teaAmount" type="number" placeholder="请输入投茶量" step="0.1" />
            </el-form-item>
            <el-form-item label="冲泡时间(秒)" prop="brewingTime">
              <el-input v-model="brewingForm.brewingTime" type="number" placeholder="请输入冲泡时间" />
            </el-form-item>
            <el-form-item label="冲泡次数" prop="brewingTimes">
              <el-input v-model="brewingForm.brewingTimes" type="number" placeholder="请输入冲泡次数" />
            </el-form-item>
            <el-form-item label="茶具推荐" prop="teaSetRecommendation">
              <el-input v-model="brewingForm.teaSetRecommendation" placeholder="请输入茶具推荐" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="detailDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDetails"><el-icon><Check /></el-icon>保存详情</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Delete, Edit, Check, View } from '@element-plus/icons-vue'
import { apiClient } from '@/api/index.js'

// 商品数据
const productList = ref([])
const loading = ref(false) // 加载状态

// 获取商品列表
const fetchProductList = async () => {
  try {
    loading.value = true
    let response
    
    // 根据条件选择不同的API
    if (searchKey.value) {
      // 搜索商品
      const params = {
        keyword: searchKey.value,
        page: currentPage.value - 1, // 后端从0开始
        size: pageSize.value,
        sortBy: 'id',
        sortDir: 'asc'
      }
      response = await apiClient.get('/admin/products/search', { params })
    } else if (categoryFilter.value) {
      // 按分类获取商品
      response = await apiClient.get(`/admin/products/category/${categoryFilter.value}`)
    } else {
      // 获取所有商品
      const params = {
        page: currentPage.value - 1, // 后端从0开始
        size: pageSize.value,
        sortBy: 'id',
        sortDir: 'asc'
      }
      response = await apiClient.get('/admin/products', { params })
    }
    
    if (response.data && response.data.code === 200) {
      const data = response.data.data
      // 后端返回的是分页数据，需要从data.content中获取商品列表
      if (data.content) {
        productList.value = data.content
        // 更新总商品数量
        if (data.totalElements) {
          totalProductCount.value = data.totalElements
        }
      } else if (Array.isArray(data)) {
        // 兼容旧格式（非分页数据）
        productList.value = data
        totalProductCount.value = data.length
      } else {
        productList.value = []
        totalProductCount.value = 0
      }
    } else {
      productList.value = []
      totalProductCount.value = 0
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error('获取商品列表失败')
    productList.value = []
    totalProductCount.value = 0
  } finally {
    loading.value = false
  }
}

// 初始化加载数据
fetchProductList()

// 搜索和筛选
const searchKey = ref('')
const categoryFilter = ref('')
const selectedIds = ref([]) // 选中的商品ID
const currentPage = ref(1) // 当前页
const pageSize = ref(5) // 每页条数

// 筛选后的商品列表
const filteredProductList = computed(() => {
  let list = [...productList.value]
  // 关键词搜索
  if (searchKey.value) {
    list = list.filter(item => 
      item.name.includes(searchKey.value) || item.id.toString().includes(searchKey.value)
    )
  }
  // 分类筛选
  if (categoryFilter.value) {
    list = list.filter(item => {
      // 处理后端返回的枚举值，转换为前端使用的字符串
      const categoryValue = item.category?.toLowerCase() || ''
      return categoryValue.includes(categoryFilter.value)
    })
  }
  // 分页处理
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return list.slice(start, end)
})

// 总商品数量（用于分页）
const totalProductCount = ref(0)

// 分类名称转换
const getCategoryName = (key) => {
  const map = { green: '绿茶', oolong: '乌龙茶', black: '红茶' }
  return map[key] || '未知'
}

// 搜索
const search = async () => {
  currentPage.value = 1 // 搜索后重置页码
  await fetchProductList() // 重新获取数据
}

// 分类筛选变化
const handleCategoryChange = async () => {
  currentPage.value = 1 // 筛选后重置页码
  await fetchProductList() // 重新获取数据
}

// 处理表格选择
const handleSelectionChange = (val) => {
  selectedIds.value = val.map(item => item.id)
}

// 分页事件
const handleSizeChange = async (val) => {
  pageSize.value = val
  currentPage.value = 1
  await fetchProductList() // 重新获取数据
}
const handleCurrentChange = async (val) => {
  currentPage.value = val
  await fetchProductList() // 重新获取数据
}

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

// 详情弹窗相关
const detailDialogVisible = ref(false)
const selectedProduct = ref({})
const tracingFormRef = ref(null)
const tastingFormRef = ref(null)
const brewingFormRef = ref(null)

// 表单数据
const form = reactive({
  id: '',
  name: '',
  description: '',
  price: '',
  category: '',
  status: true
})

// 溯源信息表单
const tracingForm = reactive({
  origin: '',
  harvestTime: '',
  teaVariety: '',
  process: '',
  qualityReport: '',
  茶园Images: '',
  growthVideo: '',
  qrCode: ''
})

// 品鉴信息表单
const tastingForm = reactive({
  fragrance: '',
  taste: '',
  steepResistance: 5,
  suitableTeaSet: '',
  brewingSuggestion: ''
})

// 冲泡指南表单
const brewingForm = reactive({
  waterTemperature: '',
  teaAmount: '',
  brewingTime: '',
  brewingTimes: '',
  teaSetRecommendation: ''
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur', type: 'number', min: 0.01 }],
  category: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  description: [{ required: true, message: '请输入商品描述', trigger: 'blur' }]
}

// 新增商品
const openAddDialog = () => {
  isEdit.value = false
  // 重置表单
  Object.assign(form, { id: '', name: '', description: '', price: '', category: '', status: true })
  dialogVisible.value = true
}

// 编辑商品
const openEditDialog = (row) => {
  isEdit.value = true
  // 赋值
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  try {
    await formRef.value.validate()
    
    // 将价格转换为数字
    const productData = {
      ...form,
      price: Number(form.price)
    }
    
    if (isEdit.value) {
      // 编辑
      try {
        const response = await apiClient.put(`/admin/products/${form.id}`, productData)
        if (response.data && response.data.code === 200) {
          ElMessage.success('商品编辑成功')
        } else {
          ElMessage.error('编辑商品失败')
          return
        }
      } catch (error) {
        console.error('编辑商品失败:', error)
        ElMessage.error('编辑商品失败')
        return
      }
    } else {
      // 新增
      try {
        const response = await apiClient.post('/admin/products', productData)
        if (response.data && response.data.code === 200) {
          ElMessage.success('商品新增成功')
        } else {
          ElMessage.error('新增商品失败')
          return
        }
      } catch (error) {
        console.error('新增商品失败:', error)
        ElMessage.error('新增商品失败')
        return
      }
    }
    
    // 重新获取数据
    await fetchProductList()
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('请完善表单信息')
  }
}

// 单个删除
const deleteProduct = async (id) => {
  ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await apiClient.delete(`/admin/products/${id}`)
      if (response.data && response.data.code === 200) {
        ElMessage.success('删除成功')
        // 重新获取数据
        await fetchProductList()
      } else {
        ElMessage.error('删除商品失败')
      }
    } catch (error) {
      console.error('删除商品失败:', error)
      ElMessage.error('删除商品失败')
    }
  })
}

// 批量删除
const batchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的商品')
    return
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个商品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await apiClient.delete('/admin/products/batch', {
        data: selectedIds.value
      })
      if (response.data && response.data.code === 200) {
        ElMessage.success('批量删除成功')
        selectedIds.value = []
        // 重新获取数据
        await fetchProductList()
      } else {
        ElMessage.error('批量删除商品失败')
      }
    } catch (error) {
      console.error('批量删除商品失败:', error)
      ElMessage.error('批量删除商品失败')
    }
  })
}

// 修改商品状态
const changeStatus = async (row) => {
  try {
    const response = await apiClient.put(`/admin/products/${row.id}/status`, {}, {
      params: { status: row.status }
    })
    if (response.data && response.data.code === 200) {
      ElMessage.success(`商品${row.status ? '上架' : '下架'}成功`)
    } else {
      ElMessage.error('更新商品状态失败')
      // 恢复原状态
      row.status = !row.status
    }
  } catch (error) {
    console.error('更新商品状态失败:', error)
    ElMessage.error('更新商品状态失败')
    // 恢复原状态
    row.status = !row.status
  }
}

// 打开详情弹窗
const openDetailDialog = async (row) => {
  selectedProduct.value = row
  // 重置表单
  Object.assign(tracingForm, { 
    origin: '',
    harvestTime: '',
    teaVariety: '',
    process: '',
    qualityReport: '',
    茶园Images: '',
    growthVideo: '',
    qrCode: ''
  })
  Object.assign(tastingForm, { 
    fragrance: '',
    taste: '',
    steepResistance: 5,
    suitableTeaSet: '',
    brewingSuggestion: ''
  })
  Object.assign(brewingForm, { 
    waterTemperature: '',
    teaAmount: '',
    brewingTime: '',
    brewingTimes: '',
    teaSetRecommendation: ''
  })
  
  // 获取详细信息
  try {
    // 获取溯源信息
    try {
      const tracingRes = await apiClient.get(`/user/products/${row.id}/tracing`)
      if (tracingRes.data && tracingRes.data.code === 200 && tracingRes.data.data) {
        Object.assign(tracingForm, tracingRes.data.data)
      }
    } catch (error) {
      console.info('暂无溯源信息:', error.message)
    }
    
    // 获取品鉴信息
    try {
      const tastingRes = await apiClient.get(`/user/products/${row.id}/tasting`)
      if (tastingRes.data && tastingRes.data.code === 200 && tastingRes.data.data) {
        Object.assign(tastingForm, tastingRes.data.data)
      }
    } catch (error) {
      console.info('暂无品鉴信息:', error.message)
    }
    
    // 获取冲泡指南
    try {
      const brewingRes = await apiClient.get(`/user/products/${row.id}/brewing-guide`)
      if (brewingRes.data && brewingRes.data.code === 200 && brewingRes.data.data) {
        Object.assign(brewingForm, brewingRes.data.data)
      }
    } catch (error) {
      console.info('暂无冲泡指南:', error.message)
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
    ElMessage.error('获取商品详情失败')
  }
  
  detailDialogVisible.value = true
}

// 保存详情
const saveDetails = async () => {
  try {
    // 保存溯源信息
    try {
      const tracingRes = await apiClient.post(`/admin/products/${selectedProduct.value.id}/tracing`, tracingForm)
      if (tracingRes.data && tracingRes.data.code === 200) {
        ElMessage.success('溯源信息保存成功')
      } else {
        ElMessage.error('保存溯源信息失败')
      }
    } catch (error) {
      console.error('保存溯源信息失败:', error)
      ElMessage.error('保存溯源信息失败')
    }
    
    // 保存品鉴信息
    try {
      const tastingRes = await apiClient.post(`/admin/products/${selectedProduct.value.id}/tasting`, tastingForm)
      if (tastingRes.data && tastingRes.data.code === 200) {
        ElMessage.success('品鉴信息保存成功')
      } else {
        ElMessage.error('保存品鉴信息失败')
      }
    } catch (error) {
      console.error('保存品鉴信息失败:', error)
      ElMessage.error('保存品鉴信息失败')
    }
    
    // 保存冲泡指南
    try {
      const brewingRes = await apiClient.post(`/admin/products/${selectedProduct.value.id}/brewing-guide`, brewingForm)
      if (brewingRes.data && brewingRes.data.code === 200) {
        ElMessage.success('冲泡指南保存成功')
      } else {
        ElMessage.error('保存冲泡指南失败')
      }
    } catch (error) {
      console.error('保存冲泡指南失败:', error)
      ElMessage.error('保存冲泡指南失败')
    }
    
    detailDialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败，请稍后重试')
  }
}
</script>

<style scoped lang="scss">
.product-manage-page {
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