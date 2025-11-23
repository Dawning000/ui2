<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <!-- 网站信息 -->
        <div class="footer-section">
          <div class="footer-brand">
            <i class="icon-orange"></i>
            <span>橘橙影志</span>
          </div>
          <p class="footer-description">
            橘橙暖时光，影志话悠长。在这个温暖的橘橙色调中，我们一起分享电影的美好时光，
            记录每一个动人的瞬间，与志同道合的影迷一起探讨精彩内容。
          </p>
          <div class="social-links">
            <a href="#" class="social-link" title="微博">
              <i class="icon-weibo"></i>
            </a>
            <a href="#" class="social-link" title="微信">
              <i class="icon-wechat"></i>
            </a>
            <a href="#" class="social-link" title="QQ">
              <i class="icon-qq"></i>
            </a>
            <a href="#" class="social-link" title="GitHub">
              <i class="icon-github"></i>
            </a>
          </div>
        </div>

        <!-- 快速链接 -->
        <div class="footer-section">
          <h4 class="footer-title">快速导航</h4>
          <ul class="footer-links">
            <li><router-link to="/">首页</router-link></li>
            <li><router-link to="/forum">论坛</router-link></li>
            <li><router-link to="/forum/movie">电影</router-link></li>
            <li><router-link to="/forum/tv">电视剧</router-link></li>

            <li><router-link to="/forum/variety">综艺</router-link></li>
          </ul>
        </div>

        <!-- 帮助中心 -->
        <div class="footer-section">
          <h4 class="footer-title">帮助中心</h4>
          <ul class="footer-links">
            <li>
              <a href="javascript:void(0)" @click.prevent="openHelp('guide')">使用指南</a>
            </li>
            <li>
              <a href="javascript:void(0)" @click.prevent="openHelp('rules')">社区规则</a>
            </li>
            <li>
              <a href="javascript:void(0)" @click.prevent="openHelp('privacy')">隐私政策</a>
            </li>
            <li>
              <a href="javascript:void(0)" @click.prevent="openHelp('terms')">服务条款</a>
            </li>
            <li>
              <a href="javascript:void(0)" @click.prevent="openHelp('feedback')">意见反馈</a>
            </li>
            <li>
              <a href="javascript:void(0)" @click.prevent="openHelp('contact')">联系我们</a>
            </li>
          </ul>
        </div>

        <!-- 热门标签 -->
        <div class="footer-section">
          <h4 class="footer-title">热门标签</h4>
          <div class="footer-tags">
            <button
              v-for="tag in footerTags"
              :key="tag"
              type="button"
              class="tag"
              @click="handleTagClick(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </div>
      </div>

      <!-- 版权信息 -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <div class="copyright-wrapper">
            <p class="copyright">
              © 2025 影视论坛. 保留所有权利.
            </p>
            <p class="copyright-notice">
              橘橙影志版权所有，未经许可禁止转载。
            </p>
          </div>
          
        </div>
      </div>

      <!-- 帮助中心弹窗 -->
      <div
        v-if="helpDialogVisible && currentHelp"
        class="help-dialog-overlay"
        @click.self="closeHelp"
      >
        <div class="help-dialog">
          <div class="help-dialog-header">
            <h3 class="help-dialog-title">{{ currentHelp.title }}</h3>
            <button class="help-dialog-close" type="button" @click="closeHelp">✕</button>
          </div>
          <div class="help-dialog-body">
            <p v-for="(paragraph, index) in currentHelp.content" :key="index">
              {{ paragraph }}
            </p>
            <template v-if="currentHelp.type === 'feedback'">
              <div class="help-feedback-tips">
                <p>如果你在使用过程中遇到问题，可以通过以下方式反馈：</p>
                <ul>
                  <li>在论坛发帖详细描述你的问题和操作步骤</li>
                  <li>附上必要的截图或错误提示信息，方便我们排查</li>
                  <li>留下你的联系方式，方便我们进一步沟通</li>
                </ul>
              </div>
            </template>
            <template v-if="currentHelp.type === 'contact'">
              <div class="help-contact-info">
                <p>你可以通过以下方式联系我们的运营团队：</p>
                <ul>
                  <li>邮箱：ustinian21@qq.com（工作日 10:00-18:00）</li>
                  <li>QQ：  3274067997</li>
                  
                </ul>
              </div>
            </template>
          </div>
          <div class="help-dialog-footer">
            <button type="button" class="help-dialog-btn" @click="closeHelp">
              我知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const onlineUsers = ref(0)
