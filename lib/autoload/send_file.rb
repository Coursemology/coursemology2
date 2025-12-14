# frozen_string_literal: true
module SendFile
  MULTIPART_CHUNK_SIZE = 10.megabytes
  MIN_MULTIPART_UPLOAD_SIZE = 10 * MULTIPART_CHUNK_SIZE

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
    File.open(file, 'rb') do |open_file|
      file_size = open_file.size
      if file_size >= MIN_MULTIPART_UPLOAD_SIZE
        s3_multipart_upload_file(open_file, s3_key)
      else
        s3_single_upload_file(open_file, s3_key)
      end
    end

    signer = Aws::S3::Presigner.new(client: S3_CLIENT)
    signer.presigned_url(:get_object, bucket: ENV.fetch('AWS_BUCKET', nil), key: s3_key)
  end

  def self.s3_single_upload_file(open_file, s3_key)
    S3_CLIENT.put_object({
      body: open_file,
      bucket: ENV.fetch('AWS_BUCKET', nil),
      key: s3_key
    })
  end

  def self.s3_multipart_upload_file(open_file, s3_key)
    upload_id = S3_CLIENT.create_multipart_upload({
      bucket: ENV.fetch('AWS_BUCKET', nil),
      key: s3_key
    })[:upload_id]
    parts = []
    part_number = 1

    while (chunk = open_file.read(MULTIPART_CHUNK_SIZE))
      etag = S3_CLIENT.upload_part({
        bucket: ENV.fetch('AWS_BUCKET', nil),
        key: s3_key,
        body: chunk,
        part_number: part_number,
        upload_id: upload_id
      })[:etag]

      parts << {
        etag: etag,
        part_number: part_number
      }

      part_number += 1
    end

    complete_response = S3_CLIENT.complete_multipart_upload({
      bucket: ENV.fetch('AWS_BUCKET', nil),
      key: s3_key,
      upload_id: upload_id,
      multipart_upload: {
        parts: parts
      }
    })
  ensure
    if upload_id.present? && complete_response.nil?
      S3_CLIENT.abort_multipart_upload({
        bucket: ENV.fetch('AWS_BUCKET', nil),
        key: s3_key,
        upload_id: upload_id
      })
    end
  end
end
