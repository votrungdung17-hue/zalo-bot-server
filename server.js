const express = require('express');
const { Zalo } = require('zca-js');

const app = express();
app.use(express.json());

// Bật CORS thủ công để trang web ở máy tính gọi sang không bị trình duyệt chặn
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

// Hàm tự động quét và in danh sách nhóm ra Logs để lấy ID chuẩn
async function fetchAndLogGroups() {
  try {
    if (!zalo) return;
    console.log('🔄 Đang quét danh sách nhóm Zalo của tài khoản bot...');
    const threadList = await zalo.getThreadList(0, 30); // Lấy 30 nhóm gần nhất
    console.log('========================================');
    console.log('📋 DANH SÁCH NHÓM ZALO ĐÃ TẢI THÀNH CÔNG:');
    threadList.forEach(thread => {
      // Lọc ra các nhóm chat (có threadId bắt đầu bằng chữ g)
      if (thread.threadId && thread.threadId.startsWith('g')) {
        console.log(`- Tên nhóm: ${thread.name} | Group ID: ${thread.threadId}`);
      }
    });
    console.log('========================================');
  } catch (err) {
    console.error('⚠️ Không thể tự động lấy danh sách nhóm:', err.message);
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
      
      // Chờ 2 giây sau khi khởi tạo rồi gọi hàm quét nhóm
      setTimeout(fetchAndLogGroups, 2000);
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
        error: 'Chưa cấu hình ZALO_COOKIE trên Render. Vui lòng kiểm tra lại Environment Variables.' 
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
