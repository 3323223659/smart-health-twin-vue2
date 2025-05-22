<template>
  <div class="container">

    <div class="dashboard">
      <el-card class="stat-card" v-for="(stat, index) in statsData" :key="index">
        <template #header>
          <div class="stat-card-header">
            <span>{{ stat.title }}</span>
            <el-tag size="small" type="info">{{ stat.updateTime }}</el-tag>
          </div>
        </template>
        <div class="value">{{ stat.value }}</div>
        <div class="change" :class="stat.change >= 0 ? 'increase' : 'decrease'">
          <span>{{ stat.change >= 0 ? '↑' : '↓' }} {{ Math.abs(stat.change).toFixed(1) }}%</span> 较上月
        </div>
      </el-card>
    </div>

    <div class="charts-row">
      <el-card class="chart-card">
        <template #header>
          <div class="title">性别比例</div>
        </template>
        <div class="chart-container">
          <div ref="genderChartRef" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>
      <el-card class="chart-card">
        <template #header>
          <div class="title">年龄分布</div>
        </template>
        <div class="chart-container">
          <div ref="ageChartRef" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>
    </div>

    <div class="charts-row">
      <el-card class="chart-card large-chart-card">
        <template #header>
          <div class="trend-header">
            <span class="title">健康状态趋势</span>
            <div class="trend-controls">
              <el-radio-group v-model="timeRange" size="small" @change="updateTrendChart">
                <el-radio-button label="halfYear">近半年</el-radio-button>
                <el-radio-button label="fullYear">近一年</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>
        <div class="chart-container">
          <div ref="healthTrendChartRef" style="width: 100%; height: 300px;"></div>
        </div>
      </el-card>
    </div>

    <el-card class="data-table-card">
      <template #header>
        <div class="title">病情数量排行</div>
      </template>
      <el-table :data="diseaseRankData" style="width: 100%" :stripe="true" :border="false">
        <el-table-column prop="rank" label="排名" width="180" align="center"/>
        <el-table-column prop="name" label="病情类型" width="180" align="center"/>
        <el-table-column prop="count" label="人数" width="180" align="center"/>
        <el-table-column prop="percentage" label="占比" width="180" align="center"/>
        <el-table-column label="趋势" >
          <template #default="scope">
            <div class="progress-wrapper">
              <div class="progress-bar">
                <div class="progress-bar-fill" :style="{
                  width: scope.row.percentage,
                  backgroundColor: getProgressColor(scope.row.percentValue)
                }"></div>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

<!--    <el-card class="data-table-card">-->
<!--      <template #header>-->
<!--        <div class="title">用户健康状态</div>-->
<!--      </template>-->
<!--      <el-table :data="userHealthData" style="width: 100%" :stripe="true" :border="false">-->
<!--        <el-table-column prop="id" label="ID" width="160" align="center"/>-->
<!--        <el-table-column prop="name" label="姓名" width="160"/>-->
<!--        <el-table-column prop="age" label="年龄" width="160" align="center"/>-->
<!--        <el-table-column prop="gender" label="性别" width="160" align="center"/>-->
<!--        <el-table-column label="健康状态" width="180">-->
<!--          <template #default="scope">-->
<!--            <div class="health-status-cell">-->
<!--              <span class="health-status" :class="getHealthStatusClass(scope.row.status)"></span>-->
<!--              {{ scope.row.statusText }}-->
<!--            </div>-->
<!--          </template>-->
<!--        </el-table-column>-->
<!--        <el-table-column prop="lastCheck" label="最近检查"  align="center"/>-->
<!--      </el-table>-->
<!--    </el-card>-->
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, computed, nextTick, onBeforeUnmount, watch} from 'vue';
import * as echarts from 'echarts';

// 模拟数据获取API
const fetchData = (delay = 500) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        totalUsers: {
          current: Math.floor(Math.random() * 2000) + 23000,
          previous: Math.floor(Math.random() * 2000) + 20000
        },
        healthyUsers: {
          current: Math.floor(Math.random() * 1500) + 17500,
          previous: Math.floor(Math.random() * 1500) + 16000
        },
        attentionUsers: {
          current: Math.floor(Math.random() * 500) + 4000,
          previous: Math.floor(Math.random() * 500) + 4100
        },
        highRiskUsers: {
          current: Math.floor(Math.random() * 300) + 1600,
          previous: Math.floor(Math.random() * 300) + 1700
        },
        updateTime: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      });
    }, delay);
  });
};

// 数据定期刷新时间间隔（毫秒）
const dataRefreshInterval = 60000; // 1分钟
let refreshTimer = null;

// 当前日期格式化
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
});

// 统计卡片数据
const statsData = ref([
  {title: '总用户数', value: '加载中...', change: 0, updateTime: '--:--'},
  {title: '健康状况良好', value: '加载中...', change: 0, updateTime: '--:--'},
  {title: '需要关注', value: '加载中...', change: 0, updateTime: '--:--'},
  {title: '高风险人群', value: '加载中...', change: 0, updateTime: '--:--'}
]);

