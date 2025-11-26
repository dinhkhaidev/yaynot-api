const header = require("../../constants/header.js");
const { BadRequestError, NotFoundError } = require("../../core/error.response");
const { OK, CREATED } = require("../../core/success.response");
const AuthService = require("../../services/auth.service.js");
const {
  sendEmailVerifyStateless,
  getOtpToken,
} = require("../../services/email.service.js");

class AccessController {
  signUp = async (req, res, next) => {
    new CREATED({
      message: "Register successful!",
      metadata: await AuthService.register({
        ...req.body,
        deviceInfo: {
          deviceId: req.headers[header.DEVICE_ID] || null,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"] || "unknown",
        },
      }),
    }).send(res);
  };
  login = async (req, res, next) => {
    new OK({
      message: "Login successful!",
      metadata: await AuthService.login({
        ...req.body,
        deviceInfo: {
          deviceId: req.headers[header.DEVICE_ID] || null,
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"] || "unknown",
        },
      }),
    }).send(res);
  };
  logout = async (req, res, next) => {
    new OK({
      message: "Logged out successful!",
      metadata: await AuthService.logout({
        sessionId: req.user.sessionId,
        accessToken: req.accessToken,
        userId: req.user.user_id,
      }),
    }).send(res);
  };
  handleToken = async (req, res, next) => {
    new OK({
      message: "Get token successful!",
      metadata: await AuthService.refreshToken({
        userId: req.user.user_id,
        sessionId: req.user.sessionId,
        oldRefreshToken: req.oldRefreshToken,
      }),
    }).send(res);
  };

  resendOtp = async (req, res, next) => {
    await sendEmailVerifyStateless({ email: req.body.email });

    //Wait a bit for worker to generate token
    await new Promise((resolve) => setTimeout(resolve, 1000));
    new OK({
      message: "Send otp successful!",
      metadata: await getOtpToken(req.body.email),
    }).send(res);
  };

  //direct link
  verifyEmail = async (req, res, next) => {
    new OK({
      message: "Verify otp successful!",
      metadata: await AuthService.verifyStatelessOtpLink({
        token: req.query.token,
      }),
    }).send(res);
  };
  //verify otp manual
  verifyOtp = async (req, res, next) => {
    new OK({
      message: "Verify otp successful!",
      metadata: await AuthService.verifyStatelessOtpManual({
        otp: req.body.otp,
        token: req.body.token,
      }),
    }).send(res);
  };

  logoutAll = async (req, res) => {
    const { userId } = req.user;
    new OK({
      message: "Logged out from all devices",
      metadata: await AuthService.logoutAll({
        userId,
        currentAccessToken: req.accessToken,
      }),
    }).send(res);
  };

  getActiveSessions = async (req, res) => {
    const { userId } = req.user;
    new OK({
      message: "Active sessions retrieved",
      metadata: await AuthService.getActiveSessions(userId),
    }).send(res);
  };

  revokeSession = async (req, res) => {
    const { userId } = req.user;
    const { sessionId } = req.params;
    new OK({
      message: "Session revoked successfully",
      metadata: await AuthService.revokeSpecificSession({ userId, sessionId }),
    }).send(res);
  };
}
module.exports = new AccessController();
