const replaceHolderTemplate = (html, params) => {
  let content = html;
  Object.keys(params).forEach((key) => {
    const regex = new RegExp(`{${key}}`, "g");
    content = html.replace(regex, params[key]);
  });
  return content;
};
module.exports = { replaceHolderTemplate };
