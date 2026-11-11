const express = require('express');
const { Zalo } = require('zca-js');
const cors = require('cors');

const app = express();

// Bật CORS đầy đủ
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

let zalo = null;

// Khởi tạo bot an toàn, nếu lỗi cũng không làm sập server
try {
  const cookie = process.env.ZALO_COOKIE;
  const imei = process.env.ZALO_IMEI || "c37b42a3-89ef-4c12-8e10-9876543210ab";
  const userAgent = process.env.ZALO_USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

  if (cookie) {
    zalo = new Zalo({ cookie, imei, userAgent });
    console.log('✅ Khởi tạo Zalo Bot thành công!');
  } else {
    console.log('⚠️ Chưa cấu hình ZALO_COOKIE.');
  }
} catch (err) {
  console.error('❌ Lỗi khởi tạo Zalo Bot:', err.message);
}

app.get('/', (req, res) => {
  res.send('🚀 Zalo Bot Server cho Fast and Smile đang hoạt động!');
});

app.post('/send-mva', async (req, res) => {
  try {
    if (!zalo) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Zalo bot chưa được khởi tạo do thiếu hoặc sai ZALO_COOKIE.' 
      });
    }

    const { groupId, message } = req.body;
    if (!groupId || !message) {
      return res.status(400).json({ status: 'error', error: 'Thiếu groupId hoặc message' });
    }

    await zalo.sendMessage({ threadId: groupId, type: 'group', message: message });
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Lỗi khi gửi tin:', error);
    res.status(500).json({ status: 'error', error: error.toString() });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));
