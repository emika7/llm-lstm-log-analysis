import http from "k6/http";
import { sleep } from "k6";

const BASE_URL = "http://127.0.0.1:61674";

export const options = {
  vus: 40,
  duration: "20m",
};

const normalPaths = ["/", "/assets/index-DQ0ebBmb.js", "/favicon.ico"];
const suspiciousPaths = ["/admin", "/.env", "/config", "/backup"];

export default function () {
  if (Math.random() < 0.90) {
    const path = normalPaths[Math.floor(Math.random() * normalPaths.length)];
    http.get(`${BASE_URL}${path}`);
    sleep(Math.random() * 2 + 0.5);
  } else {
    const path = suspiciousPaths[Math.floor(Math.random() * suspiciousPaths.length)];
    http.get(`${BASE_URL}${path}`);
    sleep(Math.random() * 3 + 1);
  }
}