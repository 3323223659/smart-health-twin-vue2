import axios from 'axios'
import { ElMessage } from 'element-plus' // 如果你使用Element Plus的提示组件
// 或者使用其他UI库的提示组件，如Ant Design Vue的message

// 创建axios实例
const service = axios.create({
    baseURL: "http://localhost:8088", // 从环境变量获取基础API地址
    timeout: 10000, // 请求超时时间
    headers: {
        'Content-Type': 'application/json;charset=utf-8'
    }
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 在发送请求之前做些什么
        // 例如：如果需要token，可以在这里统一设置
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = "eyJhbGciOiJIUzM4NCJ9.eyJ1c2VyaWQiOjIsInN1YiI6InVzZXIiLCJpYXQiOjE3NDQwNDA0ODAsImV4cCI6MTc0NDEyNjg4MH0.B1Vjcr7qdi3ZBwVB5l70XYPs7rWwXsqrFJSWGEPqzivCPPibZpHnzOvVLsKNvIJD"
        }
        return config
    },
    error => {
        // 对请求错误做些什么
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        // 对响应数据做点什么
        const res = response.data

        // 根据你的后端返回结构自定义处理
        // 例如：假设你的后端返回有code字段，200表示成功
        if (res.code !== 200) {
            // 处理业务错误
            ElMessage.error(res.message || 'Error')
            return Promise.reject(new Error(res.message || 'Error'))
        } else {
            return res
        }
    },
    error => {
        // 对响应错误做点什么
        console.log('err' + error) // for debug

        // HTTP状态码处理
        if (error.response) {
            switch (error.response.status) {
                case 400:
                    error.message = '请求错误(400)'
                    break
                case 401:
                    error.message = '未授权，请重新登录(401)'
                    // 可以在这里跳转到登录页
                    break
                case 403:
                    error.message = '拒绝访问(403)'
                    break
                case 404:
                    error.message = '请求出错(404)'
                    break
                case 408:
                    error.message = '请求超时(408)'
                    break
                case 500:
                    error.message = '服务器错误(500)'
                    break
                case 501:
                    error.message = '服务未实现(501)'
                    break
                case 502:
                    error.message = '网络错误(502)'
                    break
                case 503:
                    error.message = '服务不可用(503)'
                    break
                case 504:
                    error.message = '网络超时(504)'
                    break
                case 505:
                    error.message = 'HTTP版本不受支持(505)'
                    break
                default:
                    error.message = `连接出错(${error.response.status})!`
            }
        } else {
            error.message = '连接服务器失败!'
        }

        ElMessage.error(error.message)
        return Promise.reject(error)
    }
)

/**
 * 封装get方法
 * @param {string} url 请求地址
 * @param {object} params 请求参数
 * @returns {Promise}
 */
export function get(url, params = {}) {
    return new Promise((resolve, reject) => {
        service
            .get(url, {
                params: params
            })
            .then(response => {
                resolve(response)
            })
            .catch(error => {
                reject(error)
            })
    })
}

/**
 * 封装post方法
 * @param {string} url 请求地址
 * @param {object} data 请求数据
 * @returns {Promise}
 */
export function post(url, data = {}) {
    return new Promise((resolve, reject) => {
        service.post(url, data).then(
            response => {
                resolve(response)
            },
            error => {
                reject(error)
            }
        )
    })
}



// 导出axios实例
export default service
