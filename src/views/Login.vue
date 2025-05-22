<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>智健孪生</h1>
        <h2>数据管理系统</h2>
        <p>管理员登录</p>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            :loading="loading"
            type="primary"
            class="login-button"
            @click="handleLogin"
          >
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loginForm = ref({
  username: '',
  password: ''
})
const loading = ref(false)
const loginFormRef = ref(null)

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true
    if (loginForm.value.username === 'admin' && loginForm.value.password ===  '1234567'){
      localStorage.setItem('token', 'admin-token')
      ElMessage.success('登录成功')
      router.push('/')
      loading.value = false
    }else {
      ElMessage.error("账号或密码错误")
      loading.value = false
    }
    // 模拟登录请求
    setTimeout(() => {

    }, 1000)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3)),
              url('@/assets/login-bg.png') no-repeat center center;
  background-size: cover;
  overflow: hidden;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: rgba(248, 241, 241, 0.9); /* 改为半透明白色 */
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1d1d1f;
  font-weight: 500;
}

.login-header p {
  margin: 10px 0 0;
  font-size: 16px;
  color: #86868b;
}

.login-form {
  margin-top: 20px;
}

:deep(.el-input__wrapper) {
  background-color: #f5f5f7 !important;
  box-shadow: none !important;
  height: 40px;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #d9d9d9 inset !important;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset !important;
}

:deep(.el-input__inner) {
  height: 40px;
  line-height: 40px;
  color: #1d1d1f;
  background: none;
}

:deep(.el-input__inner::placeholder) {
  color: #86868b;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
  margin-top: 10px;
}

:deep(.el-form-item__error) {
  color: #ff3b30;
}
</style>
