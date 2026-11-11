const express = require('express');
const { Zalo } = require('zca-js');

const app = express();

// 1. ĐẶT CORS LÊN ĐẦU TIÊN ĐỂ XỬ LỂ TRIỆT ĐỂ YÊU CẦU OPTIONS (PREFLIGHT)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

let zalo = null;

function initZaloBot() {
  const cookie = process.env.ZALO_COOKIE;
  const imei = process.env.ZALO_IMEI || "c37b42a3-89ef-4c12-8e10-9876543210ab";
  const userAgent = process.env.ZALO_USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

  if (cookie) {
    try {
      zalo = new Zalo({ cookie, imei, userAgent });
      console.log('✅ Khởi tạo Zalo Bot thành công!');
    } catch (err) {
      console.error('❌ Lỗi khởi tạo Zalo Bot:', err.message);
    }
  } else {
    console.log('⚠️ Chưa cấu hình ZALO_COOKIE trên Environment Variables.');
  }
}

initZaloBot();

app.get('/', (req, res) => {
  res.send('🚀 Zalo Bot Server cho Fast and Smile đang hoạt động!');
});

app.post('/send-mva', async (req, res) => {
  try {
    if (!zalo) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Chưa cấu hình ZALO_COOKIE trên Render.' 
      });
    }

    const { groupId, message } = req.body;
    if (!groupId || !message) {
      return res.status(400).json({ status: 'error', error: 'Thiếu groupId hoặc message' });
    }

    await zalo.sendMessage({ threadId: groupId, type: 'group', message: message });
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Lỗi gửi tin:', error);
    res.status(500).json({ status: 'error', error: error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));
