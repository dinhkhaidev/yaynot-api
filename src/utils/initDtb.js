const bcrypt = require("bcrypt");
const userModel = require("../models/user.model");
const templateModel = require("../models/template.model");
require("dotenv").config();
const initMongodb = async () => {
  const mongoose = require("mongoose");
  try {
    await mongoose.connect(process.env.URL_MONGODB);
    console.log("MongoDB connected");
    const passwordHash = await bcrypt.hash("admin123", 10);
    await userModel.create({
      user_name: "admin",
      user_email: "admin@gmail.com",
      user_password: passwordHash,
      user_role: "001",
    });
    await templateModel.create({
      name: "email-verify",
      html: `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác thực tài khoản YayNot</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #1c1e21; line-height: 1.5; }
        .container { max-width: 480px; margin: 0 auto; background: #ffffff; }
        .header { padding: 48px 32px 32px; text-align: center; }
        .logo { font-size: 32px; font-weight: 700; color: #1877f2; margin-bottom: 10px; }
        .content { padding: 0 32px 48px; }
        .title { font-size: 24px; font-weight: 600; color: #1c1e21; margin-bottom: 16px; text-align: center; }
        .message { font-size: 16px; color: #65676b; margin-bottom: 32px; text-align: center; }
        .button-container { text-align: center; }
        .verify-button { display: inline-block; background: #1877f2; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; }
        .verify-button:hover { background: #166fe5; }
        .security-info { background: #f0f2f5; border-radius: 8px; padding: 16px; margin: 32px 0; text-align: center; }
        .security-text { font-size: 14px; color: #65676b; }
        .footer { padding: 32px; text-align: center; border-top: 1px solid #e4e6ea; }
        .footer-text { font-size: 12px; color: #8a8d91; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">YayNot</div>
        </div>
        <div class="content">
            <h1 class="title">Xác thực email của bạn</h1>
            <p class="message">Chào mừng bạn đến với YayNot! Để hoàn tất đăng ký, vui lòng xác thực địa chỉ email của bạn.</p>
            

<div style="font-size: 16px;text-align: center; font-weight: 600; color: #333;">Mã xác thực của bạn</div>
    <div style="
        margin-top: 12px;
        padding: 14px 28px;
        margin: 10px 35px;
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 8px; /* khoảng cách giữa các ký tự */
        color: #000;
        border: 2px solid #ccc; /* viền nhẹ nổi bật */
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
	text-align: center;
        background-color: #fff; /* trắng, không màu nền */
    ">
        {otp_plain}
    </div>
    <div style="margin-top: 8px;text-align: center; font-size: 12px; color: #777;">Mã này sẽ hết hạn sau 15 phút.</div>
</div>

	<div class="button-container">
                <a href="{link_verify}" style="color:white;" class="verify-button">Xác thực email</a>
            </div>
            
            <div class="otp-container" style="text-align: center; margin: 25px 0;">
    


            <div class="security-info">
                <div class="security-text">Link này sẽ hết hạn sau 15 phút. Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email.</div>
            </div>
        </div>
        <div class="footer">
            <div class="footer-text">Email này được gửi từ YayNot. Nếu bạn có thắc mắc, hãy liên hệ với chúng tôi.</div>
        </div>
    </div>
</body>
</html>`,
    });
    console.log("Tạo user admin và template email thành công!");
    console.log(`user_name: "admin",
      user_email: "admin@gmail.com",
      user_password: admin123,
      user_role: "admin",`);
    console.log("✅ Init done. Exiting...");
    process.exit(0);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};
initMongodb();
