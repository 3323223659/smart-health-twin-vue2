<template>
  <div class="change-password-container">
    <div class="change-password-header">
      <h2>修改密码</h2>
    </div>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="change-password-form"
    >
      <el-form-item label="原密码" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          type="password"
          show-password
          placeholder="请输入原密码"
        />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          show-password
          placeholder="请输入新密码"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
          placeholder="请再次输入新密码"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">确认修改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref(null)
const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== form.value.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [
    { required: true, message: '请输入原密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    // TODO: 调用API修改密码
    ElMessage.success('密码修改成功，请重新登录')
    localStorage.removeItem('token')
    router.push('/login')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>

<style scoped>
.change-password-container {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.change-password-header {
  margin-bottom: 30px;
}

.change-password-header h2 {
  font-size: 20px;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0;
}

.change-password-form {
  max-width: 600px;
}
</style> 