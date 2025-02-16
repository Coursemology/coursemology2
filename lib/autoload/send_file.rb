# frozen_string_literal: true
module SendFile
  # Makes the given file publicly accessible.
  #
  # @param [String] file The path to the local file.
  # @param [String] public_name The file's public name, by default set to the base name of the file.
  # @return [String] The url to the publicly accessible file
  def self.send_file(file, public_name = File.basename(file))
    if Rails.env.production?
      send_file_production(file, public_name)
    else
      send_file_development(file, public_name)
    end
  end

  # Obtains the local path for the given publicly accessible file path.
  #
  # @param [String] path The URL to the publicly accessible file.
  # @return [String] The absolute file path to the publicly accessible file.
  def self.local_path(path)
    File.join(Rails.public_path, URI.decode_www_form_component(path))
  end

  def self.send_file_development(file, public_name)
    downloads_dir = Application::Application.config.x.public_download_folder
    public_dir = File.join(Rails.public_path, downloads_dir)

    temporary_dir = File.basename(Dir.mktmpdir(nil, public_dir))
    public_file = File.join(public_dir, temporary_dir, public_name)
    FileUtils.cp(file, public_file)
    Addressable::URI.encode(File.join('/', downloads_dir, temporary_dir, public_name))
  end

  def self.send_file_production(file, public_name)
    current_time = Time.now.to_i
    s3_key = "downloads/#{current_time}/#{public_name}"
    File.open(file, 'rb') do |f|
      S3_CLIENT.put_object({
        body: f,
        bucket: ENV.fetch('AWS_BUCKET', nil),
        key: s3_key
      })
    end

    signer = Aws::S3::Presigner.new(client: S3_CLIENT)
    signer.presigned_url(:get_object, bucket: S3_BUCKET.name, key: s3_key)
  end
end
