RSpec.configure do |config|
  # Set file upload path in tests, using file storage
  config.before(:suite) do
    CarrierWave.configure do |carrier_wave_config|
      carrier_wave_config.enable_processing = false
    end

    CarrierWave::Uploader::Base.descendants.each do |klass|
      next if klass.anonymous?
      klass.class_eval do
        storage :file

        def cache_dir
          super # Just to run the superclass method, but we ignore the return value.
          "#{Rails.root}/spec/support/uploads/tmp"
        end

        def store_dir
          super # Just to run the superclass method, but we ignore the return value.
          "#{Rails.root}/spec/support/uploads/#{model.class.to_s.underscore}/#{model.id}"
        end
      end
    end
  end

  # Delete all the uploaded files after testing
  config.after(:suite) do
    FileUtils.rm_rf(Dir["#{Rails.root}/spec/support/uploads"])
  end
end
