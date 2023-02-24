# frozen_string_literal: true
# Sets up a programming evaluation, queues it for execution by evaluators, then returns the results.
class Course::Assessment::ProgrammingEvaluationService
  # The default timeout for the job to finish.
  DEFAULT_TIMEOUT = 5.minutes
  MEMORY_LIMIT = Course::Assessment::Question::Programming::MEMORY_LIMIT

  # The ratio to multiply the memory limits from our evaluation to the container by.
  MEMORY_LIMIT_RATIO = 1.megabyte / 1.kilobyte

  # Represents a result of evaluating a package.
  Result = Struct.new(:stdout, :stderr, :test_reports, :exit_code, :evaluation_id) do
    # Checks if the evaluation errored.
    #
    # This does not count failing test cases as an error, although the exit code is nonzero.
    #
    # @return [Boolean]
    def error?
      test_reports.values.all?(&:nil?) && exit_code != 0
    end

    # Checks if the evaluation exceeded its time limit.
    #
    # This uses a Bash behaviour where the exit code of a process is 128 + signal number, if the
    # process was terminated because of the signal.
    #
    # The time limit is enforced using SIGKILL.
    #
    # @return [Boolean]
    def time_limit_exceeded?
      exit_code == 128 + Signal.list['KILL']
    end

    # Obtains the exception suitable for this result.
    def exception
      return nil unless error?

      exception_class = time_limit_exceeded? ? TimeLimitExceededError : Error
      exception_class.new(exception_class.name, stdout, stderr)
    end
  end

  # Represents an error while evaluating the package.
  class Error < StandardError
    attr_reader :stdout, :stderr

    def initialize(message = self.class.name, stdout = nil, stderr = nil)
      super(message)
      @stdout = stdout
      @stderr = stderr
    end

    # Override to_h to provide a more detailed message in TrackableJob::Job#error
    def to_h
      {
        class: self.class.name,
        message: to_s,
        backtrace: backtrace,
        stdout: @stdout,
        stderr: @stderr
      }
    end
  end

  # Represents a Time Limit Exceeded error while evaluating the package.
  class TimeLimitExceededError < Error
  end

  class << self
    # Executes the provided package.
    #
    # @param [Coursemology::Polyglot::Language] language The language runtime to use to run this
    #   package.
    # @param [Integer] memory_limit The memory limit for the evaluation, in MiB.
    # @param [Integer|ActiveSupport::Duration] time_limit The time limit for the evaluation, in
    #   seconds.
    # @param [Integer|ActiveSupport::Duration] max_time_limit Max time limit.
    # @param [String] package The path to the package. The package is assumed to be a valid package;
    #   no parsing is done on the package.
    # @param [nil|Integer] timeout The duration to elapse before timing out. When the operation
    #   times out, a +Timeout::TimeoutError+ is raised. This is different from the time limit in
    #   that the time limit affects only the run time of the evaluation. The timeout includes
    #   waiting for abn evaluator, setting up the environment etc.
    # @return [Result] The result of evaluating the template.
    #
    # @raise [Timeout::Error] When the operation times out.
    def execute(language, memory_limit, time_limit, max_time_limit, package, timeout = nil)
      new(language, memory_limit, time_limit, max_time_limit, package, timeout).execute
    end
  end

  # Evaluate the package in a Docker container and return the output that matters.
  #
  # @return [Result]
  # @raise [Timeout::Error] When the evaluation timeout has elapsed.
  def execute
    stdout, stderr, test_reports, exit_code = Timeout.timeout(@timeout) { evaluate_in_container }
    Result.new(stdout, stderr, test_reports, exit_code)
  end

  private

  def initialize(language, memory_limit, time_limit, max_time_limit, package, timeout)
    @language = language
    @memory_limit = memory_limit || MEMORY_LIMIT
    @time_limit = time_limit ? [time_limit, max_time_limit].min : max_time_limit
    @package = package
    @timeout = timeout || DEFAULT_TIMEOUT
  end

  def create_container(image)
    image_identifier = "coursemology/evaluator-image-#{image}"
    CoursemologyDockerContainer.create(image_identifier, argv: container_arguments)
  end

  def container_arguments
    result = []
    result.push("-c#{@time_limit}") if @time_limit
    result.push("-m#{@memory_limit * MEMORY_LIMIT_RATIO}") if @memory_limit

    result
  end

  # Creates a container to run the evaluation, waits for its completion, then returns the
  # stuff Coursemology cares about.
  #
  # @return [Array<(String, String, String, Integer)>] The stdout, stderr, test report and exit
  #   code.
  def evaluate_in_container
    container = create_container(@language.class.docker_image)
    container.copy_package(@package)
    container.execute_package
    container.evaluation_result
  ensure
    container&.delete
  end
end
