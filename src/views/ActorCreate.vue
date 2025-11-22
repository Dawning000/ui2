<template>
  <div class="actor-create">
    <h1>新增演员 / 导演</h1>

    <form class="form" @submit.prevent="onSubmit">
      <div class="row">
        <label>姓名</label>
        <input v-model.trim="form.name" placeholder="必填，如：张三" required />
      </div>

      <div class="row">
        <label>头像地址（可选）</label>
        <input v-model.trim="form.avatar" placeholder="图片 URL（可不填）" />
      </div>

      <div class="row">
        <label>出生日期</label>
        <input v-model="form.birthday" type="date" required />
      </div>

      <div class="row">
        <label>国籍</label>
        <input v-model.trim="form.nationality" placeholder="必填，如：中国" required />
      </div>

      <div class="row">
        <label>性别</label>
        <select v-model="form.gender" required>
          <option value="男">男</option>
          <option value="女">女</option>
          <option value="其他">其他</option>
        </select>
      </div>

      <div class="row">
        <label>生平简介</label>
        <textarea v-model.trim="form.biography" rows="5" placeholder="必填" required />
      </div>

      <div class="section">
        <div class="section-title">奖项（可选）</div>
        <div class="awards">
          <div v-if="!form.awards.length" class="hint">尚未添加奖项</div>
          <div v-for="(a, idx) in form.awards" :key="idx" class="award-item">
            <div class="row small">
              <label>奖项ID</label>
              <input v-model.number="a.id" type="number" min="1" required />
            </div>
            <div class="row small">
              <label>年份</label>
              <input v-model.number="a.year" type="number" min="1900" max="2100" required />
            </div>
            <div class="row small">
              <label>状态</label>
              <select v-model="a.status" required>
                <option value="nominated">提名</option>
                <option value="awarded">获奖</option>
              </select>
            </div>
            <div class="row flex1">
              <label>备注</label>
              <input v-model.trim="a.note" placeholder="如：凭《某电影》" required />
            </div>
            <button type="button" class="danger" @click="removeAward(idx)">删除</button>
          </div>
        </div>
        <button type="button" class="secondary" @click="addAward">+ 增加奖项</button>
      </div>

      <div class="actions">
        <button type="submit" :disabled="submitting">{{ submitting ? '提交中...' : '提交' }}</button>
        <button type="button" class="secondary" @click="goBack">取消</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { saveActor } from '@/api/actors'
import type { ActorSaveData, ActorAward } from '@/types/actors'

const router = useRouter()

const form = reactive<ActorSaveData & { avatar: string; awards: ActorAward[] }>({
  name: '',
  avatar: '',
  birthday: '',
  nationality: '',
  gender: '男',
  biography: '',
  awards: []
})

const submitting = ref(false)

function addAward() {
  form.awards!.push({ id: 1, year: new Date().getFullYear(), status: 'nominated', note: '' })
}

function removeAward(index: number) {
  if (!form.awards || !form.awards.length) return
  form.awards.splice(index, 1)
}

async function onSubmit() {
  if (!form.name || !form.birthday || !form.nationality || !form.gender || !form.biography) {
    alert('请完整填写必填项')
    return
  }
  submitting.value = true
  try {
    const payload: ActorSaveData = {
      name: form.name,
      birthday: form.birthday,
      nationality: form.nationality,
      gender: form.gender,
      biography: form.biography
    }
    if (form.avatar) payload.avatar = form.avatar
    if (form.awards && form.awards.length) payload.awards = form.awards
    await saveActor(payload)
    alert('保存成功')
    router.replace({ name: 'Actors' })
  } catch (e: any) {
    alert(`保存失败：${e?.message || e}`)
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.actor-create { padding: 24px; max-width: 880px; margin: 80px auto 40px; }
.form { display: flex; flex-direction: column; gap: 14px; background: #fff; border: 1px solid #f3f4f6; border-radius: 12px; padding: 20px; }
.row { display: flex; align-items: center; gap: 12px; }
.row.small { flex: 0 0 auto; }
.row.flex1 { flex: 1; }
label { width: 96px; color: #374151; }
input, select, textarea { flex: 1; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; }
.section { border-top: 1px solid #f3f4f6; padding-top: 12px; }
.section-title { font-weight: 700; margin-bottom: 8px; }
.awards { display: flex; flex-direction: column; gap: 10px; }
.hint { color: #6b7280; font-size: 12px; }
.award-item { display: flex; gap: 10px; align-items: center; }
.actions { display: flex; gap: 10px; margin-top: 4px; }
button { padding: 10px 16px; background: var(--primary-color); color: #fff; border: none; border-radius: 8px; cursor: pointer; }
button.secondary { background: #f3f4f6; color: #111827; }
button.danger { background: #ef4444; }
</style>


