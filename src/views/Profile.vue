<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>个人信息</h2>
    </div>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      class="profile-form"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" disabled />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存修改</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const formRef = ref(null)
const form = ref({
  username: 'admin',
  name: '管理员',
  phone: '',
  email: ''
})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    // TODO: 调用API保存个人信息
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
</script>


<style scoped>
.profile-container {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.profile-header {
  margin-bottom: 30px;
}

.profile-header h2 {
  font-size: 20px;
  font-weight: 500;
  color: #1d1d1f;
  margin: 0;
}

.profile-form {
  max-width: 600px;
}
</style> 