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
# It can also contain an optional 'solution' folder:
#
#   +solution/+: where syntax correct code is placed. When the package is uploaded by the
#   instructor as part of a question, the contents of this directory will replace the contents of
#   the 'submission' folder. This allows infinite loops or incorrect syntax to be used as templates
#   for the students to fix. It also allows solutions to be kept in the same place as the tests.
#   When this package is generated as part of auto grading, this folder is removed to prevent
#   student code from accessing it.
#
# Call {Course::Assessment::ProgrammingPackage#close} when changes have been made to persist the
# changes to disk. Duplicate the file before modifying if you do not want to modify the original
# file -- changes are made in-place.
class Course::Assessment::ProgrammingPackage
  # The path to the .meta file.
  META_PATH = Pathname.new('.meta').freeze

  # The path to the Makefile.
  MAKEFILE_PATH = Pathname.new('Makefile').freeze

  # The path to the submission.
  SUBMISSION_PATH = Pathname.new('submission').freeze

  # The path to the solution.
  SOLUTION_PATH = Pathname.new('solution').freeze

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
      raise ArgumentError, 'Invalid path or stream object'
    end
  end

  # Gets the file path to the provided package.
  #
  # @return [String] The path to the file.
  # @return [nil] If the package is associated with a stream.
  def path
    if @file
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

  # Commits the package changes to disk
  #
  # @return [Boolean] True if the file was saved.
  def save
    ensure_file_open!
    @file.commit
    true
  end

  # Checks if the given programming package is valid.
  #
  # @return [Boolean]
  def valid?
    ensure_file_open!

    ['Makefile', 'submission/', 'tests/'].all? { |entry| @file.find_entry(entry).present? }
  end

  # Gets the .meta file.
  #
  # @return [String] Contents of the .meta file.
  def meta_file
    get_file(META_PATH)
  rescue StandardError
    nil
  end

  # Gets the contents of all submission files.
  #
  # @return [Hash<Pathname, String>] A hash mapping the file path to the file contents of each
  #   file.
  def submission_files
    get_folder_files(SUBMISSION_PATH)
  end

  # Replaces the contents of all submission files.
  #
  # @param [Hash<Pathname|String, String>] files A hash mapping the file path to the file
  #   contents of each file.
  def submission_files=(files)
    ensure_file_open!
    remove_folder_files(SUBMISSION_PATH)

    files.each do |path, file|
      path = Pathname.new(path) unless path.is_a?(Pathname)
      raise ArgumentError, 'Paths must be relative' unless path.relative?

      @file.get_output_stream(SUBMISSION_PATH.join(path)) do |stream|
        stream.write(file)
      end
    end
  end

  # Remove the contents of the solution folder so students can't do sneaky things
  # like generating a report from the solution folder.
  def remove_solution_files
    remove_folder_files(SOLUTION_PATH)
  end

  # Gets the contents of all solution files.
  #
  # @return [Hash<Pathname, String>] A hash mapping the file path to the file contents of each
  #   file.
  def solution_files
    get_folder_files(SOLUTION_PATH)
  end

  # If a solution directory exists, replace the contents of the submission directory
  # with the contents of the solution directory.
  # Allows syntax incorrect templates since the import uses other files.
  def replace_submission_with_solution
    # Return if there are no files in the solution directory
    files = solution_files
    return if files.empty?

    self.submission_files = files
  end

  # Unzips the contents of the file to the destination folder.
  #
  # @param [String] Path to folder.
  def unzip_file(destination)
    ensure_file_open!
    @file.each do |entry|
      entry_path = File.join(destination, entry.name)
      FileUtils.mkdir_p(File.dirname(entry_path))
      @file.extract(entry, entry_path) unless File.exist?(entry_path)
    end
  end

  private

  # Ensures that the zip file is open.
  #
  # When a stream is open, some atypical code is required because Rubyzip doesn't support streams
  # in its API too well -- the entries in memory and loaded from stream are different.
  #
  # @raise [IllegalStateError] when the zip file is not open and it cannot be opened.
  def ensure_file_open!
    return if @file

    if @path
      @file = Zip::File.open(@path.to_s)
    elsif @stream
      @file = Zip::File.new(@stream&.path, true)
      @file.read_from_stream(@stream)
      @file.instance_variable_set(:@stored_entries, @file.instance_variable_get(:@entry_set).dup)
    end
    raise IllegalStateError unless @file
  end

  def remove_folder_files(folder_path)
    @file.glob("#{folder_path}/**/*").each do |entry|
      @file.remove(entry)
    end
  end

  # Get the contents of all files in the specified folder.
  #
  # @param [String] Path to folder.
  # @return [Hash<Pathname, String>] A hash mapping the file path to the file contents of each
  #   file.
  def get_folder_files(folder_path)
    ensure_file_open!
    @file.glob("#{folder_path}/**/*").map do |entry|
      entry_file_name = Pathname.new(entry.name)
      file_name = entry_file_name.relative_path_from(folder_path)
      [file_name, entry.get_input_stream(&:read)]
    end.to_h
  end

  # Get the contents of a file.
  #
  # @param [String] Path to file.
  # @return [String]
  def get_file(file_path)
    ensure_file_open!
    @file.read(file_path)
  end
end
