public_download_dir = File.join(Rails.public_path, Application.config.x.public_download_folder)

if Rails.env.development? || Rails.env.test?
  Dir.mkdir(public_download_dir) unless Dir.exist?(public_download_dir)
end

fail "#{public_download_dir} does not exist." unless Dir.exist?(public_download_dir)
