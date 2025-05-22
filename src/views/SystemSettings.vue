<template>
  <div class="system-settings">

    <div class="settings-container">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="apple-card settings-menu">
            <el-menu
              :default-active="activeMenu"
              class="apple-menu"
              @select="handleMenuSelect"
            >
              <el-menu-item index="basic">
                <el-icon><Setting /></el-icon>
                <span>基本设置</span>
              </el-menu-item>
              <el-menu-item index="notification">
                <el-icon><Bell /></el-icon>
                <span>通知设置</span>
              </el-menu-item>
              <el-menu-item index="data">
                <el-icon><DataLine /></el-icon>
                <span>数据设置</span>
              </el-menu-item>
              <el-menu-item index="security">
                <el-icon><Lock /></el-icon>
                <span>安全设置</span>
              </el-menu-item>
            </el-menu>
          </el-card>
        </el-col>
        <el-col :span="16">
          <el-card class="apple-card settings-content">

            <!-- 基本设置 -->
            <div v-if="activeMenu === 'basic'" class="setting-section">
              <h3>基本设置</h3>
              <el-form label-position="top" class="apple-form">
                <el-form-item label="系统名称">
                  <el-input v-model="basicSettings.systemName" class="apple-input" />
                </el-form-item>
                <el-form-item label="系统Logo">
                  <el-upload
                    class="apple-upload"
                    action="#"
                    :auto-upload="false"
                    :show-file-list="false"
                  >
                    <el-button type="primary" class="apple-button">上传Logo</el-button>
                  </el-upload>
                </el-form-item>
                <el-form-item label="系统主题">
                  <el-radio-group v-model="basicSettings.theme" class="apple-radio-group">
                    <el-radio label="light">浅色主题</el-radio>
                    <el-radio label="dark">深色主题</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-form>
            </div>

            <!-- 通知设置 -->
            <div v-if="activeMenu === 'notification'" class="setting-section">
              <h3>通知设置</h3>
              <el-form label-position="top" class="apple-form">
                <el-form-item label="异常检测通知">
                  <el-switch
                    v-model="notificationSettings.abnormalAlert"
                    class="apple-switch"
                  />
                </el-form-item>
                <el-form-item label="通知方式">
                  <el-checkbox-group v-model="notificationSettings.methods" class="apple-checkbox-group">
                    <el-checkbox label="email">邮件通知</el-checkbox>
                    <el-checkbox label="sms">短信通知</el-checkbox>
                    <el-checkbox label="system">系统通知</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                <el-form-item label="通知时间">
                  <el-time-picker
                    v-model="notificationSettings.time"
                    format="HH:mm"
                    placeholder="选择时间"
                    class="apple-time-picker"
                  />
                </el-form-item>
              </el-form>
            </div>

            <!-- 数据设置 -->
            <div v-if="activeMenu === 'data'" class="setting-section">
              <h3>数据设置</h3>
              <el-form label-position="top" class="apple-form">
                <el-form-item label="数据保留时间">
                  <el-select v-model="dataSettings.retentionPeriod" class="apple-select">
                    <el-option label="3个月" value="3" />
                    <el-option label="6个月" value="6" />
                    <el-option label="1年" value="12" />
                    <el-option label="永久" value="-1" />
                  </el-select>
                </el-form-item>
                <el-form-item label="数据备份">
                  <el-switch
                    v-model="dataSettings.autoBackup"
                    class="apple-switch"
                  />
                </el-form-item>
                <el-form-item label="备份频率">
                  <el-select
                    v-model="dataSettings.backupFrequency"
                    class="apple-select"
                    :disabled="!dataSettings.autoBackup"
                  >
                    <el-option label="每天" value="daily" />
                    <el-option label="每周" value="weekly" />
                    <el-option label="每月" value="monthly" />
                  </el-select>
                </el-form-item>
              </el-form>
            </div>

            <!-- 安全设置 -->
            <div v-if="activeMenu === 'security'" class="setting-section security-settings">
              <h3>安全设置</h3>
              <el-form label-position="top" class="apple-form">
                <el-form-item label="密码策略">
                  <el-checkbox-group v-model="securitySettings.passwordPolicy" class="apple-checkbox-group">
                    <el-checkbox label="uppercase">必须包含大写字母</el-checkbox>
                    <el-checkbox label="lowercase">必须包含小写字母</el-checkbox>
                    <el-checkbox label="number">必须包含数字</el-checkbox>
                    <el-checkbox label="special">必须包含特殊字符</el-checkbox>
                  </el-checkbox-group>
                </el-form-item>
                <el-form-item label="密码最小长度">
                  <el-input-number
                    v-model="securitySettings.minPasswordLength"
                    :min="6"
                    :max="20"
                    class="apple-input-number"
                  />
                </el-form-item>
                <el-form-item label="登录失败锁定">
                  <el-switch
                    v-model="securitySettings.loginLock"
                    class="apple-switch"
                  />
                </el-form-item>
                <el-form-item label="锁定阈值">
                  <el-input-number
                    v-model="securitySettings.lockThreshold"
                    :min="3"
                    :max="10"
                    class="apple-input-number"
                    :disabled="!securitySettings.loginLock"
                  />
                </el-form-item>
              </el-form>
            </div>

            <div class="settings-actions">
              <el-button type="primary" class="apple-button">保存设置</el-button>
              <el-button class="apple-button">重置</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Setting, Bell, DataLine, Lock } from '@element-plus/icons-vue'

