import http from "k6/http";
import { sleep } from "k6";

const BASE_URL = "http://127.0.0.1:61674";

export const options = {
  scenarios: {
    ddos: {
      executor: "constant-vus",
      vus: 200,
      duration: "2m",
      startTime: "0s",
      exec: "ddos",
    },
    scanning: {
      executor: "constant-vus",
      vus: 5,
      duration: "3m",
      startTime: "2m",
      exec: "scanning",
    },
    suspicious: {
      executor: "constant-vus",
      vus: 5,
      duration: "3m",
      startTime: "2m",
      exec: "suspicious",
    },
  },
};

export function ddos() {
  http.get(BASE_URL);
}

const scanPaths = [
  "/admin",
  "/wp-admin",
  "/phpmyadmin",
  "/.env",
  "/config",
  "/backup",
  "/login",
  "/administrator",
  "/wp-login.php",
  "/admin.php",
  "/.git",
  "/api/users",
  "/api/admin",
  "/secret",
  "/private",
  "/db",
  "/database",
  "/server-status",
  "/etc/passwd",
  "/../../../etc/passwd",
];

export function scanning() {
  const path = scanPaths[Math.floor(Math.random() * scanPaths.length)];
  http.get(`${BASE_URL}${path}`);
  sleep(0.5);
}

const suspiciousPaths = [
  "/?id=1' OR '1'='1",
  "/?search=<script>alert(1)</script>",
  "/?q='; DROP TABLE users;--",
  "/?file=../../etc/passwd",
  "/?page=../../../../windows/system32",
  "/?cmd=ls -la",
  "/?exec=whoami",
];

export function suspicious() {
  const path = suspiciousPaths[Math.floor(Math.random() * suspiciousPaths.length)];
  http.get(`${BASE_URL}${path}`);
  sleep(1);
}