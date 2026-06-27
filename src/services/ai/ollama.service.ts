import axios from "axios";

const ollama = axios.create({
    baseURL: "http://localhost:11434"
});

export default ollama;