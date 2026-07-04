export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { $axios } = useNuxtApp();
  const runtimeConfig = useRuntimeConfig();
  let { data } = await $axios.get(
    runtimeConfig.public.API_ENDPOINT + "/admin/me"
  );
  if (!data.data) {
    useCookie("redirect", { path: "/" }).value = to.fullPath;
    return navigateTo("/");
  }
});
