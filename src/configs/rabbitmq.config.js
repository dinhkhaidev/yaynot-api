require("dotenv").config();
const rabbitmqConfig = (base) => {
  // if grow scale, should to use:
  // order.created.queue
  // order.cancel.queue
  // inventory.update.queue
  // email.send.queue
  // otp.verify.queue
  return {
    queue: {
      main: `${base}.queue.main`,
      retry: `${base}.queue.retry`,
      // retry30s: `${base}.queue.retry.30s`,
      dlx: `${base}.queue.dlx`,
    },
    exchange: {
      main: `${base}.exchange.main`,
      retry: `${base}.exchange.retry`,
      dlx: `${base}.exchange.dlx`,
    },
    key: {
      main: `${base}.routing.main`,
      retry: `${base}.routing.retry`,
      dlx: `${base}.routing.dlx`,
    },
  };
};
module.exports = rabbitmqConfig;
