# Testing on Your Phone (Same Network)

`localhost` on your phone points to the phone itself, so `http://domono.superealestate.localhost:3000` will not work on mobile. Use your computer’s IP instead.

## 1. Get your machine’s IP

- **Mac/Linux:** `ifconfig | grep "inet "` or `ip addr` and use the `192.168.x.x` (or `10.x.x.x`) address.
- **Windows:** `ipconfig` and use the IPv4 address for your Wi‑Fi adapter.

Example: `192.168.1.100`

## 2. Run dev servers so they’re reachable from the network

- **Frontend (React)** – listen on all interfaces:
  ```bash
  cd frontend
  HOST=0.0.0.0 npm start
  ```
- **Backend (Go)** – ensure it listens on `0.0.0.0:8080` (not only `127.0.0.1`).

## 3. Open the app on your phone

- Phone and computer must be on the **same Wi‑Fi**.
- In the phone browser use (replace `192.168.1.100` with your IP):

  **Option A – Connect by IP (recommended; no DNS/hosts needed)**  
  - **Tenant (e.g. domono):**  
    `http://192.168.1.100:3000/listings?tenant=domono`  
  - **Main site:**  
    `http://192.168.1.100:3000`  

  **Option B – Subdomain hostname** (only if that hostname resolves, e.g. via hosts or DNS):  
  - **Subdomain:**  
    `http://domono.superealestate.192.168.1.100:3000/listings`  
  - **Main site:**  
    `http://superealestate.192.168.1.100:3000`  

When you use the IP with `?tenant=domono`, the frontend connects to the API at the same IP and sends the tenant in the `X-Tenant` header so the backend can resolve the subdomain. When you use the subdomain hostname, the frontend detects the pattern and also connects by IP and sends `X-Tenant`, so the browser does not need to resolve the long hostname.
