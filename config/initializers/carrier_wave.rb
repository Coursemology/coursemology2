# frozen_string_literal: true
CarrierWave.configure do |config|
  config.storage = :file
  config.cache_dir = Rails.root.join('tmp/uploads')
end
