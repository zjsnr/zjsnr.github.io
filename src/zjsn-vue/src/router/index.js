import Vue from 'vue'
import VueRouter from 'vue-router'
import Build from '../views/Build.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/build',
    name: 'build',
    component: Build
  }
]

const router = new VueRouter({
  routes
})

export default router
