<template>
  <div class="user-management">

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-input
              v-model="searchForm.phone"
              placeholder="搜索手机号"
              clearable
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-select v-model="searchForm.status" placeholder="用户状态" clearable>
            <el-option label="健康" value="1" />
            <el-option label="生病" value="0" />
          </el-select>
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
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
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
<!--      <el-table-column prop="id" label="ID" width="80" align="center" />-->
      <el-table-column prop="username" label="用户名" width="180" align="center"/>
      <el-table-column prop="phone" label="手机号" width="220" />
      <el-table-column prop="reportCount" label="检测次数" width="180" align="center" />
      <el-table-column prop="status" label="状态" width="180" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 1? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '健康' : '生病' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="examinationTime" label="最近检测时间"  />

<!--      <el-table-column prop="createTime" label="注册时间" width="220" align="center"/>-->
<!--      <el-table-column label="操作" fixed="right"  align="center">-->
<!--        <template #default="{ row }">-->
<!--          <div class="action-buttons">-->
<!--            <el-button-->
<!--                size="small"-->
<!--                type="primary"-->
<!--                plain-->
<!--                @click="handleViewDetails(row)"-->
<!--            >-->
<!--              详情-->
<!--            </el-button>-->
<!--            <el-button-->
<!--                size="small"-->
<!--                :type="row.status === 0 ? 'danger' : 'success'"-->
<!--                plain-->
<!--                @click="handleToggleStatus(row)"-->
<!--            >-->
<!--              {{ row.status === 'active' ? '禁用' : '启用' }}-->
<!--            </el-button>-->
<!--          </div>-->
<!--        </template>-->
<!--      </el-table-column>-->
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
import {ref, reactive, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Download} from '@element-plus/icons-vue'
import {post} from "@/utils/request.js";

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const searchForm = reactive({
  phone: '',
  status: '',
  pageSize: pageSize.value,
  page: currentPage.value
})
onMounted(()=>{
  handleSearch()
})
// 模拟用户数据
const userList = ref([
  {
    id: 1,
    username: '张三',
    phone: '13800138000',
    reportCount: 5,
    lastTestTime: '2024-03-15 14:30:00',
    status: 1
  },
  {
    id: 2,
    username: '李四',
    phone: '13800138001',
    reportCount: 3,
    lastTestTime: '2024-03-14 16:20:00',
    status: 1
  },
  {
    id: 3,
    username: '王五',
    phone: '13800138002',
    reportCount: 8,
    lastTestTime: '2024-03-16 09:15:00',
    status: 0
  },
  {
    id: 4,
    username: '赵六',
    phone: '13800138003',
    reportCount: 2,
    lastTestTime: '2024-03-10 13:45:00',
    status: 0
  },
  {
    id: 5,
    username: '孙七',
    phone: '13800138004',
    reportCount: 6,
    lastTestTime: '2024-03-12 11:05:00',
    status: 1
  },
  {
    id: 6,
    username: '周八',
    phone: '13800138005',
    reportCount: 7,
    lastTestTime: '2024-03-17 15:20:00',
    status: 1
  },
  {
    id: 7,
    username: '吴九',
    phone: '13800138006',
    reportCount: 1,
    lastTestTime: '2024-03-20 10:10:00',
    status: 0
  },
  {
    id: 8,
    username: '郑十',
    phone: '13800138007',
    reportCount: 4,
    lastTestTime: '2024-03-18 17:40:00',
    status: 1
  },
  {
    id: 9,
    username: '冯十一',
    phone: '13800138008',
    reportCount: 9,
    lastTestTime: '2024-03-22 12:30:00',
    status: 1
  },
  {
    id: 10,
    username: '陈十二',
    phone: '13800138009',
    reportCount: 3,
    lastTestTime: '2024-03-25 14:45:00',
    status: 0
  }
])


const handleSearch = async () => {
  loading.value = true
  // 模拟搜索请求

  try {
    const res = await post('/sht/admin/userinfo/list', searchForm)
    if (res.code === 200) {
      console.log("响应数据:", res.data)
      userList.value = res.data.records
      total.value = res.data.total
    }

  } catch (err) {
    console.error('获取用户列表失败:', err)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.phone = ''
  searchForm.status = ''
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
  // 查看用户详情
  console.log('查看用户详情:', row)
}

const handleToggleStatus = (row) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(
      `确定要${action}该用户吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    // 模拟状态更新
    row.status = row.status === 'active' ? 'disabled' : 'active'
    ElMessage.success(`${action}成功`)
  })
}

const handleExport = () => {
  ElMessage.success('导出成功')
}
</script>

<style scoped lang="scss">

/* 修复搜索栏选择框样式 */
.search-bar {
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

.user-management {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1d1d1f;
  }
}

.search-bar {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f8f9;
  border-radius: 8px;

  .el-form-item {
    margin-bottom: 0;
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
