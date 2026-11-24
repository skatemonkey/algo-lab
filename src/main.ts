import { createApp } from 'vue'
import App from './app/App.vue'
import { router } from './app/router'
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './shared/styles/reset.css'

createApp(App).use(router).mount('#app')