const activeMenu = ref('basic')

const basicSettings = ref({
  systemName: '健康检测数据管理系统',
  theme: 'light'
})

const notificationSettings = ref({
  abnormalAlert: true,
  methods: ['email', 'system'],
  time: new Date(2000, 0, 1, 9, 0)
})

const dataSettings = ref({
  retentionPeriod: '6',
  autoBackup: true,
  backupFrequency: 'daily'
})

const securitySettings = ref({
  passwordPolicy: ['uppercase', 'number'],
  minPasswordLength: 8,
  loginLock: true,
  lockThreshold: 5
})

const handleMenuSelect = (index) => {
  activeMenu.value = index
}
</script>

<style scoped>

/* 修改密码策略的复选框组为横向排列 */
.security-settings .apple-checkbox-group {
  display: flex !important;
  flex-direction: row !important;
  gap: 16px !important;
  flex-wrap: wrap !important;
}

/* 调整密码最小长度和锁定阈值的输入框样式 */
.security-settings .apple-input-number {
  width: 100px !important;
}

/* 调整安全设置区域的布局 */
.security-settings .el-form-item {
  margin-bottom: 18px;
}


.system-settings {
  padding: 24px;
}






.header {
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1d1d1f;
}

.settings-container {
  margin-top: 24px;
}

.settings-menu {
  height: 100%;
  background-color: transparent;
}

.apple-menu {
  border: none;
  background: transparent;
}

/* 普通状态 */
.apple-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f !important; /* 强制设置普通状态文字颜色 */
  border-radius: 8px;
  margin: 4px 0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  background-color: transparent; /* 确保背景透明 */
}

/* 选中状态 */
.apple-menu :deep(.el-menu-item.is-active) {
  background-color: #18191a;
  color: #eef0f1 !important; /* 强制设置选中状态文字颜色 */
  font-weight: 600;
}

/* 悬停状态 */
.apple-menu :deep(.el-menu-item:not(.is-active):hover) {
  background-color: #f5f5f7;
  color: #e3e3e9 !important; /* 强制设置悬停状态文字颜色 */
}

/* 图标样式 */
.apple-menu :deep(.el-menu-item .el-icon) {
  margin-right: 8px;
  font-size: 18px;
  color: inherit !important; /* 确保图标颜色跟随文字颜色 */
}

/* 移除可能导致问题的变量强制覆盖 */
.apple-menu :deep(.el-menu-item),
.apple-menu :deep(.el-menu-item.is-active),
.apple-menu :deep(.el-menu-item:hover) {
  --el-menu-text-color: #1d1d1f !important; /* 默认颜色 */
  --el-menu-active-color: #0071e3 !important; /* 选中颜色 */
  --el-menu-hover-text-color: #1d1d1f !important; /* 悬停颜色 */
}

/* 确保 span 标签颜色正确 */
.apple-menu :deep(.el-menu-item span) {
  color: inherit !important;
}

/* 确保菜单整体背景透明 */
.apple-menu {
  border: none;
  background: transparent !important;
}

.setting-section {
  padding: 20px;
}

.setting-section h3 {
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
}

.apple-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #1d1d1f;
}

.apple-input :deep(.el-input__wrapper) {
  background-color: #f5f5f7;
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.apple-input :deep(.el-input__wrapper:hover) {
  background-color: #fff;
}

.apple-upload {
  margin-top: 8px;
}

.apple-radio-group :deep(.el-radio__label) {
  color: #1d1d1f;
}

.apple-radio-group :deep(.el-radio__input.is-checked .el-radio__inner) {
  background-color: #0071e3;
  border-color: #0071e3;
}

.apple-switch :deep(.el-switch__core) {
  border-radius: 12px;
}

.apple-switch :deep(.el-switch.is-checked .el-switch__core) {
  background-color: #34c759;
  border-color: #34c759;
}

.apple-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.apple-checkbox-group :deep(.el-checkbox__label) {
  color: #1d1d1f;
}

.apple-checkbox-group :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #0071e3;
  border-color: #0071e3;
}

.apple-time-picker :deep(.el-input__wrapper) {
  background-color: #f5f5f7;
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 120px;
}

.apple-select :deep(.el-input__wrapper) {
  background-color: #f5f5f7;
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 200px;
}

.apple-input-number :deep(.el-input__wrapper) {
  background-color: #f5f5f7;
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 120px;
}

.settings-actions {
  margin-top: 24px;
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