// 获取统计数据
const getStatsData = async () => {
  try {
    const data = await fetchData();

    // 计算增长率
    const totalChange = ((data.totalUsers.current - data.totalUsers.previous) / data.totalUsers.previous) * 100;
    const healthyChange = ((data.healthyUsers.current - data.healthyUsers.previous) / data.healthyUsers.previous) * 100;
    const attentionChange = ((data.attentionUsers.current - data.attentionUsers.previous) / data.attentionUsers.previous) * 100;
    const highRiskChange = ((data.highRiskUsers.current - data.highRiskUsers.previous) / data.highRiskUsers.previous) * 100;

    // 更新统计卡片数据
    statsData.value = [
      {
        title: '总用户数',
        value: data.totalUsers.current.toLocaleString(),
        change: totalChange,
        updateTime: data.updateTime
      },
      {
        title: '健康状况良好',
        value: data.healthyUsers.current.toLocaleString(),
        change: healthyChange,
        updateTime: data.updateTime
      },
      {
        title: '需要关注',
        value: data.attentionUsers.current.toLocaleString(),
        change: attentionChange,
        updateTime: data.updateTime
      },
      {
        title: '高风险人群',
        value: data.highRiskUsers.current.toLocaleString(),
        change: highRiskChange,
        updateTime: data.updateTime
      }
    ];
  } catch (error) {
    console.error('获取统计数据失败', error);
  }
};

// 趋势图时间范围
const timeRange = ref('halfYear');

// 趋势图数据
const trendData = reactive({
  halfYear: {
    months: ['1月', '2月', '3月', '4月', '5月', '6月'],
    healthy: [15200, 15800, 16500, 17200, 18000, 18475],
    attention: [4800, 4700, 4650, 4500, 4380, 4298],
    highRisk: [2100, 2050, 1980, 1900, 1850, 1795]
  },
  fullYear: {
    months: ['去年7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月', '4月', '5月', '6月'],
    healthy: [14200, 14500, 14800, 15000, 15100, 15200, 15800, 16500, 17200, 18000, 18475, 18600],
    attention: [5100, 5050, 5000, 4950, 4900, 4800, 4700, 4650, 4500, 4380, 4298, 4200],
    highRisk: [2300, 2250, 2200, 2180, 2150, 2100, 2050, 1980, 1900, 1850, 1795, 1750]
  }
});

// 图表引用
const genderChartRef = ref(null);
const ageChartRef = ref(null);
const healthTrendChartRef = ref(null);
let genderChart = null;
let ageChart = null;
let healthTrendChart = null;

// 病情数量排行数据
const diseaseRankData = ref([
  {rank: 1, name: '高血压', count: '4,582', percentage: '86%', percentValue: 86},
  {rank: 2, name: '糖尿病', count: '3,749', percentage: '72%', percentValue: 72},
  {rank: 3, name: '心脏病', count: '2,913', percentage: '65%', percentValue: 65},
  {rank: 4, name: '肥胖', count: '2,456', percentage: '58%', percentValue: 58},
  {rank: 5, name: '关节炎', count: '1,873', percentage: '42%', percentValue: 42},
  {rank: 6, name: '哮喘', count: '1,564', percentage: '34%', percentValue: 34},
  {rank: 7, name: '抑郁症', count: '1,298', percentage: '28%', percentValue: 28}
]);

// 用户健康状态数据
const userHealthData = ref([
  {id: '1001', name: '张明', age: 45, gender: '男', status: 'good', statusText: '良好', lastCheck: '2023-05-15'},
  {id: '1002', name: '李婷', age: 38, gender: '女', status: 'warning', statusText: '需关注', lastCheck: '2023-04-28'},
  {id: '1003', name: '王强', age: 52, gender: '男', status: 'risk', statusText: '高风险', lastCheck: '2023-05-10'},
  {id: '1004', name: '赵雅', age: 32, gender: '女', status: 'good', statusText: '良好', lastCheck: '2023-05-02'},
  {id: '1005', name: '刘伟', age: 61, gender: '男', status: 'warning', statusText: '需关注', lastCheck: '2023-05-12'}
]);

// 获取进度条颜色
const getProgressColor = (percentValue) => {
  if (percentValue > 75) {
    return 'var(--el-color-danger)';
  } else if (percentValue > 50) {
    return 'var(--el-color-warning)';
  } else if (percentValue > 25) {
    return 'var(--el-color-primary)';
  } else {
    return 'var(--el-color-info)';
  }
};

// 获取健康状态类名
const getHealthStatusClass = (status) => {
  switch (status) {
    case 'good':
      return 'health-good';
    case 'warning':
      return 'health-warning';
    case 'risk':
      return 'health-risk';
    default:
      return '';
  }
};

