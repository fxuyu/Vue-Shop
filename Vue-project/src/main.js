import Vue from 'vue'
import App from './App.vue'
import router from './router'

//导入全局样式表
import './assets/css/global.css';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor';
//导入富文本的对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

//导入axios
import axios from 'axios'
//http://timemeetyou.com:8889/api/private/v1/ 这个接口的角色分配这个有问题 会报错
//http://rambuild.cn:8888/api/private/v1/
//http://www.ysqorz.top:8888/api/private/v1/
axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1/'
//给请求头做个预处理 添加上一个token去 去访问接口(api)
axios.interceptors.request.use(config => {
  //console.log(config) 可以在登陆界面 查看
  //在最后必须return config
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
//让原型$http指向axios 
Vue.prototype.$http = axios

Vue.config.productionTip = false
//这是全局导入
Vue.use(ElementUI);
Vue.use(VueQuillEditor)
//全局的时间过滤器 把毫秒转换为现实时间
Vue.filter('dateFormat',function(originVal){
  //originVal*1000 *1000可以将数值变成现在时间
  const dt=new Date(originVal*1000)
  const y=dt.getFullYear()
  //getMonth是从零开始 所以加一 如果前面不足两位数 可以在前面补零 padStart(2,'0')
  const m=(dt.getMonth() + 1 + '').padStart(2,'0')
  const d=(dt.getDate()+'').padStart(2,'0')
  const hh=(dt.getHours() + '').padStart(2,'0')
  const mm=(dt.getMinutes() + '').padStart(2,'0')
  const ss=(dt.getSeconds() + '').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
