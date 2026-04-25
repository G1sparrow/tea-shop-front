<template>
  <div class="admin-login">
    <div class="login-box">
      <h2>管理员登录</h2>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        class="form"
      >
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入管理员账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="submit-btn" @click="login" :loading="loading">
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { apiClient } from '@/api/index.js'

const router = useRouter()
const formRef = ref(null)
const loading = ref(false)

// 表单
const form = reactive({
  username: '',
  password: ''
})

// 验证规则
const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 登录
const login = async () => {
  try {
    await formRef.value.validate()
    
    loading.value = true
    
    // 调用后端API进行管理员登录
    const response = await apiClient.post('/admin/login', {
      username: form.username,
      password: form.password
    }, {
      requiresAuth: false
    })
    
    if (response.data && response.data.code === 200) {
      // 保存token
      if (response.data.data && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token)
      }
      // 保存管理员信息
      if (response.data.data && response.data.data.admin) {
        localStorage.setItem('adminInfo', JSON.stringify(response.data.data.admin))
      }
      ElMessage.success('登录成功')
      // 登录成功后跳转到管理面板
      router.push('/admin/dashboard')
    } else {
      ElMessage.error(response.data?.message || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    // 检查错误类型并给出相应提示
    if (error.response) {
      // 服务器返回了错误状态码
      ElMessage.error(error.response.data?.message || '登录失败，请检查账号密码')
    } else if (error.request) {
      // 请求已发出但没有收到响应
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      // 其他错误
      ElMessage.error('登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.admin-login {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);

  h2 {
    text-align: center;
    margin-bottom: 30px;
    color: #2d573b;
  }
}

.form {
  margin-top: 20px;
}

.submit-btn {
  width: 100%;
}
</style>