const todayPosts = ref(0)
const totalPosts = ref(0)
const footerTags = ['剧情', '喜剧', '动作', '爱情', '科幻', '悬疑', '惊悚', '犯罪']
const router = useRouter()

onMounted(() => {
  // 模拟数据，实际项目中应该从API获取
  onlineUsers.value = Math.floor(Math.random() * 1000) + 500
  todayPosts.value = Math.floor(Math.random() * 100) + 50
  totalPosts.value = Math.floor(Math.random() * 10000) + 50000
})

const handleTagClick = (tag: string) => {
  router.push({
    name: 'Search',
    query: {
      type: 'movie',
      tag
    }
  })
}

type HelpKey = 'guide' | 'rules' | 'privacy' | 'terms' | 'feedback' | 'contact'

const helpDialogVisible = ref(false)
const activeHelpKey = ref<HelpKey | null>(null)

const helpConfigs: Record<
  HelpKey,
  {
    title: string
    type: HelpKey
    content: string[]
  }
> = {
  guide: {
    title: '使用指南',
    type: 'guide',
    content: [
      '欢迎来到橘橙影志！你可以在这里发现、收藏并讨论你喜欢的影视内容。',
      '在顶部导航中进入「电影 / 电视剧 / 综艺」频道，可以浏览最新及热门作品；在搜索框中输入片名、演员或标签即可快速找到目标。',
      '登录后，你可以发表影评、参与讨论、创建片单和关注其他影迷。建议先完善个人资料，让更多人了解你。'
    ]
  },
  rules: {
    title: '社区规则',
    type: 'rules',
    content: [
      '为了给大家营造一个友好、理性的讨论环境，请你在发言时保持礼貌、尊重他人，不进行人身攻击、辱骂或歧视性言论。',
      '禁止发布任何违法违规内容，包括但不限于侵权资源、黄赌毒、政治敏感信息等，一经发现将视情况进行删帖、禁言或封号处理。',
      '请尽量发表有价值的内容，避免刷屏、水帖和恶意引战。希望每一位影迷都能在这里愉快交流、共同进步。'
    ]
  },
  privacy: {
    title: '隐私政策',
    type: 'privacy',
    content: [
      '我们仅会在提供服务所必需的范围内收集和使用你的信息，例如账号注册所需的昵称、邮箱等基础信息。',
      '你的个人信息将被妥善保护，不会在未取得你授权的情况下向第三方披露，除非依据法律法规或监管要求。',
      '你可以随时修改个人资料或注销账号。如对隐私政策有任何疑问，欢迎通过「联系我们」与我们沟通。'
    ]
  },
  terms: {
    title: '服务条款',
    type: 'terms',
    content: [
      '使用本网站即表示你同意遵守本站的服务条款以及所在地区的相关法律法规。',
      '本站提供的内容和功能可能会根据运营情况进行调整或更新，我们会尽量提前通过公告或通知说明重要变更。',
      '如用户存在严重违规行为，本站有权在不事先通知的情况下对账号采取限制功能、冻结或注销等措施。'
    ]
  },
  feedback: {
    title: '意见反馈',
    type: 'feedback',
    content: [
      '你的建议对我们非常重要！无论是功能体验、界面设计还是内容推荐，欢迎把你的真实想法告诉我们。',
      '我们会定期整理并评估社区反馈，用于优化产品功能和使用体验。对于重要问题，我们会尽量给出公开说明或进度更新。'
    ]
  },
  contact: {
    title: '联系我们',
    type: 'contact',
    content: [
      '如果你在使用过程中遇到任何问题，或者有合作与商务需求，都可以通过以下方式联系我们。',
      '我们会在工作时间内尽快回复你的消息，非常感谢你对橘橙影志的支持与关注。'
    ]
  }
}

