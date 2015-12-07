class Course::Material::ZipDownloadJob < ApplicationJob
  include TrackableJob

  protected

  # Performs the download service.
  #
  # @param [Course::Material::Folder] folder The folder containing the materials.
  # @param [Array<Course::Material>] materials The materials to be downloaded.
  # @param [String] filename The name of the zip file. This defaults to the name of the folder. This
  #   is useful when you don't want to use the name of the folder as the zip filename (such as the
  #   root folder).
  def perform_tracked(folder, materials, filename = folder.name)
    zip_file = Course::Material::ZipDownloadService.download_and_zip(folder, materials)
    redirect_to publish_file(zip_file, Pathname.normalize_filename(filename) + '.zip')
  end

  # Makes the given file publicly accessible.
  #
  # @param [String] file The path to the local file.
  # @param [String] name The name of public visible file.
  # @return [String] The url to the public visible file
  def publish_file(file, name)
    # TODO: Support remote path and publish the file on the load balancing server.
    downloads_dir = 'downloads/'
    public_dir = File.join(Rails.public_path, downloads_dir, job.id)
    FileUtils.mkdir_p(public_dir) unless File.exist?(public_dir)

    public_file = File.join(public_dir, name)
    FileUtils.cp(file, public_file)

    URI.encode(File.join('/', downloads_dir, job.id, File.basename(public_file)))
  end
end
