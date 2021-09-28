# frozen_string_literal: true
public_download_dir = File.join(Rails.public_path, Application::Application.config.x.public_download_folder)

if Rails.env.development? || Rails.env.test?
  if Rails.env.test? && !ParallelTests.first_process?
    # Let all other processes wait until the first process created the folder
    sleep 0.5 until Dir.exist?(public_download_dir)
  end

  Dir.mkdir(public_download_dir) unless Dir.exist?(public_download_dir)
end

raise "#{public_download_dir} does not exist." unless Dir.exist?(public_download_dir)
