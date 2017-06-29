# frozen_string_literal: true

class CoursemologyDockerContainer < Docker::Container
  # The path to the Coursemology user home directory.
  HOME_PATH = '/home/coursemology'.freeze

  # The path to where the package will be extracted.
  PACKAGE_PATH = File.join(HOME_PATH, 'package')

  # The path to where the test report will be at.
  REPORT_PATH = File.join(PACKAGE_PATH, 'report.xml')

  class << self
    def create(image, argv: nil)
      pull_image(image) unless Docker::Image.exist?(image)

      ActiveSupport::Notifications.instrument('create.docker.evaluator.coursemology',
                                              image: image) do |payload|
        options = { 'Image' => image }
        options['Cmd'] = argv if argv.present?

        payload[:container] = super(options)
      end
    end

    private

    # Pulls the given image from Docker Hub.
    #
    # @param [String] image The image to pull.
    def pull_image(image)
      ActiveSupport::Notifications.instrument('pull.docker.evaluator.coursemology',
                                              image: image) do
        Docker::Image.create('fromImage' => image)
      end
    end
  end

  # Waits for the container to exit the Running state.
  #
  # This will time out for long running operations, so keep retrying until we return.
  #
  # @param [Fixnum|nil] time The amount of time to wait.
  # @return [Fixnum] The exit code of the container.
  def wait(time = nil)
    container_state = info
    while container_state.fetch('State', {}).fetch('Running', true)
      super
      refresh!
      container_state = info
    end

    container_state['State']['ExitCode']
  rescue Docker::Error::TimeoutError
    retry
  end

  # Gets the exit code of the container.
  #
  # @return [Fixnum] The exit code of the container, if +wait+ was called before.
  # @return [nil] If the container is still running, or +wait+ was not called.
  def exit_code
    info.fetch('State', {})['ExitCode']
  end

  def delete
    ActiveSupport::Notifications.instrument('destroy.docker.evaluator.coursemology',
                                            container: id) do
      super
    end
  end

  # Copies the contents of the package to the container.
  #
  # @param [String] package The path to the package.
  def copy_package(package)
    tar = tar_package(package)
    archive_in_stream(HOME_PATH) do
      tar.read(Excon.defaults[:chunk_size]).to_s
    end
  end

  def execute_package
    start!
    wait
  end

  # Gets the output that Coursemology is interested in.
  #
  # @return [Array<(String, String, String, Integer)>] The stdout, stderr, test report and exit
  #   code.
  def evaluation_result
    _, stdout, stderr = container_streams

    [stdout, stderr, extract_test_report, exit_code]
  end

  private

  # Converts the zip package into a tar package for the container.
  #
  # This also adds an additional +package+ directory to the start of the path, following tar
  # convention.
  #
  # @param [String] package The path to the package to convert to a tar.
  # @return [IO] A stream containing the tar.
  def tar_package(package)
    tar_file_stream = StringIO.new
    tar_file = Gem::Package::TarWriter.new(tar_file_stream)
    Zip::File.open(package) do |zip_file|
      copy_archive(zip_file, tar_file, File.basename(PACKAGE_PATH))
      tar_file.close
    end

    tar_file_stream.seek(0)
    tar_file_stream
  end

  # Copies every entry from the zip archive to the tar archive, adding the optional prefix to the
  # start of each file name.
  #
  # @param [Zip::File] zip_file The zip file to read from.
  # @param [Gem::Package::TarWriter] tar_file The tar file to write to.
  # @param [String] prefix The prefix to add to every file name in the tar.
  def copy_archive(zip_file, tar_file, prefix = nil)
    zip_file.each do |entry|
      next unless entry.file?

      zip_entry_stream = entry.get_input_stream
      new_entry_name = prefix ? File.join(prefix, entry.name) : entry.name
      tar_file.add_file(new_entry_name, 0o664) do |tar_entry_stream|
        IO.copy_stream(zip_entry_stream, tar_entry_stream)
      end

      zip_entry_stream.close
    end
  end

  # Gets the logs and parses them
  #
  # @return [Array<(String, String, String)>] The stdin, stdout, and stderr output.
  def container_streams
    log_stream = logs(stdout: true, stderr: true)
    parse_docker_stream(log_stream)
  end

  def extract_test_report
    stream = extract_test_report_archive

    tar_file = Gem::Package::TarReader.new(stream)
    tar_file.each do |file|
      test_report = file.read
      return test_report.force_encoding(Encoding::UTF_8) if test_report
    end
  rescue Docker::Error::NotFoundError
    return nil
  end

  # Extracts the test report from the container.
  #
  # @return [StringIO] The stream containing the archive, the pointer is reset to the start of the
  #   stream.
  def extract_test_report_archive
    stream = StringIO.new
    archive_out(REPORT_PATH) do |bytes|
      stream.write(bytes)
    end

    stream.seek(0)
    stream
  end

  # Represents one block of the Docker Attach protocol.
  DockerAttachBlock = Struct.new(:stream, :length, :bytes)

  # Parses a Docker +attach+ protocol stream into its constituent protocols.
  #
  # See https://docs.docker.com/engine/reference/api/docker_remote_api_v1.19/#attach-to-a-container.
  #
  # This drops all blocks belonging to streams other than STDIN, STDOUT, or STDERR.
  #
  # @param [String] string The input stream to parse.
  # @return [Array<(String, String, String)>] The stdin, stdout, and stderr output.
  def parse_docker_stream(string)
    result = [''.dup, ''.dup, ''.dup]
    stream = StringIO.new(string)

    while (block = parse_docker_stream_read_block(stream))
      next if block.stream >= result.length
      result[block.stream] << block.bytes
    end

    stream.close
    result
  end

  # Reads a block from the given stream, and parses it according to the Docker +attach+ protocol.
  #
  # @param [IO] stream The stream to read.
  # @raise [IOError] If the stream is corrupt.
  # @return [DockerAttachBlock] If there is data in the stream.
  # @return [nil] If there is no data left in the stream.
  def parse_docker_stream_read_block(stream)
    header = stream.read(8)
    return nil if header.blank?
    fail IOError unless header.length == 8

    console_stream, _, _, _, length = header.unpack('C4N')
    DockerAttachBlock.new(console_stream, length, stream.read(length))
  end
end
