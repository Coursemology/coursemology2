# frozen_string_literal: true
class Course::Material::ZipDownloadService
  class << self
    # Downloads the materials and zip them.
    #
    # @param [Course::Material::Folder] folder The folder containing the materials.
    # @param [Array<Course::Material>] materials The materials to be downloaded.
    # @return [String] The path to the zip file.
    def download_and_zip(folder, materials)
      service = new(folder, materials)
      service.download_and_zip
    end
  end

  def download_and_zip
    download_to_base_dir
    zip_base_dir
  end

  private

  def initialize(folder, materials)
    @folder = folder
    @materials = Array(materials)
    @base_dir = Dir.mktmpdir('coursemology-download-')
  end

  # Downloads the materials to the the base directory.
  def download_to_base_dir
    @materials.each do |material|
      download_material(material, @folder, @base_dir)
    end
  end

  # Zip the directory and write to the file.
  #
  # @return [String] The path to the zip file.
  def zip_base_dir
    output_file = @base_dir + '.zip'
    Zip::File.open(output_file, Zip::File::CREATE) do |zip_file|
      Dir["#{@base_dir}/**/**"].each do |file|
        zip_file.add(file.sub(File.join(@base_dir + '/'), ''), file)
      end
    end

    output_file
  end

  # Downloads the material and store it in the given directory.
  def download_material(material, folder, dir)
    file_path = Pathname.new(dir) + material.path.relative_path_from(folder.path)
    file_path.dirname.mkpath

    File.open(file_path, 'wb') do |file|
      material.attachment.open(binmode: true) do |attachment_stream|
        FileUtils.copy_stream(attachment_stream, file)
      end
    end
  end
end
