// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import VModal from 'vue-js-modal';

import App from './App';

Vue.config.productionTip = false;

Vue.use(VModal);

// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.

  /* eslint-disable no-new */
  new Vue({
    el: '#app',
    template: '<App/>',
    components: { App },
  });
} else {
  alert('The File APIs are not fully supported in this browser.');
}
