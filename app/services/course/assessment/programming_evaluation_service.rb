# frozen_string_literal: true
# Sets up a programming evaluation, queues it for execution by evaluators, then returns the results.
class Course::Assessment::ProgrammingEvaluationService
  # The default timeout for the job to finish.
  DEFAULT_TIMEOUT = Course::Assessment::ProgrammingEvaluation::TIMEOUT
  CPU_TIMEOUT = Course::Assessment::ProgrammingEvaluation::CPU_TIMEOUT

  # Represents a result of evaluating a package.
  Result = Struct.new(:stdout, :stderr, :test_report, :exit_code, :evaluation_id) do
    # Checks if the evaluation errored.
    #
    # This does not count failing test cases as an error, although the exit code is nonzero.
    #
    # @return [Boolean]
    def error?
      test_report.nil? && exit_code != 0
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
    attr_reader :stdout
    attr_reader :stderr

    def initialize(message = self.class.name, stdout = nil, stderr = nil)
      super(message)
      @stdout = stdout
      @stderr = stderr
    end
  end

  # Represents a Time Limit Exceeded error while evaluating the package.
  class TimeLimitExceededError < Error
  end

  class << self
    # Executes the provided package.
    #
    # @param [Course] course The course which this evaluation belongs to. This is necessary to
    #   determine which workers get access to execute the package.
    # @param [Coursemology::Polyglot::Language] language The language runtime to use to run this
    #   package.
    # @param [Integer] memory_limit The memory limit for the evaluation, in MiB.
    # @param [Integer|ActiveSupport::Duration] time_limit The time limit for the evaluation, in
    #   seconds.
    # @param [String] package The path to the package. The package is assumed to be a valid package;
    #   no parsing is done on the package.
    # @param [nil|Integer] timeout The duration to elapse before timing out. When the operation
    #   times out, a +Timeout::TimeoutError+ is raised. This is different from the time limit in
    #   that the time limit affects only the run time of the evaluation. The timeout includes
    #   waiting for abn evaluator, setting up the environment etc.
    # @return [Result] The result of evaluating the template.
    #
    # @raise [Timeout::Error] When the operation times out.
    def execute(course, language, memory_limit, time_limit, # rubocop:disable Metrics/ParameterLists
                package, timeout = nil)
      new(course, language, memory_limit, time_limit, package, timeout).send(:execute)
    end
  end

  private

  def initialize(course, language, memory_limit, # rubocop:disable Metrics/ParameterLists
                 time_limit, package, timeout)
    @course = course
    @language = language
    @memory_limit = memory_limit
    @time_limit = time_limit || CPU_TIMEOUT
    @package = package
    @timeout = timeout || DEFAULT_TIMEOUT
  end

  # Creates the evaluation, waits for its completion, then returns the result.
  #
  # @return [Result]
  def execute
    evaluation = create_evaluation
    wait_for_evaluation(evaluation)
    Result.new(evaluation.stdout, evaluation.stderr, evaluation.test_report,
               evaluation.exit_code, evaluation.id)
  ensure
    evaluation.destroy! if evaluation
  end

  # Creates a new evaluation, attaching the provided package and specifying all its input
  # parameters.
  #
  # @return [Course::Assessment::ProgrammingEvaluation]
  def create_evaluation
    Course::Assessment::ProgrammingEvaluation.create(
      course: @course, language: @language, package_path: @package, memory_limit: @memory_limit,
      time_limit: @time_limit
    )
  end

  # Waits for the given evaluation to enter the finished state.
  #
  # @param [Course::Assessment::ProgrammingEvaluation] evaluation The evaluation to wait for.
  # @raise [Timeout::Error] When the evaluation timeout has elapsed.
  def wait_for_evaluation(evaluation)
    wait_result = evaluation.wait(timeout: @timeout,
                                  while_callback: -> { !evaluation.tap(&:reload).finished? })

    raise Timeout::Error if wait_result.nil?
  end
end
