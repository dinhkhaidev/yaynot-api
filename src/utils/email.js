const replaceHolderTemplate = (html, params) => {
  let content = html;
  Object.keys(params).forEach((key) => {
    const regex = new RegExp(`{${key}}`, "g");
    content = content.replace(regex, params[key]);
  });
  return content;
};
module.exports = { replaceHolderTemplate };
