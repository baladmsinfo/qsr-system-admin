import axios from "axios";
import { useSubscriptionStore } from "@/stores/subscription";
export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig();
  const axiosInstance = axios.create({
    baseURL: runtimeConfig.public.baseUrl,
  });
  axiosInstance.interceptors.request.use(
    (config) => {
      // Modify request config before sending the request
      //const token = useAuthStore().token;
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      // Handle request error
      return Promise.reject(error);
    }
  );
  axiosInstance.interceptors.response.use(
    async (response) => {
      // Handle successful response
      return response;
    },
    (error) => {
      // Handle response error
      if (error.response && error.response.status === 401) {
        useAuthStore().logout();
      }
      // The backend refused because of a plan limit - show the shared
      // upgrade prompt (screens still get the rejection as usual).
      const body = error.response?.data;
      if (body?.code === "SUBSCRIPTION_LIMIT_REACHED") {
        const subscription = useSubscriptionStore();
        subscription.showLimitPrompt({ ...(body.data || {}), message: body.message });
        subscription.fetchStatus();
      }
      return Promise.reject(error);
    }
  );
  return {
    provide: { axios: axiosInstance },
  };
});
