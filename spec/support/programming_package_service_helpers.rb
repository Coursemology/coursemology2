# frozen_string_literal: true
# Helpers for specs of the online editor's language package services, which turn the question
# form's parameters into a programming package.
module ProgrammingPackageServiceHelpers
  # Stands in for the question's AttachmentReference: the package services only ever open the
  # previous package with a block.
  PreviousPackage = Struct.new(:path) do
    def open(**, &block)
      File.open(path, 'rb', &block)
    end
  end

  def uploaded_file(filename, content)
    file = Tempfile.new(['upload', File.extname(filename)])
    file.write(content)
    file.close
    Rack::Test::UploadedFile.new(file.path, 'text/plain', original_filename: filename)
  end

  def package_params(**fields)
    ActionController::Parameters.new(
      question_programming: {
        autograded: 'true',
        prepend: '',
        append: '',
        test_cases: { public: [expression: 'f()', expected: '1', hint: ''] }
      }.merge(fields)
    )
  end

  # @return [Hash{String => String}] The package's files, by path.
  def package_files(package)
    Zip::File.open(package.path) do |zip|
      zip.entries.reject(&:directory?).to_h { |entry| [entry.name, entry.get_input_stream.read] }
    end
  end

  def package_meta(package)
    JSON.parse(package_files(package)['.meta'])
  end
end
