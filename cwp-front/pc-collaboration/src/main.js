// import 'babel-polyfill';
import Vue from 'vue';
import App from './App.vue';

import '@/assets/css/global.scss';
import '@/assets/css/common.scss';
import pinia from './store';
import plugins from '@/plugins';
import '@/shim/append';

// gjx-start：联想 FileZ 文档中台集成（客开）
// 核心实现收敛在新增目录 src/custom/filez/ 下；附件两个组件另有路由标记块。
// 彻底卸载：删除上述标记块与 src/custom/filez 目录即可回到原版行为。
import installFileZ from '@/custom/filez';
installFileZ();
// gjx-end

Vue.use(plugins);

//all-min又要报错了，真是醉了，以后不报错了可以去掉以下代码-----------
// console.log(
//     'all-min又要报错了，真是醉了，以后不为undefined了可以去掉以下代码:',
//     window.$.ctx.plugins
// );

if (!window.$.ctx.plugins) {
  window._plugins?.length > 0
    ? (window.$.ctx.plugins = window._plugins)
    : (window.$.ctx.plugins = []);
}

// $options传递
// function domainInit() {
//   const options = this.$options;
//   if (options.domain) {
//     this.$domain = options.domain;
//   } else if (options.parent?.$domain) {
//     this.$domain = options.parent.$domain;
//   }
// }
// Vue.mixin({ beforeCreate: domainInit });
//-----------------------------------
new Vue({
  pinia,
  render: (h) =>
    h('a-config-provider', { props: { autoInsertSpaceInButton: false, locale: window._locale } }, [
      h(App)
    ])
}).$mount('#app');
