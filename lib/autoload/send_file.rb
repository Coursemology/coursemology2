# frozen_string_literal: true
module SendFile
  # Makes the given file publicly accessible.
  #
  # @param [String] file The path to the local file.
  # @param [String] public_name The file's public name, by default set to the base name of the file.
  # @return [String] The url to the publicly accessible file
  def self.send_file(file, public_name = File.basename(file))
    # TODO: Support remote path and publish the file on the load balancing server.
    downloads_dir = Application::Application.config.x.public_download_folder
    public_dir = File.join(Rails.public_path, downloads_dir)

    temporary_dir = File.basename(Dir.mktmpdir(nil, public_dir))
    public_file = File.join(public_dir, temporary_dir, public_name)
    FileUtils.cp(file, public_file)

    URI.encode(File.join('/', downloads_dir, temporary_dir, public_name))
  end

  # Obtains the local path for the given publicly accessible file path.
  #
  # @param [String] path The URL to the publicly accessible file.
  # @return [String] The absolute file path to the publicly accessible file.
  def self.local_path(path)
    File.join(Rails.public_path, URI.decode(path))
  end
end
