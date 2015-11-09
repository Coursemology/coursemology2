class Course::Material::ZipDownloadJob < ApplicationJob
  include TrackableJob
  include FilenameSanitizer

  protected

  # Performs the download service.
  #
  # @param [String] folder The folder containing the materials.
  # @param [Array<Course::Material>] materials The materials to be downloaded.
  # @param [String] filename The name of the zip file, default set to the folder's name. This is
  #   useful when you don't want to use folder's name as the zip filename(such as root folder).
  def perform_tracked(folder, materials, filename = folder.name)
    zip_file = Course::Material::ZipDownloadService.download_and_zip(materials)
    redirect_to publish_file(zip_file, sanitize(filename) + '.zip')
  end

  # Makes the given file publicly accessible.
  #
  # @param [String] file The path to the local file.
  # @param [String] name The name of public visible file.
  # @return [String] The url to the public visible file
  def publish_file(file, name)
    # TODO: Support remote path and publish the file on the load balancing server.
    public_dir = File.join(Rails.public_path, 'downloads/', job.id)
    FileUtils.mkdir_p(public_dir) unless File.exist?(public_dir)

    public_file = File.join(public_dir, name)
    FileUtils.cp(file, public_file)
    public_file.sub(Rails.public_path.to_s, '')
  end
end
