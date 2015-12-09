# Represents a programming package, containing the tests and submitted code for a given question.
#
# A package has these files at the very minimum:
#
# - +Makefile+: the makefile for building and executing the package. There are at least three
#   targets:
#   - +prepare+: for initialising the environment. This can be used to set up libraries or other
#     modifications to the package.
#   - +compile+: for building the package. For scripting languages, this is a no-op, but <b>must
#     still be defined</b>
#   - +test+: for testing the package. After completing the task, +tests.junit.xml+ must be found
#     in the root directory of the package (beside the +tests/+ directory)
# - +submission/+: where the template code/students' code will be placed. When this package is
#   uploaded by the instructor as part of a question, this directory will contain the templates
#   that will be used when a student first attempts the question. When this package is generated
#   as part of auto grading, then this contains all the student's submitted code.
# - +tests/+: where the tests will be placed. How this set of tests should be run is immaterial,
#   so long it is run when +make test+ is executed by the evaluator.
#
# Call {Course::Assessment::ProgrammingPackage#close} when changes have been made to persist the
# changes to disk. Duplicate the file before modifying if you do not want to modify the original
# file -- changes are made in-place.
class Course::Assessment::ProgrammingPackage
  # The path to the Makefile.
  MAKEFILE_PATH = Pathname.new('Makefile').freeze

  # The path to the submission.
  SUBMISSION_PATH = Pathname.new('submission').freeze

  # The path to the tests.
  TESTS_PATH = Pathname.new('tests').freeze

  # Creates a new programming package instance.
  #
  # @param [String|Pathname] path The path to the package on disk.
  def initialize(path)
    @path = path
  end

  # Gets the file path to the provided package.
  #
  # @return [String]
  def path
    @file ? @file.name : @path
  end

  # Closes the package.
  def close
    ensure_file_open!
    @file.close
    @file = nil
  end

  # Gets the contents of all submission files.
  #
  # @return [Hash<Pathname, String>] A hash mapping the file path to the file contents of each
  #   file.
  def submission_files
    ensure_file_open!
    @file.glob("#{SUBMISSION_PATH}/**/*").map do |entry|
      entry_file_name = Pathname.new(entry.name)
      submission_file_name = entry_file_name.relative_path_from(SUBMISSION_PATH)
      [submission_file_name, entry.get_input_stream.read]
    end.to_h
  end

  # Replaces the contents of all submission files.
  #
  # @param [Hash<Pathname|String, String>] files A hash mapping the file path to the file
  #   contents of each file.
  def submission_files=(files)
    ensure_file_open!
    remove_submission_files

    files.each do |path, file|
      path = Pathname.new(path) unless path.is_a?(Pathname)
      fail ArgumentError, 'Paths must be relative' unless path.relative?
      @file.get_output_stream(SUBMISSION_PATH.join(path)) do |stream|
        stream.write(file)
        stream.close
      end
    end
  end

  private

  # Ensures that the zip file is open.
  #
  # @raise [IllegalStateError] when the zip file is not open and it cannot be opened.
  def ensure_file_open!
    return if @file
    @file = Zip::File.open(@path.to_s)
  end

  # Removes all submission files from the archive.
  def remove_submission_files
    @file.glob("#{SUBMISSION_PATH}/**/*").each do |entry|
      @file.remove(entry)
    end
  end
end
