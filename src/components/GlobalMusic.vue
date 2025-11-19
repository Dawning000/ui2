<template>
  <div class="global-music">
    <audio
      ref="bgmRef"
      class="bgm-audio"
      :src="bgmSrc"
      loop
      preload="auto"
      aria-hidden="true"
    ></audio>

    <transition name="music-fade">
      <div class="music-tip" v-if="showMusicTip">
        浏览器阻止了自动播放，请点击下方按钮开启音乐
      </div>
    </transition>

    <div class="music-panel">
      <button class="music-toggle" type="button" @click="toggleMusic">
        <span class="music-icon">🎵</span>
        <span>{{ isMusicPlaying ? '暂停音乐' : '播放音乐' }}</span>
      </button>
      <label class="volume-control" tabindex="-1">
        <span class="volume-label">音量</span>
        <input
          class="volume-slider"
          type="range"
          min="0"
          max="100"
          step="1"
          :value="Math.round(volume * 100)"
          @input="onVolumeInput"
        />
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const bgmSrc = '/bgm.mp3'
const bgmRef = ref<HTMLAudioElement | null>(null)
const isMusicPlaying = ref(false)
const showMusicTip = ref(false)
const storedVolume = Number(localStorage.getItem('global-bgm-volume') ?? '60')
const volume = ref(Number.isFinite(storedVolume) ? Math.min(Math.max(storedVolume / 100, 0), 1) : 0.6)
let autoPlayTried = false

async function tryPlayMusic() {
  if (!bgmRef.value || autoPlayTried) return
  autoPlayTried = true
  try {
    await bgmRef.value.play()
    isMusicPlaying.value = true
    showMusicTip.value = false
  } catch (error) {
    console.warn('自动播放被阻止：', error)
    showMusicTip.value = true
  }
}

async function toggleMusic() {
  if (!bgmRef.value) return
  if (isMusicPlaying.value) {
    bgmRef.value.pause()
    isMusicPlaying.value = false
    return
  }
  try {
    await bgmRef.value.play()
    isMusicPlaying.value = true
    showMusicTip.value = false
  } catch (error) {
    console.warn('播放失败：', error)
    showMusicTip.value = true
  }
}

function applyVolume() {
  if (!bgmRef.value) return
  bgmRef.value.volume = volume.value
}

function onVolumeInput(event: Event) {
  const target = event.target as HTMLInputElement
  const nextValue = Number(target.value) / 100
  volume.value = Math.min(Math.max(nextValue, 0), 1)
  localStorage.setItem('global-bgm-volume', String(Math.round(volume.value * 100)))
  applyVolume()
}

function handleVisibilityChange() {
  if (!bgmRef.value) return
  if (document.hidden) {
    bgmRef.value.pause()
    isMusicPlaying.value = false
  } else if (!isMusicPlaying.value && autoPlayTried) {
    // 页面返回焦点后不强制播放，等待用户点击
    showMusicTip.value = true
  }
}

onMounted(() => {
  tryPlayMusic()
  applyVolume()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  if (bgmRef.value) {
    bgmRef.value.pause()
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style scoped lang="scss">
.bgm-audio {
  display: none;
}

.global-music {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 1000;
}

.music-panel {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.2s ease;
}

.music-panel:hover,
.music-panel:focus-within {
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
}

.music-toggle {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: none;
  border-radius: 999px;
  padding: 12px 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
  }
}

.music-icon {
  font-size: 1.2rem;
}

.volume-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 0;
  opacity: 0;
  pointer-events: none;
  overflow: hidden;
  transition: max-height 0.25s ease, opacity 0.25s ease;
}

.music-panel:hover .volume-control,
.music-panel:focus-within .volume-control {
  max-height: 120px;
  opacity: 1;
  pointer-events: auto;
}

.volume-label {
  font-size: 0.9rem;
  color: #4b5563;
}

.volume-slider {
  width: 160px;
  accent-color: #fbbf24;
}

.music-tip {
  background: rgba(31, 41, 55, 0.9);
  color: #fff;
  padding: 12px 18px;
  border-radius: 12px;
  max-width: 280px;
  line-height: 1.4;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  margin-bottom: 12px;
}

.music-fade-enter-active,
.music-fade-leave-active {
  transition: opacity 0.2s ease;
}

.music-fade-enter-from,
.music-fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .global-music {
    right: 16px;
    bottom: 16px;
  }

  .music-panel {
    padding: 12px;
  }

  .music-toggle {
    padding: 10px 18px;
  }

  .volume-slider {
    width: 140px;
  }
}
</style>

