# frozen_string_literal: true

class FileUploader < CarrierWave::Uploader::Base
  # Include RMagick or MiniMagick support:
  # include CarrierWave::RMagick
  # include CarrierWave::MiniMagick

  # Override the directory where uploaded files will be stored.
  # This is a sensible default for uploaders that are meant to be mounted:
  def store_dir
    "uploads/attachments/#{partition_name(model.name)}"
  end

  def filename
    "#{model.name}.#{file.extension}"
  end

  # Manipulate the 'response-content-disposition' header to support file name.
  #
  # @param [String] filename The file name of the downloaded file.
  # @return [String] The url with options.
  def url(filename: nil, is_inline: false)
    response_content_disposition = url_inline?(is_inline, filename) ? 'inline;' : 'attachment;'
    query_option = { 'response-content-disposition' => response_content_disposition }
    query_option['response-content-disposition'] += " filename=\"#{CGI.escape('filename')}\"" if filename
    super(query: query_option)
  end

  # Provide a default URL as a default if there hasn't been a file uploaded:
  # def default_url
  #   # For Rails 3.1+ asset pipeline compatibility:
  #   # ActionController::Base.helpers.
  #       asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
  #
  #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
  # end

  # Process files as they are uploaded:
  # process :scale => [200, 300]
  #
  # def scale(width, height)
  #   # do something
  # end

  # Create different versions of your uploaded files:
  # version :thumb do
  #   process :resize_to_fit => [50, 50]
  # end

  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  # def extension_allowlist
  #   %w(jpg jpeg gif png)
  # end

  # Override the filename of the uploaded files:
  # Avoid using model.id or version_name here, see uploader/store.rb for details.
  # def filename
  #   "something.jpg" if original_filename
  # end

  private

  # Returns the name of the model in a split path form.
  # e.g. returns 'ab/cd/ef' for name 'abcdef'.
  def partition_name(name)
    name.scan(/.{2}/).first(3).join('/')
  end

  def url_inline?(is_inline, filename)
    return false unless filename

    is_inline && inline_whitelisted_for(filename)
  end

  def inline_whitelisted_for(filename)
    whitelisted_extensions.include? File.extname(filename)
  end

  def whitelisted_extensions
    ['.pdf']
  end
end
