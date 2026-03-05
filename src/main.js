import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { vClickOutside } from '@/directives/clickOutside'

const app = createApp(App)

app.directive('click-outside', vClickOutside)

app.use(router)

app.mount('#app')