// 更新趋势图
const updateTrendChart = () => {
  if (!healthTrendChart) return;

  const currentData = trendData[timeRange.value];
  healthTrendChart.setOption({
    xAxis: {
      data: currentData.months
    },
    series: [
      {
        name: '健康状况良好',
        data: currentData.healthy
      },
      {
        name: '需要关注',
        data: currentData.attention
      },
      {
        name: '高风险人群',
        data: currentData.highRisk
      }
    ]
  });
};

// 初始化图表
onMounted(async () => {
  // 获取初始数据
  await getStatsData();

  // 设置定时刷新
  refreshTimer = setInterval(getStatsData, dataRefreshInterval);

  await nextTick();

  // 性别比例图表
  if (genderChartRef.value) {
    genderChart = echarts.init(genderChartRef.value);
    genderChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 'bottom',
        data: ['男', '女']
      },
      series: [
        {
          name: '性别比例',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {d}%'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: true
          },
          data: [
            {value: 13652, name: '男'},
            {value: 10916, name: '女'}
          ]
        }
      ]
    });
  }

  // 年龄分布图表
  if (ageChartRef.value) {
    ageChart = echarts.init(ageChartRef.value);
    ageChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: [
        {
          type: 'category',
          data: ['0-18', '19-30', '31-45', '46-60', '61-75', '76+'],
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: '用户数量',
          type: 'bar',
          barWidth: '60%',
          data: [2354, 5783, 7245, 5621, 2843, 722],
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: '#83bff6'},
              {offset: 0.5, color: '#188df0'},
              {offset: 1, color: '#188df0'}
            ])
          }
        }
      ]
    });
  }

  // 健康状态趋势图表
  if (healthTrendChartRef.value) {
    healthTrendChart = echarts.init(healthTrendChartRef.value);
    healthTrendChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['健康状况良好', '需要关注', '高风险人群']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: trendData[timeRange.value].months
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '健康状况良好',
          type: 'line',
          stack: 'Total',
          emphasis: {
            focus: 'series'
          },
          data: trendData[timeRange.value].healthy,
          lineStyle: {
            color: '#67C23A'
          },
          itemStyle: {
            color: '#67C23A'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: 'rgba(103, 194, 58, 0.5)'},
              {offset: 1, color: 'rgba(103, 194, 58, 0.1)'}
            ])
          }
        },
        {
          name: '需要关注',
          type: 'line',
          stack: 'Total',
          emphasis: {
            focus: 'series'
          },
          data: trendData[timeRange.value].attention,
          lineStyle: {
            color: '#E6A23C'
          },
          itemStyle: {
            color: '#E6A23C'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: 'rgba(230, 162, 60, 0.5)'},
              {offset: 1, color: 'rgba(230, 162, 60, 0.1)'}
            ])
          }
        },
        {
          name: '高风险人群',
          type: 'line',
          stack: 'Total',
          emphasis: {
            focus: 'series'
          },
          data: trendData[timeRange.value].highRisk,
          lineStyle: {
            color: '#F56C6C'
          },
          itemStyle: {
            color: '#F56C6C'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {offset: 0, color: 'rgba(245, 108, 108, 0.5)'},
              {offset: 1, color: 'rgba(245, 108, 108, 0.1)'}
            ])
          }
        }
      ]
    });
  }

  // 窗口大小变化时，重新调整图表大小
  window.addEventListener('resize', handleResize);
});

// 监听时间范围变化
watch(timeRange, () => {
  updateTrendChart();
});

// 图表适应窗口大小变化
const handleResize = () => {
  genderChart && genderChart.resize();
  ageChart && ageChart.resize();
  healthTrendChart && healthTrendChart.resize();
};

// 组件销毁前清除定时器和事件监听
onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.header h1 {
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card .title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-card .value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.stat-card .change {
  font-size: 12px;
  display: flex;
  align-items: center;
}

.stat-card .increase {
  color: var(--el-color-success);
}

.stat-card .decrease {
  color: var(--el-color-danger);
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 0;
}

.chart-card .title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 0;
  color: #303133;
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.large-chart-card {
  grid-column: span 2;
}

.progress-wrapper {
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.progress-bar {
  height: 8px;
  background-color: #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.health-status-cell {
  display: flex;
  align-items: center;
  padding-left: 15px;
}

.health-status {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.health-good {
  background-color: #67C23A;
}

.health-warning {
  background-color: #E6A23C;
}

.health-risk {
  background-color: #F56C6C;
}

.data-table-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.data-table-card :deep(.el-card__header) {
  padding: 12px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.data-table-card :deep(.el-table) {
  --el-table-border-color: #f0f0f0;
  --el-table-header-bg-color: #f5f7fa;
  --el-table-row-hover-bg-color: #f9f9f9;
}

.data-table-card :deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  font-size: 14px;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.data-table-card :deep(.el-table td) {
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.data-table-card :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

.data-table-card :deep(.el-table__row) {
  height: 60px;
}

.chart-container {
  height: 300px;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .dashboard {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .charts-row {
    grid-template-columns: 1fr;
  }

  .large-chart-card {
    grid-column: span 1;
  }
}
</style>
