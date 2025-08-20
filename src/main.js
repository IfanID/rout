import '@/assets/styles/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import '@material/web/labs/card/elevated-card.js';
import '@material/web/button/text-button.js';
import '@material/web/iconbutton/icon-button.js';

const app = createApp(App)

app.use(router)

app.mount('#app')
