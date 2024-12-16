<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Icon } from '@iconify/vue';
useHead({
  title: '預約房型-享樂酒店｜Enjoyment Luxury Hotel',
});
definePageMeta({
  name: 'booking',
  layout: 'front', // 與文件名一致
  middleware: ['auth']
});
const router = useRouter();
const route = useRoute();

const bookingDetails = ref({
  roomId: route.query.roomId || null,
  checkIn: route.query.checkIn || null,
  checkOut: route.query.checkOut || null,
  people: route.query.people || 1,
});

const roomDetail = reactive({
  data: null,
  loading: true,
  error: null,
});

const totalNights = ref(0);

const totalPrice = computed(() => {
  if (!roomDetail.data || totalNights.value <= 0) return 0;
  return roomDetail.data.price * totalNights.value;
});

const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
};

const fetchRoomDetail = async () => {
  if (!bookingDetails.value.roomId) {
    roomDetail.error = '無法找到對應的房型 ID。';
    roomDetail.loading = false;
    return;
  }

  try {
    const response = await $fetch(`https://freyja-rfio.onrender.com/api/v1/rooms/${bookingDetails.value.roomId}`);
    console.log('API 返回結果:', response);
    if (response.status) {
      roomDetail.data = response.result;
    } else {
      roomDetail.error = '無法加載房型資訊。';
    }
  } catch (err) {
    roomDetail.error = '請求房型資訊時發生錯誤。';
    console.error('API 請求錯誤:', err);
  } finally {
    roomDetail.loading = false;
  }
};

onMounted(async () => {
  totalNights.value = calculateNights(bookingDetails.value.checkIn, bookingDetails.value.checkOut);
  await fetchRoomDetail();
  console.log('房型資料:', roomDetail.data);
  console.log('總晚數:', totalNights.value);
  console.log('總價錢:', totalPrice.value);
});

const memberData = ref({
  name: '',
  phone: '',
  email: '',
  zipcode: '',
  address: '',
});

const authToken = useCookie('auth_token');

