<template>
  <div class="user-data">

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-input
              v-model="searchForm.phone"
              placeholder="搜索手机号"
              clearable
              @keyup.enter="fetchUserList"
          >
            <template #prefix>
              <el-icon>
                <Search/>
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <!--        <el-form-item>-->
        <!--          <el-date-picker-->
        <!--              v-model="searchForm.dateRange"-->
        <!--              type="daterange"-->
        <!--              range-separator="至"-->
        <!--              start-placeholder="开始日期"-->
        <!--              end-placeholder="结束日期"-->
        <!--          />-->
        <!--        </el-form-item>-->
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="用户状态" clearable>
            <el-option label="启用" value="1"/>
            <el-option label="禁用" value="0"/>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchUserList">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleExport">
            <el-icon>
              <Download/>
            </el-icon>
            导出数据
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
        v-loading="loading"
        :data="userList"
        border
        style="width: 100%"
        class="user-table"
    >
      <el-table-column prop="id" label="用户ID" width="160" align="center"/>
      <el-table-column prop="phone" label="手机号" width="160"/>
      <el-table-column prop="role" label="角色" width="160">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role)" size="small">
            {{ getRoleText(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="160" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginTime" label="最近登录时间" width="200"/>
      <el-table-column prop="createdTime" label="注册时间" width="200" align="center"/>

      <el-table-column label="操作" fixed="right"  align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button
                size="small"
                type="primary"
                plain
                @click="handleViewDetails(row)"
            >
              详情
            </el-button>
            <el-button
                size="small"
                type="primary"
                plain
                @click="handleViewRecords(row)"
            >
              检测记录
            </el-button>
          </div>
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
  </div>
</template>

<script setup>
import {ref, onMounted, watchEffect} from 'vue'
import {ElMessage} from 'element-plus'
import {Search, Download} from '@element-plus/icons-vue'
import {post} from "@/utils/request.js"


const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)


const error = ref(null)
// 用户数据
const userList = ref([])
const searchForm = ref({
  phone: '',
  status: '',
})

// 根据 role 获取对应的 type
const getRoleType = (role) => {
  switch (role) {
    case 0:
      return 'danger' // 超级管理员success
    case 1:
      return 'success' // 管理员
    case 2:
      return 'default'    // 用户
    case 3:
      return 'info' // VIP 用户
    default:
      return 'default'
  }
}

// 根据 role 获取对应的文本
const getRoleText = (role) => {
  switch (role) {
    case 0:
      return '超级管理员'
    case 1:
      return '管理员'
    case 2:
      return '用户'
    case 3:
      return 'VIP用户'
    default:
      return '未知角色'
  }
}

// 获取用户列表方法
const fetchUserList = async () => {
  loading.value = true
  error.value = null
  // 分页数据
  const pageData = {
    page: currentPage.value,
    pageSize: pageSize.value,
    phone: searchForm.value.phone,
    status: searchForm.value.status
  }
  loading.value = true
  try {
    const res = await post('/sht/admin/user/list', pageData)
    if (res.code === 200) {
      console.log("响应数据:", res.data)
      userList.value = res.data.records
      total.value = res.data.total
    }

  } catch (err) {
    error.value = err
    console.error('获取用户列表失败:', err)
  } finally {
    loading.value = false
  }

}


// 组件挂载时获取数据
onMounted(() => {
  fetchUserList()
})


const handleReset = () => {
  searchForm.value.phone = ''
  searchForm.value.status = ''

  fetchUserList()
}

const handleSizeChange = (val) => {
  pageSize.value = val
  fetchUserList()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchUserList()
}

const handleViewDetails = (row) => {
  // 查看用户详情
  console.log('查看用户详情:', row)
}

const handleViewRecords = (row) => {
  // 查看检测记录
  console.log('查看检测记录:', row)
}

const handleExport = () => {
  ElMessage.success('导出成功')
}
</script>

<style scoped lang="scss">
.user-data {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

/* 修复搜索栏选择框样式 */
.search-bar {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f8f9;
  border-radius: 8px;

  .el-form-item {
    margin-bottom: 0;
  }

  :deep(.el-select) {
    width: 140px;

    .el-input__wrapper {
      background-color: #fff;
      border-radius: 6px;
      box-shadow: none;
      border: 1px solid #dcdfe6;

      &:hover {
        border-color: #c0c4cc;
      }
    }

    .el-input__inner {
      color: #606266;
    }

    .el-input__suffix {
      color: #c0c4cc;
    }
  }

  /* 修复日期选择器样式 */
  :deep(.el-date-editor) {
    width: 280px;

    .el-input__wrapper {
      background-color: #fff;
      border-radius: 6px;
      box-shadow: none;
      border: 1px solid #dcdfe6;

      &:hover {
        border-color: #c0c4cc;
      }
    }
  }

  /* 修复按钮间距 */
  .el-form-item:last-child {
    .el-button + .el-button {
      margin-left: 10px;
    }
  }
}

.user-table {
  margin-bottom: 24px;

  :deep(.el-table__cell) {
    padding: 12px 0;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 8px;

    .el-button {
      margin: 0;
    }
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;

  th {
    background-color: #f8f8f9;
    font-weight: 600;
    color: #515a6e;
  }

  tr:hover {
    td {
      background-color: #f5f7fa !important;
    }
  }
}

:deep(.el-pagination) {
  padding: 12px 0;
}

:deep(.el-tag) {
  font-weight: 500;
}
</style>
