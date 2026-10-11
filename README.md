# SAMP Monitor - Cyberpunk UI

Website monitoring real-time untuk server San Andreas Multiplayer (SAMP).

## Fitur
- Query server SAMP via UDP protocol
- Tampilan modern cyberpunk (neon, scanline, Orbitron font)
- Auto-refresh setiap 15 detik
- Info: Nama server, Players, Gamemode, Language, Password, Address

## Cara Install & Jalankan

```bash
cd samp-monitor
npm install
npm start
```

Lalu buka browser: **http://localhost:3000**

## Dependencies
- `express` → web server

## Konfigurasi

Edit file `server.js` bagian atas:

```js
const SERVER_IP = '149.248.204.196';
const SERVER_PORT = 7011;
const WEB_PORT = 3000;
```

## Catatan
- Pastikan port UDP server bisa di-query