const fetchMemberData = async () => {
  if (!authToken.value) {
    alert('請先登入！');
    return;
  }

  try {
    const response = await $fetch('https://freyja-rfio.onrender.com/api/v1/user/', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken.value}`,
      },
    });
    console.log(response);
    
    if (response.status) {
      const { name, phone, email, address } = response.result;
      memberData.value = {
        name,
        phone,
        email,
        zipcode: address.zipcode || '',
        address: address.detail || '',
      };
    } else {
      alert('無法獲取會員資料，請稍後再試');
    }
  } catch (error) {
    console.error('API 請求錯誤:', error);
    alert('無法連接到伺服器，請稍後再試');
  }
};
const goBack = () =>
{
  router.back();
}
const isLoading = ref(false);

const confirmBooking = async () => {
  isLoading.value = true;

  const payload = {
    roomId: bookingDetails.value.roomId,
    checkInDate: bookingDetails.value.checkIn,
    checkOutDate: bookingDetails.value.checkOut,
    peopleNum: bookingDetails.value.people,
    userInfo: {
      address: {
        zipcode: memberData.value.zipcode,
        detail: memberData.value.address,
      },
      name: memberData.value.name,
      phone: memberData.value.phone,
      email: memberData.value.email,
    },
  };
console.log(payload);

  try {
    const response = await $fetch('https://freyja-rfio.onrender.com/api/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    console.log(response);
    

    if (response.status) {
      // 訂單建立成功，跳轉到確認頁面
      router.push({
        path: `/booking/confirmation/${response.result._id}`, // 假設 API 返回 orderId
      });
    } else {
      alert('訂單建立失敗，請稍後再試');
    }
  } catch (error) {
    console.error('建立訂單時發生錯誤:', error);
    alert('無法連接到伺服器，請稍後再試');
  } finally {
    isLoading.value = false;
  }
};

</script>

<template>
  <main class="pt-18 pt-md-30 bg-neutral-120">
    <section class="py-10 py-md-30 bg-primary-10">
      <div class="container">
        <button class="d-flex align-items-baseline gap-2 mb-10 bg-transparent border-0" type="button" @click="goBack">
          <Icon class="fs-5 text-neutral-100" icon="mdi:keyboard-arrow-left" />
          <h1 class="mb-0 text-neutral-100 fs-3 fw-bold">
            確認訂房資訊
          </h1>
        </button>
        <!-- 房型加載中或錯誤 -->
        <div v-if="roomDetail.loading" class="text-center">資料加載中...</div>
        <div v-else-if="roomDetail.error" class="text-center text-danger">{{ roomDetail.error }}</div>

        <div v-else class="row gap-10 gap-md-0">
          <div class="col-12 col-md-7">
            <section>
              <h2 class="mb-8 mb-md-10 text-neutral-100 fs-6 fs-md-4 fw-bold">
                訂房資訊
              </h2>
              <div class="d-flex flex-column gap-6">
                <div class="d-flex justify-content-between align-items-center text-neutral-100">
                  <div>
                    <h3 class="title-deco mb-2 fs-7 fw-bold">
                      選擇房型
                    </h3>
                    <p class="mb-0 fw-medium">
                      {{ roomDetail.data.name }}
                    </p>
                  </div>
                  <button class="bg-transparent border-0 fw-bold text-decoration-underline" type="button">
                    編輯
                  </button>
                </div>
                <div class="d-flex justify-content-between align-items-center text-neutral-100">
                  <div>
                    <h3 class="title-deco mb-2 fs-7 fw-bold">
                      訂房日期
                    </h3>
                    <p class="mb-2 fw-medium">
                      入住：{{ bookingDetails.checkIn }}
                    </p>
                    <p class="mb-0 fw-medium">
                      退房：{{ bookingDetails.checkOut }}
                    </p>
                  </div>
                  <button class="bg-transparent border-0 fw-bold text-decoration-underline" type="button">
                    編輯
                  </button>
                </div>
                <div class="d-flex justify-content-between align-items-center text-neutral-100">
                  <div>
                    <h3 class="title-deco mb-2 fs-7 fw-bold">
                      房客人數
                    </h3>
                    <p class="mb-0 fw-medium">
                      {{ bookingDetails.people }} 人
                    </p>
                  </div>
                  <button class="bg-transparent border-0 fw-bold text-decoration-underline" type="button">
                    編輯
                  </button>
                </div>
              </div>
            </section>

            <hr class="my-10 my-md-12 opacity-100 text-neutral-60">

            <section>
              <div class="d-flex justify-content-between align-items-center mb-10">
                <h2 class="mb-0 text-neutral-100 fs-6 fs-md-4 fw-bold">
                  訂房人資訊
                </h2>
                <button class="text-primary-100 bg-transparent border-0 fw-bold text-decoration-underline" type="button" @click="fetchMemberData">
                  套用會員資料
                </button>
              </div>

              <div class="d-flex flex-column gap-6">
                <div class="text-neutral-100">
                  <label for="name" class="form-label fs-8 fs-md-7 fw-bold">姓名</label>
                  <input v-model="memberData.name" id="name" type="text" class="form-control p-4 fs-8 fs-md-7 rounded-3" placeholder="請輸入姓名">
                </div>

                <div class="text-neutral-100">
                  <label for="phone" class="form-label fs-8 fs-md-7 fw-bold">手機號碼</label>
                  <input v-model="memberData.phone" id="phone" type="tel" class="form-control p-4 fs-8 fs-md-7 rounded-3" placeholder="請輸入手機號碼">
                </div>

                <div class="text-neutral-100">
                  <label for="email" class="form-label fs-8 fs-md-7 fw-bold">電子信箱</label>
                  <input v-model="memberData.email" id="email" type="email" class="form-control p-4 fs-8 fs-md-7 rounded-3" placeholder="請輸入電子信箱">
                </div>

                <div class="text-neutral-100">
                  <label for="address" class="form-label fs-8 fs-md-7 fw-bold">地址</label>
                  <div className="d-flex gap-2 mb-4">
                    <select class="form-select w-50 p-4 text-neutral-80 fs-8 fs-md-7 fw-medium rounded-3">
                      <option value="臺北市">
                        臺北市
                      </option>
                      <option value="臺中市">
                        臺中市
                      </option>
                      <option selected value="高雄市">
                        高雄市
                      </option>
                    </select>
                    <select class="form-select w-50 p-4 text-neutral-80 fs-8 fs-md-7 fw-medium rounded-3">
                      <option value="前金區">
                        前金區
                      </option>
                      <option value="鹽埕區">
                        鹽埕區
                      </option>
                      <option selected value="新興區">
                        新興區
                      </option>
                    </select>
                  </div>
                  <input
                    id="zipcode"
                    type="text"
                    class="form-control w-25 p-4 text-neutral-80 fs-8 fs-md-7 fw-medium rounded-3"
                    placeholder="郵遞區號"
                    v-model="memberData.zipcode"
                  />
                  <input v-model="memberData.address" id="address" type="text" class="form-control p-4 fs-8 fs-md-7 rounded-3" placeholder="請輸入詳細地址">
                </div>
              </div>
            </section>

            <hr class="my-10 my-md-12 opacity-100 text-neutral-60">

            <section>
              <h2 class="mb-8 mb-md-10 text-neutral-100 fs-6 fs-md-4 fw-bold">
                房間資訊
              </h2>
              <div class="d-flex flex-column gap-6">
                <section>
                  <h3 class="title-deco mb-4 mb-md-6 fs-7 fs-md-5 fw-bold">
                    房型基本資訊
                  </h3>
                  <ul class="d-flex gap-4 list-unstyled">
                    <li class="card-info px-4 py-5 bg-neutral-0 border border-primary-40 rounded-3">
                      <Icon class="mb-2 fs-5 text-primary-100" icon="fluent:slide-size-24-filled" />
                      <p class="mb-0 fw-bold text-neutral-80 text-nowrap">
                        {{ roomDetail.data.areaInfo }}
                      </p>
                    </li>
                    <li class="card-info px-4 py-5 bg-neutral-0 border border-primary-40 rounded-3">
                      <Icon class="mb-2 fs-5 text-primary-100" icon="material-symbols:king-bed" />
                      <p class="mb-0 fw-bold text-neutral-80 text-nowrap">
                        {{ roomDetail.data.bedInfo }}
                      </p>
                    </li>
                    <li class="card-info px-4 py-5 bg-neutral-0 border border-primary-40 rounded-3">
                      <Icon class="mb-2 fs-5 text-primary-100" icon="ic:baseline-person" />
                      <p class="mb-0 fw-bold text-neutral-80 text-nowrap">
                        最多 {{ roomDetail.data.maxPeople }} 人
                      </p>
                    </li>
                  </ul>
                </section>

                <!-- 房間格局 -->
            <section>
              <h3 class="title-deco mb-4 mb-md-6 text-neutral-100 fs-7 fs-md-5 fw-bold">房間格局</h3>
              <ul class="d-flex flex-wrap gap-6 gap-md-10 p-6 fs-8 fs-md-7 bg-neutral-0 rounded-3 list-unstyled">
                <li v-for="(layout, index) in roomDetail.data.layoutInfo" :key="index" class="d-flex gap-2">
                  <Icon class="fs-5 text-primary-100" icon="material-symbols:check" />
                  <p class="mb-0 text-neutral-80 fw-bold">{{ layout.title }}</p>
                </li>
              </ul>
            </section>

                 <!-- 房內設備 -->
              <section>
                <h3 class="title-deco mb-4 mb-md-6 text-neutral-100 fs-7 fs-md-5 fw-bold">房內設備</h3>
                <ul class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 rounded-3 list-unstyled">
                  <li v-for="(facility, index) in roomDetail.data.facilityInfo" :key="index" class="flex-item d-flex gap-2">
                    <Icon class="fs-5 text-primary-100" icon="material-symbols:check" />
                    <p class="mb-0 text-neutral-80 fw-bold">{{ facility.title }}</p>
                  </li>
                </ul>
              </section>

                <!-- 備品提供 -->
            <section>
              <h3 class="title-deco mb-4 mb-md-6 text-neutral-100 fs-7 fs-md-5 fw-bold">備品提供</h3>
              <ul class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 rounded-3 list-unstyled">
                <li v-for="(amenity, index) in roomDetail.data.amenityInfo" :key="index" class="flex-item d-flex gap-2">
                  <Icon class="fs-5 text-primary-100" icon="material-symbols:check" />
                  <p class="mb-0 text-neutral-80 fw-bold">{{ amenity.title }}</p>
                </li>
              </ul>
            </section>
              </div>
            </section>
          </div>

          <div class="col-12 col-md-5">
            <div
              class="confirm-form rounded-3xl d-flex flex-column gap-10 p-6 p-md-10 mx-auto ms-md-auto me-md-0 bg-neutral-0">
              <img class="img-fluid rounded-3" :src="roomDetail.data.imageUrl" alt="room-a">

              <div>
                <h2 className="mb-6 text-neutral-100 fs-6 fs-md-4 fw-bold">
                  價格詳情
                </h2>
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div class="d-flex align-items-center text-neutral-100 fw-medium">
                    <span>NT$ {{  roomDetail.data.price }}</span>
                    <Icon class="ms-2 me-1 text-neutral-80" icon="material-symbols:close" />
                    <span class="text-neutral-80">{{ totalNights }} 晚</span>
                  </div>
                  <span class="fw-medium">
                    NT$ {{ totalPrice }}
                  </span>
                </div>
                <!-- <div class="d-flex justify-content-between align-items-center fw-medium">
                  <p class="d-flex align-items-center mb-0 text-neutral-100">
                    住宿折扣
                  </p>
                  <span class="text-primary-100">
                    -NT$ 1,000
                  </span>
                </div> -->
                <hr class="my-6 opacity-100 text-neutral-40">
                <div class="d-flex justify-content-between align-items-center text-neutral-100 fw-bold">
                  <p class="d-flex align-items-center mb-0">
                    總價
                  </p>
                  <span>
                    NT$ {{ totalPrice }}
                  </span>
                </div>
              </div>

              <button class="btn btn-primary-100 py-4 text-neutral-0 fw-bold rounded-3" type="button"
                @click="confirmBooking">
                確認訂房
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  <RoomsBookingLoading v-if="isLoading" />
    
  </main>
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

.title-deco {
  display: flex;
  align-items: center;
}

.title-deco::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 24px;
  background-color: #BF9D7D;
  border-radius: 10px;
  margin-right: 0.75rem;
}

.form-control::placeholder {
  --neutral-60: #909090;
  color: var(--neutral-60);
  font-weight: 500;
}

.card-info {
  width: 97px;
  height: 97px;
}

.flex-item {
  flex: 1 1 15%;

  @include media-breakpoint-down(md) {
    flex-basis: 40%;
  }
}

.rounded-3xl {
  border-radius: 1.25rem;
}

.confirm-form {
  position: sticky;
  top: 160px;
  max-width: 478px;

  @include media-breakpoint-down(md) {
    position: static;
    top: 0;
    max-width: auto;
  }
}
</style>