# Switch off processing and to use the file storage in tests

if Rails.env.test? || Rails.env.cucumber?
  CarrierWave.configure do |config|
    config.enable_processing = false
  end

  CarrierWave::Uploader::Base.descendants.each do |klass|
    next if klass.anonymous?
    klass.class_eval do
      storage :file

      def cache_dir
        "#{Rails.root}/spec/support/uploads/tmp"
      end

      def store_dir
        "#{Rails.root}/spec/support/uploads/#{model.class.to_s.underscore}/#{model.id}"
      end
    end
  end
end
