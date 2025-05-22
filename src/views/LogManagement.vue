<template>
  <div class="log-management">
    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索操作内容/操作人"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.type" placeholder="日志类型" clearable>
            <el-option label="操作日志" value="operation" />
            <el-option label="系统日志" value="system" />
            <el-option label="错误日志" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出日志
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      v-loading="loading"
      :data="logList"
      border
      style="width: 100%"
      class="log-table"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getLogTypeTag(row.type)">
            {{ getLogTypeText(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="操作内容" />
      <el-table-column prop="operator" label="操作人" width="120" />
      <el-table-column prop="ip" label="IP地址" width="140" />
      <el-table-column prop="time" label="操作时间" width="160" />
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            @click="handleViewDetails(row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="日志详情"
      width="600px"
      class="log-dialog"
    >
      <div v-if="currentLog" class="log-details">
        <div class="detail-item">
          <span class="label">日志ID：</span>
          <span class="value">{{ currentLog.id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">日志类型：</span>
          <span class="value">
            <el-tag :type="getLogTypeTag(currentLog.type)">
              {{ getLogTypeText(currentLog.type) }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="label">操作内容：</span>
          <span class="value">{{ currentLog.content }}</span>
        </div>
        <div class="detail-item">
          <span class="label">操作人：</span>
          <span class="value">{{ currentLog.operator }}</span>
        </div>
        <div class="detail-item">
          <span class="label">IP地址：</span>
          <span class="value">{{ currentLog.ip }}</span>
        </div>
        <div class="detail-item">
          <span class="label">操作时间：</span>
          <span class="value">{{ currentLog.time }}</span>
        </div>
        <div class="detail-item">
          <span class="label">详细信息：</span>
          <pre class="value detail-content">{{ currentLog.details }}</pre>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const dialogVisible = ref(false)
const currentLog = ref(null)

const searchForm = reactive({
  keyword: '',
  type: '',
  dateRange: []
})

// 模拟日志数据
const logList = ref([
  {
    id: 1,
    type: 'operation',
    content: '修改用户信息',
    operator: 'admin',
    ip: '192.168.1.100',
    time: '2024-03-15 14:30:00',
    details: '修改用户ID: 123 的信息\n修改字段: 手机号\n原值: 13800138000\n新值: 13800138001'
  },
  {
    id: 2,
    type: 'system',
    content: '系统自动备份',
    operator: 'system',
    ip: '127.0.0.1',
    time: '2024-03-15 15:00:00',
    details: '系统执行自动备份\n备份文件: backup_20240315.zip\n备份大小: 256MB\n备份状态: 成功'
  },
  {
    id: 3,
    type: 'error',
    content: '数据库连接失败',
    operator: 'system',
    ip: '127.0.0.1',
    time: '2024-03-15 15:30:00',
    details: '错误类型: ConnectionError\n错误信息: Cannot connect to database\n重试次数: 3\n最终状态: 失败'
  },
  {
    id: 4,
    type: 'operation',
    content: '用户登录',
    operator: 'user123',
    ip: '192.168.1.101',
    time: '2024-03-16 09:10:00',
    details: '用户ID: 123 成功登录\n登录方式: 密码登录\n登录IP: 192.168.1.101'
  },
  {
    id: 5,
    type: 'system',
    content: '系统升级',
    operator: 'system',
    ip: '127.0.0.1',
    time: '2024-03-17 11:00:00',
    details: '系统执行版本升级\n升级前版本: v1.2.0\n升级后版本: v1.3.0\n升级状态: 成功'
  },
  {
    id: 6,
    type: 'error',
    content: '文件上传失败',
    operator: 'user456',
    ip: '192.168.1.102',
    time: '2024-03-18 14:25:00',
    details: '错误类型: FileUploadError\n错误信息: 文件大小超过限制\n上传文件: large_file.pdf'
  },
  {
    id: 7,
    type: 'operation',
    content: '修改用户角色',
    operator: 'admin',
    ip: '192.168.1.100',
    time: '2024-03-19 16:40:00',
    details: '修改用户ID: 456 角色\n原角色: 普通用户\n新角色: 管理员'
  },
  {
    id: 8,
    type: 'system',
    content: '系统重启',
    operator: 'system',
    ip: '127.0.0.1',
    time: '2024-03-20 08:00:00',
    details: '系统执行定期重启\n重启原因: 安全更新\n重启状态: 成功'
  },
  {
    id: 9,
    type: 'error',
    content: 'API请求超时',
    operator: 'user789',
    ip: '192.168.1.103',
    time: '2024-03-21 10:50:00',
    details: '错误类型: TimeoutError\n错误信息: API请求超时\n请求API: /user/getInfo\n超时时长: 30秒'
  },
  {
    id: 10,
    type: 'operation',
    content: '用户注销',
    operator: 'user123',
    ip: '192.168.1.101',
    time: '2024-03-22 12:30:00',
    details: '用户ID: 123 执行注销操作\n注销IP: 192.168.1.101'
  }
])


const getLogTypeTag = (type) => {
  const typeMap = {
    operation: 'primary',
    system: 'info',
    error: 'danger'
  }
  return typeMap[type] || 'info'
}

const getLogTypeText = (type) => {
  const typeMap = {
    operation: '操作日志',
    system: '系统日志',
    error: '错误日志'
  }
  return typeMap[type] || '未知类型'
}

const handleSearch = () => {
  loading.value = true
  // 模拟搜索请求
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.type = ''
  searchForm.dateRange = []
  handleSearch()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}

const handleViewDetails = (row) => {
  currentLog.value = row
  dialogVisible.value = true
}

const handleExport = () => {
  ElMessage.success('导出成功')
}
</script>

<style scoped>

/* 修复条件查询选择框样式 */
.search-bar :deep(.el-select) {
  width: 160px;
}

.search-bar :deep(.el-select .el-input__wrapper) {
  background-color: #fff;
  border-radius: 6px;
  box-shadow: none;
  border: 1px solid #dcdfe6;
}

.search-bar :deep(.el-select .el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

.search-bar :deep(.el-select .el-input__inner) {
  color: #606266;
}

.search-bar :deep(.el-select .el-input__suffix) {
  color: #c0c4cc;
}

/* 修复日期选择器样式 */
.search-bar :deep(.el-date-editor) {
  width: 280px;
}

.search-bar :deep(.el-date-editor .el-input__wrapper) {
  background-color: #fff;
  border-radius: 6px;
  box-shadow: none;
  border: 1px solid #dcdfe6;
}

.search-bar :deep(.el-date-editor .el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

/* 修复搜索按钮样式 */
.search-bar :deep(.el-button) {
  margin-left: 10px;
}

.log-management {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
}

.search-bar {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f5f5f7;
  border-radius: 8px;
}

.log-table {
  margin-bottom: 24px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.log-details {
  padding: 20px;
}

.detail-item {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
}

.detail-item .label {
  width: 100px;
  color: #86868b;
  font-size: 14px;
}

.detail-item .value {
  flex: 1;
  color: #1d1d1f;
  font-size: 14px;
}

.detail-content {
  background-color: #f5f5f7;
  padding: 12px;
  border-radius: 8px;
  margin: 0;
  white-space: pre-wrap;
  font-family: monospace;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f5f5f7;
  font-weight: 600;
}

:deep(.el-button--link) {
  padding: 4px 8px;
}
</style>
