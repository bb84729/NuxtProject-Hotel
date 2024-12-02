<script setup>
import { useCookie } from '#app'; // 使用 Nuxt 提供的 useCookie

useHead({
  title: '會員登入-享樂酒店｜Enjoyment Luxury Hotel',
});
definePageMeta({
  name: 'login',
  layout: 'account', // 與文件名一致
});

const email = ref("");
const password = ref("");
const remember = ref(false);

const router = useRouter();
const authToken = useCookie('auth_token'); // 使用 cookie 來存 token

const login = async () => {
  if (!email.value || !password.value) {
    alert('請輸入帳號與密碼');
    return;
  }

  const payload = {
    email: email.value,
    password: password.value,
  };
console.log(payload);

  try {
    const response = await $fetch('https://freyja-rfio.onrender.com/api/v1/user/login', {
      method: 'POST',
      body: payload,
    });

    if (response.status) {
      alert('登入成功！');
      console.log(response.token);
      
      authToken.value = response.token; // 儲存 token 到 cookie
      console.log(authToken.value);
      
      if (remember.value) {
        authToken.value = response.token;
        authToken.maxAge = 30 * 24 * 60 * 60; // 設定 cookie 存活 30 天
      }
      router.push('/'); // 登入後跳轉到首頁
    } else {
      alert(`登入失敗：${response.message}`);
    }
  } catch (error) {
    console.error('登入過程中發生錯誤：', error);
    alert('登入失敗，請稍後再試！');
  }
};
</script>

<template>
  <div class="px-5 px-md-0">
    <div class="mb-10">
      <p class="mb-2 text-primary-100 fs-8 fs-md-7 fw-bold">
        享樂酒店，誠摯歡迎
      </p>
      <h1 class="text-neutral-0 fw-bold">
        立即開始旅程
      </h1>
    </div>

    <form @submit.prevent="login" class="mb-10">
      <div class="mb-4 fs-8 fs-md-7">
        <label class="mb-2 text-neutral-0 fw-bold" for="email">
          電子信箱
        </label>
        <input v-model="email" id="email" class="form-control p-4 text-neutral-100 fw-medium border-neutral-40" 
          placeholder="請輸入信箱" type="email">
      </div>
      <div class="mb-4 fs-8 fs-md-7">
        <label class="mb-2 text-neutral-0 fw-bold" for="password">
          密碼
        </label>
        <input v-model="password" id="password" class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
           placeholder="請輸入密碼" type="password">
      </div>
      <div class="d-flex justify-content-between align-items-center mb-10 fs-8 fs-md-7">
        <div class="form-check d-flex align-items-end gap-2 text-neutral-0">
          <input v-model="remember" id="remember" class="form-check-input" type="checkbox" value="">
          <label class="form-check-label fw-bold" for="remember">
            記住帳號
          </label>
        </div>
        <button class="text-primary-100 fw-bold text-decoration-underline bg-transparent border-0" type="button">
          忘記密碼？
        </button>
      </div>
      <button class="btn btn-primary-100 w-100 py-4 text-neutral-0 fw-bold" type="submit">
        會員登入
      </button>
    </form>

    <p class="mb-0 fs-8 fs-md-7">
      <span class="me-2 text-neutral-0 fw-medium">沒有會員嗎？</span>
      <NuxtLink to="/account/signup" class="text-primary-100 fw-bold text-decoration-underline bg-transparent border-0">
    <span>前往註冊</span>
  </NuxtLink>
    </p>
  </div>
</template>

<style lang="scss" scoped>
@import "bootstrap/scss/mixins/breakpoints";

$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1400px,
  xxxl: 1537px
);


input[type="password"] {
  font: small-caption;
  font-size: 1.5rem;
}

input::placeholder {
  color: #909090;
  font-size: 1rem;
  font-weight: 500;

  @include media-breakpoint-down(md) {
    font-size: 14px;
  }
}

.form-check-input {
  width: 1.5rem;
  height: 1.5rem;
}

.form-check-input:checked {
  background-color: #BF9D7D;
  border-color: #BF9D7D;
}
</style>