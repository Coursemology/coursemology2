# frozen_string_literal: true
class Course::Assessment::Submission::BaseZipDownloadService
  def download_and_zip
    ActsAsTenant.without_tenant do
      download_to_base_dir
    end
    zip_base_dir
  end

  protected

  def initialize
    @base_dir = Dir.mktmpdir('coursemology-download-')
  end

  # Downloads each submission to its own folder in the base directory.
  def download_to_base_dir
    raise NotImplementedError, 'Subclasses must implement a download_to_base_dir method'
  end

  # Downloads each answer to its own folder in the submission directory.
  def download_answers
    raise NotImplementedError, 'Subclasses must implement a download_answers method'
  end

  def create_folder(parent, folder_name)
    normalized_name = Pathname.normalize_filename(folder_name)
    name_generator = FileName.new(File.join(parent, normalized_name),
                                  format: '(%d)', delimiter: ' ')
    name_generator.create.tap do |dir|
      Dir.mkdir(dir)
    end
  end

  # Zip the directory and write to the file.
  #
  # @return [String] The path to the zip file.
  def zip_base_dir
    output_file = "#{@base_dir}.zip"
    Zip::File.open(output_file, Zip::File::CREATE) do |zip_file|
      Dir["#{@base_dir}/**/**"].each do |file|
        zip_file.add(file.sub(File.join("#{@base_dir}/"), ''), file)
      end
    end

    output_file
  end
end
