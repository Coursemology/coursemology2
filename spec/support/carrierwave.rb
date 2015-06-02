module CarrierWave::TestGroupHelpers
  module BaseClassMethods
    def inherited(class_)
      class_.prepend(DirectoryOverrides)
    end
  end

  module DirectoryOverrides
    def self.prepended(class_)
      class_.storage :file
    end

    UPLOADS_DIR = "#{Rails.root}/spec/support/uploads"

    def cache_dir
      super # Just to run the superclass method, but we ignore the return value.
      "#{UPLOADS_DIR}/tmp"
    end

    def store_dir
      super # Just to run the superclass method, but we ignore the return value.
      "#{UPLOADS_DIR}/#{model.class.to_s.underscore}/#{model.id}"
    end
  end
end

RSpec.configure do |config|
  # Set file upload path in tests, using file storage
  config.before(:suite) do
    CarrierWave.configure do |carrier_wave_config|
      carrier_wave_config.enable_processing = false
    end

    # Override the cache_dir and store_dir for all known subclasses, as well as subclasses which
    # will be defined in future.
    CarrierWave::Uploader::Base.descendants.each do |klass|
      next if klass.anonymous?
      klass.prepend(CarrierWave::TestGroupHelpers::DirectoryOverrides)
    end
    CarrierWave::Uploader::Base.extend(CarrierWave::TestGroupHelpers::BaseClassMethods)
  end

  # Delete all the uploaded files after testing
  config.after(:suite) do
    FileUtils.rm_rf(Dir["#{Rails.root}/spec/support/uploads"])
  end
end
