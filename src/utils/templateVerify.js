const emailVerificationTemplate = (link_verify) => {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác thực tài khoản YayNot</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #1c1e21;
            line-height: 1.5;
        }
        .container {
            max-width: 480px;
            margin: 0 auto;
            background: #ffffff;
        }
        .header {
            padding: 48px 32px 32px;
            text-align: center;
        }
        .logo {
            font-size: 32px;
            font-weight: 700;
            color: #1877f2;
            margin-bottom: 16px;
            letter-spacing: -0.5px;
        }
        .content {
            padding: 0 32px 48px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1c1e21;
            margin-bottom: 16px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            color: #65676b;
            margin-bottom: 32px;
            text-align: center;
            line-height: 1.5;
        }
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        .verify-button {
            display: inline-block;
            background: #1877f2;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.2s ease;
        }
        .verify-button:hover {
            background: #166fe5;
        }
        .security-info {
            background: #f0f2f5;
            border-radius: 8px;
            padding: 16px;
            margin: 32px 0;
            text-align: center;
        }
        .security-text {
            font-size: 14px;
            color: #65676b;
            line-height: 1.4;
        }
        .footer {
            padding: 32px;
            text-align: center;
            border-top: 1px solid #e4e6ea;
        }
        .footer-text {
            font-size: 12px;
            color: #8a8d91;
            line-height: 1.4;
        }
        .footer-links {
            margin-top: 16px;
        }
        .footer-link {
            color: #8a8d91;
            text-decoration: none;
            font-size: 12px;
            margin: 0 8px;
        }
        .footer-link:hover {
            color: #1877f2;
        }
        @media (max-width: 600px) {
            .container {
                margin: 0;
            }
            .header, .content, .footer {
                padding-left: 24px;
                padding-right: 24px;
            }
            .title {
                font-size: 20px;
            }
            .message {
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">YayNot</div>
        </div>
        
        <div class="content">
            <h1 class="title">Xác thực email của bạn</h1>
            
            <p class="message">
                Chào mừng bạn đến với YayNot! Để hoàn tất đăng ký, vui lòng xác thực địa chỉ email của bạn.
            </p>
            
            <div class="button-container">
                <a href="${link_verify}" class="verify-button">
                    Xác thực email
                </a>
            </div>
            
            <div class="security-info">
                <div class="security-text">
                    Link này sẽ hết hạn sau 24 giờ. Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email.
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Email này được gửi từ YayNot. Nếu bạn có thắc mắc, hãy liên hệ với chúng tôi.
            </div>
            <div class="footer-links">
                <a href="#" class="footer-link">Trợ giúp</a>
                <a href="#" class="footer-link">Điều khoản</a>
                <a href="#" class="footer-link">Bảo mật</a>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

module.exports = {
  emailVerificationTemplate,
};
