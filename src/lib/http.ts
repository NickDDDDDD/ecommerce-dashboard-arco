import axios from "axios";

const instance = axios.create({
  baseURL: "/api",
});

instance.interceptors.request.use((config) => {
  // add request interceptors here

  return config;
});

instance.interceptors.response.use(
  // add response interceptors here

  (response) => {
    // Handle successful responses
    console.log("response success", response);
    return response;
  },
  (error) => {
    // Handle errors
    console.error("response error", error);

    return Promise.reject(error);
  },
);

export default instance;
