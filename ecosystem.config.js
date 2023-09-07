module.exports = {
    apps : [
      {
        name: 'chatting',
        script    : "./worker.js",
        max_memory_restart: '300M',
        watch: true,
      },
      {
        name: 'web_chatting',
        script    : "./web_worker.js",
        max_memory_restart: '300M',
        watch: true,
      },
      {
        name: 'react_chatting',
        script    : "./react_worker.js",
        max_memory_restart: '300M',
        watch: true,
      }
    ]
  };