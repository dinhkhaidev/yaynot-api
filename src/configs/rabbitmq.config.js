require("dotenv").config();
const rabbitmqConfig = (base) => {
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
