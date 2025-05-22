<template>
  <div class="test-records">

    <div class="search-bar">
      <el-form :inline="true" :model="searchForm">
        <el-form-item>
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索检测ID/用户名"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
<!--        <el-form-item>-->
<!--          <el-date-picker-->
<!--            v-model="searchForm.dateRange"-->
<!--            type="daterange"-->
<!--            range-separator="至"-->
<!--            start-placeholder="开始日期"-->
<!--            end-placeholder="结束日期"-->
<!--          />-->
<!--        </el-form-item>-->
        <el-form-item>
          <el-select v-model="searchForm.testResult" placeholder="检测结果" clearable>
            <el-option label="全部" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="异常" value="abnormal" />
          </el-select>
        </el-form-item>
<!--        <el-form-item>-->
<!--          <el-select v-model="searchForm.testType" placeholder="检测类型" clearable>-->
<!--            <el-option label="全部" value="" />-->
<!--            <el-option label="常规检测" value="regular" />-->
<!--            <el-option label="专项检测" value="special" />-->
<!--          </el-select>-->
<!--        </el-form-item>-->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出记录
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      v-loading="loading"
      :data="testRecords"
      border
      style="width: 100%"
      class="records-table"
    >
      <el-table-column prop="id" label="检测ID" width="120" align="center" />
      <el-table-column prop="userName" label="用户名" width="120" />
      <el-table-column prop="testTime" label="检测时间" width="180" />
      <el-table-column prop="testType" label="检测类型" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.testType === 'regular' ? '' : 'warning'" size="small">
            {{ row.testType === 'regular' ? '常规检测' : '专项检测' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="检测分数" width="100" align="center" />
      <el-table-column prop="result" label="检测结果" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.result === 'normal' ? 'success' : 'danger'" size="small">
            {{ row.result === 'normal' ? '正常' : '异常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="abnormalItems" label="异常指标" />
      <el-table-column label="操作" fixed="right" width="220" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button
              size="small"
              type="primary"
              plain
              @click="handleViewDetails(row)"
            >
              查看详情
            </el-button>
            <el-button
              size="small"
              type="success"
              plain
              @click="handleExportReport(row)"
            >
              导出报告
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const searchForm = reactive({
  keyword: '',
  dateRange: [],
  testResult: '',
  testType: ''
})

// 检测记录数据
const testRecords = ref([
  {
    id: 'T20240315001',
    userName: '张三',
    testTime: '2024-03-15 09:30',
    testType: 'regular',
    score: 85,
    result: 'normal',
    abnormalItems: '无'
  },
  {
    id: 'T20240315002',
    userName: '李四',
    testTime: '2024-03-15 10:15',
    testType: 'special',
    score: 65,
    result: 'abnormal',
    abnormalItems: '血压偏高,心率偏快'
  },
  {
    id: 'T20240315003',
    userName: '王五',
    testTime: '2024-03-15 11:00',
    testType: 'regular',
    score: 78,
    result: 'normal',
    abnormalItems: '无'
  },
  {
    id: 'T20240315004',
    userName: '赵六',
    testTime: '2024-03-15 11:30',
    testType: 'special',
    score: 55,
    result: 'abnormal',
    abnormalItems: '血糖偏高'
  },
  {
    id: 'T20240315005',
    userName: '孙七',
    testTime: '2024-03-15 12:00',
    testType: 'regular',
    score: 90,
    result: 'normal',
    abnormalItems: '无'
  },
  {
    id: 'T20240315006',
    userName: '周八',
    testTime: '2024-03-15 12:45',
    testType: 'special',
    score: 70,
    result: 'abnormal',
    abnormalItems: '肝功能异常'
  },
  {
    id: 'T20240315007',
    userName: '吴九',
    testTime: '2024-03-15 13:15',
    testType: 'regular',
    score: 82,
    result: 'normal',
    abnormalItems: '无'
  },
  {
    id: 'T20240315008',
    userName: '郑十',
    testTime: '2024-03-15 14:00',
    testType: 'special',
    score: 63,
    result: 'abnormal',
    abnormalItems: '胆固醇偏高'
  },
  {
    id: 'T20240315009',
    userName: '冯十一',
    testTime: '2024-03-15 14:30',
    testType: 'regular',
    score: 88,
    result: 'normal',
    abnormalItems: '无'
  },
  {
    id: 'T20240315010',
    userName: '陈十二',
    testTime: '2024-03-15 15:00',
    testType: 'special',
    score: 50,
    result: 'abnormal',
    abnormalItems: '视力下降'
  }
])


const handleSearch = () => {
  loading.value = true
  // 模拟搜索请求
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.testResult = ''
  searchForm.testType = ''
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
  // 查看检测详情
  console.log('查看检测详情:', row)
}

const handleExportReport = (row) => {
  // 导出检测报告
  console.log('导出检测报告:', row)
  ElMessage.success('报告导出成功')
}

const handleExport = () => {
  // 导出全部记录
  ElMessage.success('记录导出成功')
}
</script>

<style scoped lang="scss">
.test-records {
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

.records-table {
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
