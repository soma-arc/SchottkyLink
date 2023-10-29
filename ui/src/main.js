import { createApp } from 'vue';
import Root from './vue/root.vue';

window.addEventListener('load', () => {
    const props = {};
    const app = createApp(Root, props);
    app.mount('#app');
});
