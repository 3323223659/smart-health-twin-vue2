<template>
  <el-container class="layout-container">

    <el-aside :width="isCollapse ? '64px' : '250px'" class="aside">
      <div class="logo-container">
        <img src="../assets/logo.png" alt="Logo" class="logo" />
        <span v-show="!isCollapse" class="title">智健孪生数据管理系统</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        :collapse="isCollapse"
        background-color="#001529"
        text-color="rgba(255, 255, 255, 0.65)"
        active-text-color="#fff"
        router
      >
        <el-menu-item index="/data-overview">
          <el-icon><DataLine /></el-icon>
          <template #title>数据中心</template>
        </el-menu-item>

        <el-menu-item index="/user-management">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>

        <el-menu-item index="/user-data">
          <el-icon><UserFilled /></el-icon>
          <template #title>用户数据</template>
        </el-menu-item>

        <el-menu-item index="/test-records">
          <el-icon><Document /></el-icon>
          <template #title>测试记录</template>
        </el-menu-item>

        <el-menu-item index="/log-management">
          <el-icon><List /></el-icon>
          <template #title>日志管理</template>
        </el-menu-item>

        <el-menu-item index="/system-settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>

      </el-menu>

    </el-aside>


    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-button
            type="text"
            class="collapse-btn"
            @click="toggleCollapse"
          >
            <el-icon :size="20">
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
            </el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentRoute }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <div>
            <span>{{ currentDate }}</span>
          </div>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="username">管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">个人信息</el-dropdown-item>
                <el-dropdown-item @click="router.push('/change-password')">修改密码</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { ElMessageBox } from 'element-plus'
import {
  DataLine,
  User,
  Document,
  Fold,
  Expand,
  UserFilled,
  List,
  Setting
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)
const currentRoute = computed(() => {
  const routeMap = {
    '/data-overview': '数据中心',
    '/user-management': '用户管理',
    '/user-data': '用户数据',
    '/test-records': '测试记录',
    '/log-management': '日志管理',
    '/system-settings': '系统设置'
  }
  return routeMap[route.path] || '首页'
})
// 当前日期格式化
const currentDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
});

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('token')
    router.push('/login')
  })
}
</script>

<style scoped>
.layout-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.aside {
  position: relative;
  height: 100%;
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  background-color: #002140;
  overflow: hidden;
  white-space: nowrap;
}

.logo {
  width: 28px;
  height: 28px;
  margin-right: 12px;
  flex-shrink: 0;
}

.title {
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.el-menu-vertical {
  border-right: none;
  height: calc(100% - 60px);
}

.el-menu-vertical:not(.el-menu--collapse) {
  width: 250px;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  margin-right: 20px;
  font-size: 20px;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
  height: calc(100% - 60px);
  overflow-y: auto;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  color: rgba(255, 255, 255, 0.65) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  color: #ffffff !important;
}

:deep(.el-menu-item:hover) {
  background-color: #001f3d !important;
  color: #ffffff !important;
}

:deep(.el-menu-item .el-icon) {
  color: inherit;
}

:deep(.el-menu--collapse .el-menu-item .el-icon) {
  margin: 0;
}

:deep(.el-container) {
  height: 100%;
}

:deep(.el-aside) {
  height: 100%;
}
</style>
