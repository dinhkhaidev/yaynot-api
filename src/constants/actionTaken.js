/**
 * Action Taken - Hành động được thực hiện sau khi review report
 */

const actionTaken = {
  NONE: "none", // Không có hành động
  HIDE_CONTENT: "hide_content", // Ẩn nội dung
  DELETE_CONTENT: "delete_content", // Xóa nội dung
  WARN_USER: "warn_user", // Cảnh báo người dùng
  BAN_USER: "ban_user", // Cấm người dùng
  RESTRICT_USER: "restrict_user", // Hạn chế người dùng
};

module.exports = actionTaken;
