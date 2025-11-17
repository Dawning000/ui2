import { createRouter, createWebHashHistory } from 'vue-router'
import type { AppRouteRecord } from '@/types/router'

import Home from '../views/Home.vue'
import Forum from '../views/Forum.vue'
import PostDetail from '../views/PostDetail.vue'
import UserProfile from '../views/UserProfile.vue'
import UserSettings from '../views/UserSettings.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Test from '../views/Test.vue'
import QQLoginSuccess from '../views/QQLoginSuccess.vue'
import Search from '../views/Search.vue'
import Actors from '../views/Actors.vue'
import ActorDetail from '../views/ActorDetail.vue'
import AwardsList from '../views/AwardsList.vue'
import AwardDetail from '../views/AwardDetail.vue'
import MovieDetail from '../views/MovieDetail.vue'
import TvDetail from '../views/TvDetail.vue'
import VarietyDetail from '../views/VarietyDetail.vue'
import HotMovies from '../views/HotMovies.vue'

const routes: AppRouteRecord[] = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/actors',
    name: 'Actors',
    component: Actors
  },
  {
    path: '/actor/:id',
    name: 'ActorDetail',
    component: ActorDetail,
    props: true
  },
  {
    path: '/awards',
    name: 'AwardsList',
    component: AwardsList
  },
  {
    path: '/award/:id',
    name: 'AwardDetail',
    component: AwardDetail,
    props: true
  },
  {
    path: '/movie/:id',
    name: 'MovieDetail',
    component: MovieDetail,
    props: true
  },
  {
    path: '/trending',
    name: 'Trending',
    component: HotMovies
  },
  {
    path: '/tv/:id',
    name: 'TvDetail',
    component: TvDetail,
    props: true
  },
  {
    path: '/variety/:id',
    name: 'VarietyDetail',
    component: VarietyDetail,
    props: true
  },
  {
    path: '/forum',
    name: 'Forum',
    component: Forum
  },
  {
    path: '/forum/:category',
    name: 'ForumCategory',
    component: Forum,
    props: true
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetail,
    props: true
  },
  {
    path: '/user/:id',
    name: 'UserProfile',
    component: UserProfile,
    props: true
  },
  {
    path: '/user/settings',
    name: 'UserSettings',
    component: UserSettings
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/test',
    name: 'Test',
    component: Test
  },
  {
    path: '/login/qq/success',
    name: 'QQLoginSuccess',
    component: QQLoginSuccess
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的滚动位置（浏览器后退/前进），则恢复该位置
    if (savedPosition) {
      return savedPosition
    }
    // 否则滚动到页面顶部
    return { top: 0 }
  }
})

export default router
