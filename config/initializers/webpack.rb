# frozen_string_literal: true

Rails.application.configure do
  config.webpack.manifest_filename = 'manifest.json'
  config.webpack.output_dir = 'public/webpack'
  config.webpack.dev_server.port = 8080
  config.webpack.dev_server.manifest_port = 8080

  if Rails.env.development?
    config.webpack.dev_server.enabled = true
  else
    config.webpack.dev_server.enabled = false
  end
end
