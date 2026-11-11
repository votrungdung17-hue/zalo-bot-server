const express = require('express');
const { Zalo } = require('zca-js');

const app = express();
app.use(express.json());

// Khởi tạo Zalo Bot
// (Lưu ý: Sau khi deploy xong ta sẽ cập nhật Cookie/IMEI tài khoản Zalo cá nhân ca trực vào đây)
const zalo = new Zalo({
  cookie: process.env.ZALO_COOKIE || "",
  imei: process.env.ZALO_IMEI || "",
  userAgent: process.env.ZALO_USER_AGENT || ""
});

app.post('/send-mva', async (req, res) => {
  try {
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
app.listen(PORT, () => console.log(`Bot Server running on port ${PORT}`));
