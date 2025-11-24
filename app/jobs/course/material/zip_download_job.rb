# frozen_string_literal: true
class Course::Material::ZipDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :lowest

  protected

  # Performs the download service.
  #
  # @param [Course::Material::Folder] folder The folder containing the materials.
  # @param [Array<Course::Material>] materials The materials to be downloaded.
  # @param [String] filename The name of the zip file. This defaults to the name of the folder. This
  #   is useful when you don't want to use the name of the folder as the zip filename (such as the
  #   root folder).
  def perform_tracked(folder, materials, filename = folder.name)
    service = Course::Material::ZipDownloadService.new(folder, materials)
    zip_file = service.download_and_zip
    redirect_to SendFile.send_file(zip_file, "#{Pathname.normalize_filename(filename)}.zip")
  ensure
    service&.cleanup
  end
end
