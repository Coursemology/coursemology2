# frozen_string_literal: true
# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path
# Rails.application.config.assets.paths << Emoji.images_path

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
# Rails.application.config.assets.precompile += %w( search.js )

# For themes. See https://github.com/yoolk/themes_on_rails
Rails.application.configure do
  themes_path = "#{Rails.root}/app/themes/"
  assets_paths = [
    proc do |path, filename|
      filename =~ /app\/themes/ && !['.js', '.css'].include?(File.extname(path))
    end
  ]

  assets_paths += Dir["#{themes_path}*"].map { |path| "#{path.split('/').last}/all.js" }
  assets_paths += Dir["#{themes_path}*"].map { |path| "#{path.split('/').last}/all.css" }
  config.assets.precompile += assets_paths
end
