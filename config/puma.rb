# frozen_string_literal: true

if Rails.env.production?
  # Change to match your CPU core count
  workers `cat /proc/cpuinfo | grep processor | wc -l`.to_i

  # Min and Max threads per worker
  threads 1, (ENV['RAILS_MAX_THREADS'] || 5)

  app_dir = File.expand_path('..', __dir__)
  tmp_dir = "#{app_dir}/tmp"

  # Default to production
  rails_env = ENV['RAILS_ENV'] || 'production'
  environment rails_env

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
    rescue StandardError
      ActiveRecord::ConnectionNotEstablished
    end
    ActiveRecord::Base.establish_connection(YAML.load_file("#{app_dir}/config/database.yml")[rails_env])
  end
end
