//导入vue-router
import { createRouter, createWebHistory } from 'vue-router'


//配置路由规则
const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue')
    },
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        redirect: '/data-overview',
        children: [
            {
                path: '/data-overview',
                name: 'DataOverview',
                component: () => import('../views/DataOverview.vue'),
                meta: { title: '数据中心' }
            },
            {
                path: '/user-management',
                name: 'UserManagement',
                component: () => import('../views/UserManagement.vue'),
                meta: { title: '用户管理' }
            },
            {
                path: '/log-management',
                name: 'LogManagement',
                component: () => import('../views/LogManagement.vue'),
                meta: { title: '日志管理' }
            },
            {
                path: '/profile',
                name: 'Profile',
                component: () => import('../views/Profile.vue'),
                meta: { title: '个人信息' }
            },
            {
                path: '/change-password',
                name: 'ChangePassword',
                component: () => import('../views/ChangePassword.vue'),
                meta: { title: '修改密码' }
            },
            {
                path: '/user-data',
                name: 'UserData',
                component: () => import('../views/UserData.vue'),
                meta: { title: '用户数据' }
            },
            {
                path: '/test-records',
                name: 'TestRecords',
                component: () => import('../views/TestRecords.vue'),
                meta: { title: '测试报告' }
            },
            {
                path: '/system-settings',
                name: 'SystemSettings',
                component: () => import('../views/SystemSettings.vue'),
                meta: { title: '系统设置' }
            }
        ]
    }
]


//调用导入的方法创建路由器对象
const router = createRouter({
    history: createWebHistory(),  //路由模式，我们上面从vue-router导入进来的一个函数
    routes : routes   //路由关系我们上面创建的
})


// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.path === '/login') {
        if (token) {
            //next('/')
            next()
        } else {
            next()
        }
    } else {
        if (!token) {
            next('/login')
        } else {
            next()
        }
    }
})


//导出路由器
export default router
