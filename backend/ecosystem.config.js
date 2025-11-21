module.exports = {
  apps: [
    {
      name: 'kick-backend',
      script: 'src/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 4000,
        DB_DIALECT: process.env.DB_DIALECT || 'mysql'
      },
      out_file: 'logs/out.log',
      error_file: 'logs/error.log',
      merge_logs: true
    }
  ]
};
