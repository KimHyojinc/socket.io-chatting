module.exports = {
    apps : [{
      name: 'chatting',
      script    : "worker.js",
      max_memory_restart: '300M',
      watch: true,
    }]
  };