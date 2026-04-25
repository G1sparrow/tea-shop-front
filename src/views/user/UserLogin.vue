<template>
  <div class="login-page">
    <div class="login-box">
      <!-- 标题切换 -->
      <div class="tab-title">
        <span
          :class="{ active: isLogin }"
          @click="isLogin = true"
        >
          登录
        </span>
        <span
          :class="{ active: !isLogin }"
          @click="isLogin = false"
        >
          注册
        </span>
      </div>

      <!-- 登录表单 -->
      <el-form
        v-if="isLogin"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        class="form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            @click="handleLogin"
            :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 注册表单 -->
      <el-form
        v-else
        ref="regFormRef"
        :model="regForm"
        :rules="regRules"
        label-width="0"
        class="form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="regForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="phone">
          <el-input
            v-model="regForm.phone"
            placeholder="请输入手机号"
            prefix-icon="Phone"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="regForm.password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            clearable
            @input="updatePasswordStrength(regForm.password)"
          />
          <div v-if="regForm.password" class="password-strength">
            <span :class="['strength', passwordStrength]">{{ passwordStrength }}</span>
          </div>
        </el-form-item>

        <el-form-item prop="confirmPwd">
          <el-input
            v-model="regForm.confirmPwd"
            placeholder="请确认密码"
            prefix-icon="Lock"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="submit-btn"
            @click="handleRegister"
            :loading="loading"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { apiService } from '@/api'

const router = useRouter()
const isLogin = ref(true) // 切换登录/注册
const loading = ref(false)

// 登录表单
const loginFormRef = ref(null)
const loginForm = reactive({
  username: '',
  password: ''
})
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 注册表单
const regFormRef = ref(null)
const regForm = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPwd: ''
})
// 密码强度状态
const passwordStrength = ref('') // 空、弱、中、强

// 监听密码输入，更新密码强度
const updatePasswordStrength = (value) => {
  if (!value) {
    passwordStrength.value = ''
    return
  }
  if (value.length < 6) {
    passwordStrength.value = '弱'
  } else if (value.length < 10) {
    passwordStrength.value = '中'
  } else {
    passwordStrength.value = '强'
  }
}

const regRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      validator: (rule, value, cb) => {
        const phoneRegex = /^1[3-9]\d{9}$/
        if (!phoneRegex.test(value)) {
          cb(new Error('请输入正确的手机号格式'))
        } else {
          cb()
        }
      },
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' },
    {
      validator: (rule, value, cb) => {
        // 密码强度检查
        updatePasswordStrength(value)
        cb()
      },
      trigger: 'blur'
    }
  ],
  confirmPwd: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, cb) => {
        if (value !== regForm.password) {
          cb(new Error('两次密码不一致'))
        } else {
          cb()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 登录
const handleLogin = async () => {
  await loginFormRef.value.validate()
  loading.value = true
  try {
    const response = await apiService.user.login(loginForm)
    const loginData = response.data.data  // ApiResponse.data = LoginResponse
    
    // 存储用户信息到localStorage
    localStorage.setItem('userId', loginData.user.id)
    localStorage.setItem('username', loginData.user.username)
    
    // token已经在apiService.user.login中自动保存
    
    ElMessage.success('登录成功！')
    loading.value = false
    
    // 跳转到用户中心或首页
    router.push('/user')
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error(error.response?.data?.message || '登录失败')
    loading.value = false
  }
}

// 注册
const handleRegister = async () => {
  await regFormRef.value.validate()
  loading.value = true
  try {
    const registerData = {
      username: regForm.username,
      phone: regForm.phone,
      password: regForm.password
    }
    
    const response = await apiService.user.register(registerData)
    const userData = response.data.data
    
    ElMessage.success('注册成功！请登录')
    loading.value = false
    isLogin.value = true // 切换到登录界面
  } catch (error) {
    console.error('注册失败:', error)
    ElMessage.error(error.response?.data?.message || '注册失败')
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: calc(100vh - 180px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: #faf9f6;
  padding: 1rem;
}

.login-box {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.tab-title {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2rem;
  font-size: 18px;
  font-weight: 500;

  span {
    cursor: pointer;
    color: #999;
    position: relative;

    &.active {
      color: #2d573b;
      font-weight: bold;

      &::after {
        content: "";
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 26px;
        height: 3px;
        background: #2d573b;
        border-radius: 3px;
      }
    }
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.submit-btn {
  width: 100%;
  height: 44px;
  background: #2d573b;
  border: none;
  font-size: 16px;
  margin-top: 0.5rem;
}

.password-strength {
  margin-top: 6px;
  font-size: 12px;
  
  .strength {
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 500;
    
    &.弱 {
      background: #f8d7da;
      color: #721c24;
    }
    
    &.中 {
      background: #fff3cd;
      color: #856404;
    }
    
    &.强 {
      background: #d4edda;
      color: #155724;
    }
  }
}
</style>