const currentHelp = computed(() =>
  activeHelpKey.value ? helpConfigs[activeHelpKey.value] : null
)

const openHelp = (key: HelpKey) => {
  activeHelpKey.value = key
  helpDialogVisible.value = true
}

const closeHelp = () => {
  helpDialogVisible.value = false
  activeHelpKey.value = null
}
</script>

<style lang="scss" scoped>
.footer {
  background: #1f2937;
  color: #d1d5db;
  margin-top: 60px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  padding: 60px 0 40px;
}

.footer-section {
  .footer-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 700;
    color: white;
    margin-bottom: 16px;
    
    .icon-film {
      font-size: 24px;
      color: var(--primary-color);
    }
  }
  
  .footer-description {
    line-height: 1.6;
    margin-bottom: 20px;
    color: #9ca3af;
  }
  
  .social-links {
    display: flex;
    gap: 12px;
    
    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: #374151;
      border-radius: 8px;
      color: #d1d5db;
      text-decoration: none;
      transition: all 0.2s;
      
      &:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-2px);
      }
    }
  }
}

.footer-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    margin-bottom: 8px;
    
    a {
      color: #9ca3af;
      text-decoration: none;
      transition: color 0.2s;
      
      &:hover {
        color: var(--primary-color);
      }
    }
  }
}

.footer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .tag {
    padding: 4px 12px;
    background: #374151;
    border-radius: 16px;
    font-size: 12px;
    color: #d1d5db;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
    outline: none;
    font: inherit;
    
    &:hover {
      background: var(--primary-color);
      color: white;
    }
  }
}

.footer-bottom {
  border-top: 1px solid #374151;
  padding: 20px 0;
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.copyright-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.copyright {
  color: #9ca3af;
  font-size: 14px;
  margin: 0;
}

.copyright-notice {
  color: #6b7280;
  font-size: 12px;
  margin: 0;
}

.footer-stats {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #9ca3af;
  
  span {
    white-space: nowrap;
  }
}

.help-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.help-dialog {
  width: 90%;
  max-width: 520px;
  background: #111827;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  padding: 20px 24px 18px;
  color: #e5e7eb;
}

.help-dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.help-dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: #f9fafb;
  margin: 0;
}

.help-dialog-close {
  border: none;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  border-radius: 999px;
  transition: background 0.15s, color 0.15s, transform 0.1s;

  &:hover {
    background: #374151;
    color: #e5e7eb;
    transform: translateY(-1px);
  }
}

.help-dialog-body {
  font-size: 14px;
  line-height: 1.7;
  color: #d1d5db;
  max-height: 55vh;
  overflow-y: auto;

  p {
    margin-bottom: 8px;
  }

  ul {
    padding-left: 18px;
    margin: 6px 0 10px;

    li {
      margin-bottom: 4px;
    }
  }
}

.help-feedback-tips,
.help-contact-info {
  margin-top: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(55, 65, 81, 0.6);
}

.help-dialog-footer {
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
}

.help-dialog-btn {
  min-width: 96px;
  padding: 6px 16px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: var(--primary-color);
  color: #f9fafb;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s, transform 0.1s, box-shadow 0.1s;

  &:hover {
    background: #f97316;
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(249, 115, 22, 0.4);
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 40px 0 30px;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .footer-stats {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .footer-container {
    padding: 0 15px;
  }
  
  .footer-content {
    padding: 30px 0 20px;
  }
  
  .footer-tags {
    .tag {
      font-size: 11px;
      padding: 3px 8px;
    }
  }
}
</style>
