module.exports = {
  apps: [{
    name: 'Trove Ethics Alliance Bot',
    instances: 'max',
    script: 'node application.js',
    error_file: 'logs/error.log',
    out_file: 'logs/output.log'
  }]
};
