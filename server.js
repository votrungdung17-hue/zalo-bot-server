const express = require('express');
const { Zalo } = require('zca-js');

const app = express();
app.use(express.json());

// Bật CORS thủ công
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

let zalo = null;

// Hàm quét nhóm với bắt lỗi chi tiết
async function fetchAndLogGroups() {
  try {
    if (!zalo) return;
    console.log('🔄 Đang quét danh sách nhóm Zalo...');
    
    // Thử gọi danh sách nhóm
    const threadList = await zalo.getThreadList(); 
    console.log('========================================');
    console.log('📋 KẾT QUẢ QUÉT NHÓM:', threadList);
    console.log('========================================');
  } catch (err) {
    // In toàn bộ đối tượng lỗi thay vì chỉ mỗi message để soi cho chuẩn
    console.error('❌ LỖI CHI TIẾT KHI LẤY DANH SÁCH NHÓM:', err);
  }
}

async function initZaloBot() {
  const cookie = process.env.ZALO_COOKIE;
  const imei = process.env.ZALO_IMEI || "c37b42a3-89ef-4c12-8e10-9876543210ab";
  const userAgent = process.env.ZALO_USER_AGENT || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";

  if (cookie) {
    try {
      zalo = new Zalo({ cookie, imei, userAgent });
      console.log('✅ Khởi tạo Zalo Bot thành công!');
      
      // Chờ 3 giây rồi chạy hàm quét
      setTimeout(fetchAndLogGroups, 3000);
    } catch (err) {
      console.error('❌ Lỗi khởi tạo Zalo Bot:', err);
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
      return res.status(400).json({ status: 'error', error: 'Chưa cấu hình ZALO_COOKIE' });
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
