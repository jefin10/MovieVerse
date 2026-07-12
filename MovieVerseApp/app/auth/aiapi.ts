import axios from "axios";
const API_BASE_URL = (  process.env.EXPO_PUBLIC_AI_API_BASE_URL || 'https://movieversebackend.jefin.xyz/'  )?.trim();


const aiApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
    headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default aiApi;
