import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 30,
  duration: "20m",
};

const BASE_URL = "http://127.0.0.1:61674";

const scenarios = [
  () => {
    http.get(BASE_URL);
    sleep(Math.random() * 3 + 1);
  },
  () => {
    http.get(BASE_URL);
    http.get(`${BASE_URL}/assets/index-DQ0ebBmb.js`);
    sleep(Math.random() * 1);
  },
  () => {
    http.get(`${BASE_URL}/favicon.ico`);
    http.get(`${BASE_URL}/robots.txt`);
    sleep(Math.random() * 2);
  },
  () => {
    http.get(BASE_URL);
    sleep(Math.random() * 5 + 3);
  },
];

export default function () {
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();
}