import Vue from 'vue'
import App from './App.vue'
import * as fiber from 'fiber'

// gjx-start：联想 FileZ 文档中台集成（客开）
// 全部实现收敛在新增目录 src/custom/filez/ 下（含 OfficeSDK 类劫持、
// handles 调度表补丁、套红/清稿/转PDF/下载逻辑），致远原版源码仅此一处引入。
// 彻底卸载：删除本代码块与 src/custom/filez 目录（另见《公文FileZ改动总结.md》）。
import installFileZ from '@/custom/filez';
installFileZ();
// gjx-end

Vue.config.productionTip = false
Vue.use(fiber)

new Vue({
  render: h => {
    return h(
      'a-config-provider',
      {
        props: {
          locale: window._locale,
          autoInsertSpaceInButton: false
        }
      },
      [h(App)]
    )
  }
}).$mount('#app');


// 打印需要V3x
if(!window.v3x && window.V3X){
  window.v3x = new V3X();
  window.v3x.baseURL = window._ctxPath || "/seeyon"
}
