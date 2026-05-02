# frozen_string_literal: true
case ENV['RAILS_ENV']
when 'development'
  CERT_PATH = File.expand_path('credentials/server.crt', __dir__)
  KEY_PATH = File.expand_path('credentials/server.key', __dir__)

  if File.exist?(CERT_PATH) && File.exist?(KEY_PATH)
    ssl_bind '127.0.0.1', '3000', {
      cert: CERT_PATH,
      key: KEY_PATH
    }
  else
    ENV['RAILS_USE_HTTP'] = '1'
  end

  environment 'development'
when 'production'
  # Change to match your CPU core count
  workers `cat /proc/cpuinfo | grep processor | wc -l`.to_i

  # Min and Max threads per worker
  threads 1, (ENV['RAILS_MAX_THREADS'] || 5)

  app_dir = File.expand_path('..', __dir__)
  tmp_dir = "#{app_dir}/tmp"

  environment 'production'

  # Set up socket location
  bind 'tcp://0.0.0.0:8107'

  # Set master PID and state locations
  pidfile "#{tmp_dir}/pids/puma.pid"
  state_path "#{tmp_dir}/pids/puma.state"
  activate_control_app

  on_worker_boot do
    require 'active_record'
    begin
      ActiveRecord::Base.connection.disconnect!
    rescue ActiveRecord::ConnectionNotEstablished => e
      puts e
    end
    ActiveRecord::Base.establish_connection(YAML.load_file("#{app_dir}/config/database.yml")[rails_env])
  end
end
