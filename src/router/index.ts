import { createRouter, createWebHistory } from 'vue-router'
import type { AppRouteRecord } from '@/types/router'

import Home from '../views/Home.vue'
import Forum from '../views/Forum.vue'
import PostDetail from '../views/PostDetail.vue'
import UserProfile from '../views/UserProfile.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Test from '../views/Test.vue'
import Search from '../views/Search.vue'
import ListShare from '../views/ListShare.vue'
import Actors from '../views/Actors.vue'
import ActorDetail from '../views/ActorDetail.vue'
import MovieDetail from '../views/MovieDetail.vue'
import TvshowDetail from '../views/TvshowDetail.vue'
import VarietyDetail from '../views/VarietyDetail.vue'

const routes: AppRouteRecord[] = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/list/:id',
    name: 'ListShare',
    component: ListShare,
    props: true
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
  { path: '/movie/:id', name: 'MovieDetail', component: MovieDetail, props: true },
  { path: '/tvshow/:id', name: 'TvshowDetail', component: TvshowDetail, props: true },
  { path: '/variety/:id', name: 'VarietyDetail', component: VarietyDetail, props: true },
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
