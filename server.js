const express = require('express');
const { Zalo } = require('zca-js');

const app = express();
app.use(express.json());

let zalo = null;

// Hàm khởi tạo Zalo bot an toàn
function initZaloBot() {
  const cookie = process.env.ZALO_COOKIE;
  const imei = process.env.ZALO_IMEI;
  const userAgent = process.env.ZALO_USER_AGENT;

  if (cookie && imei && userAgent) {
    try {
      zalo = new Zalo({ cookie, imei, userAgent });
      console.log('✅ Khởi tạo Zalo Bot thành công!');
    } catch (err) {
      console.error('❌ Lỗi khởi tạo Zalo Bot:', err.message);
    }
  } else {
    console.log('⚠️ Chưa cấu hình ZALO_COOKIE, ZALO_IMEI hoặc ZALO_USER_AGENT trên Environment Variables.');
  }
}

// Khởi chạy kiểm tra Zalo Bot
initZaloBot();

app.get('/', (req, res) => {
  res.send('Zalo Bot Server đang hoạt động!');
});

app.post('/send-mva', async (req, res) => {
  try {
    if (!zalo) {
      return res.status(400).json({ 
        status: 'error', 
        error: 'Chưa cấu hình tài khoản Zalo trên Server. Vui lòng thêm Environment Variables.' 
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
