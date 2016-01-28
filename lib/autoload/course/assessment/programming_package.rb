# frozen_string_literal: true
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
  # @overload initialize(path)
  #   @param [String|Pathname] path The path to the package on disk.
  # @overload initialize(stream)
  #   @param [IO] stream The stream to the file.
  def initialize(path_or_stream)
    case path_or_stream
    when String, Pathname
      @path = path_or_stream
    when IO
      @stream = path_or_stream
    else
      fail ArgumentError, 'Invalid path or stream object'
    end
  end

  # Gets the file path to the provided package.
  #
  # @return [String] The path to the file.
  # @return [nil] If the package is associated with a stream.
  def path
    if @file && @file.name.is_a?(String)
      @file.name
    elsif @path
      @path.to_s
    elsif @stream.is_a?(File)
      @stream.path
    end
  end

  # Closes the package.
  def close
    ensure_file_open!
    @file.close
    @file = nil
  end

  # Checks if the given programming package is valid.
  #
  # @return [Boolean]
  def valid?
    ensure_file_open!

    ['Makefile', 'submission/', 'tests/'].all? { |entry| @file.find_entry(entry).present? }
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
    if @path
      @file = Zip::File.open(@path.to_s)
    elsif @stream
      @file = Zip::File.new(@stream, true, true)
      @file.read_from_stream(@stream)
    end
    fail IllegalStateError unless @file
  end

  # Removes all submission files from the archive.
  def remove_submission_files
    @file.glob("#{SUBMISSION_PATH}/**/*").each do |entry|
      @file.remove(entry)
    end
  end
end
