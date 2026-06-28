require('dotenv').config();

async function checkAvailableModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return console.log("❌ LỖI: Chưa đọc được API Key từ file .env");
  }
  
  console.log("Đang kết nối với Google để lấy danh sách AI Model...");
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log("\n✅ API KEY NÀY ĐƯỢC PHÉP SỬ DỤNG CÁC MODEL SAU ĐÂY:");
      console.log("---------------------------------------------------");
      data.models.forEach(m => {
        // Chỉ in ra các model hỗ trợ chat/tạo nội dung
        if (m.supportedGenerationMethods.includes("generateContent")) {
          console.log(`👉 "${m.name.replace('models/', '')}"`);
        }
      });
      console.log("---------------------------------------------------");
      console.log("Bạn hãy copy 1 cái tên (có mũi tên 👉) dán vào code nhé!");
    } else {
      console.log("❌ Google báo lỗi:", data);
    }
  } catch (err) {
    console.error("❌ Lỗi mạng/Fetch:", err.message);
  }
}

checkAvailableModels();