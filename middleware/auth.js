export default defineNuxtRouteMiddleware(() => {
  const authToken = useCookie('auth_token');
  console.log('111');
  
  if (!authToken.value) {
    return navigateTo('/');
  }
})