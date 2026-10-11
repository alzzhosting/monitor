const express = require('express');
const dgram = require('dgram');
const path = require('path');

// ====================== CONFIG ======================
const SERVER_IP = '149.248.204.196';
const SERVER_PORT = 7011;
const WEB_PORT = 3000;
const QUERY_TIMEOUT = 3000; // ms
// ====================================================

const app = express();

// Static files
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Query SAMP server using official UDP protocol
 */
function querySAMP(host, port) {
  return new Promise((resolve, reject) => {
    const socket = dgram.createSocket('udp4');
    const timeout = setTimeout(() => {
      socket.close();
      reject(new Error('Query timeout'));
    }, QUERY_TIMEOUT);

    // Build SAMP query packet
    // Header: "SAMP" + IP octets + port (little endian) + opcode 'i'
    const ipParts = host.split('.').map(Number);
    const packet = Buffer.alloc(11);
    packet.write('SAMP', 0);
    packet[4] = ipParts[0];
    packet[5] = ipParts[1];
    packet[6] = ipParts[2];
    packet[7] = ipParts[3];
    packet[8] = port & 0xFF;
    packet[9] = (port >> 8) & 0xFF;
    packet[10] = 0x69; // 'i' = info

    socket.on('message', (msg) => {
      clearTimeout(timeout);
      socket.close();

      try {
        let offset = 11;

        const passworded = msg.readUInt8(offset) === 1;
        offset += 1;

        const players = msg.readUInt16LE(offset);
        offset += 2;

        const maxplayers = msg.readUInt16LE(offset);
        offset += 2;

        const hostnameLen = msg.readUInt32LE(offset);
        offset += 4;
        const hostname = msg.toString('utf8', offset, offset + hostnameLen);
        offset += hostnameLen;

        const gamemodeLen = msg.readUInt32LE(offset);
        offset += 4;
        const gamemode = msg.toString('utf8', offset, offset + gamemodeLen);
        offset += gamemodeLen;

        const languageLen = msg.readUInt32LE(offset);
        offset += 4;
        const language = msg.toString('utf8', offset, offset + languageLen);

        resolve({
          hostname: hostname || 'Unknown Server',
          players,
          maxplayers,
          gamemode: gamemode || '-',
          language: language || '-',
          passworded,
          online: true,
          address: `${host}:${port}`
        });
      } catch (err) {
        reject(new Error('Failed to parse response'));
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      socket.close();
      reject(err);
    });

    socket.send(packet, 0, packet.length, port, host, (err) => {
      if (err) {
        clearTimeout(timeout);
        socket.close();
        reject(err);
      }
    });
  });
}

// API endpoint
app.get('/api/server', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  try {
    const data = await querySAMP(SERVER_IP, SERVER_PORT);
    res.json({ success: true, data });
  } catch (err) {
    res.json({
      success: false,
      error: err.message || 'Server offline or unreachable',
      data: {
        hostname: 'Server Offline',
        players: 0,
        maxplayers: 0,
        gamemode: '-',
        language: '-',
        passworded: false,
        online: false,
        address: `${SERVER_IP}:${SERVER_PORT}`
      }
    });
  }
});

// Fallback ke index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(WEB_PORT, () => {
  console.log(`\n🚀 SAMP Monitor running at http://localhost:${WEB_PORT}`);
  console.log(`📡 Monitoring: ${SERVER_IP}:${SERVER_PORT}\n`);
});
