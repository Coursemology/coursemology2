# Sets up a programming evaluation, queues it for execution by evaluators, then returns the results.
class Course::Assessment::ProgrammingEvaluationService
  # The default timeout for the job to finish.
  DEFAULT_TIMEOUT = Course::Assessment::ProgrammingEvaluation::TIMEOUT

  # Represents a result of evaluating a package.
  class Result
    attr_reader :stdout, :stderr, :test_report

    def initialize(stdout, stderr, test_report)
      @stdout = stdout
      @stderr = stderr
      @test_report = test_report
    end
  end

  class << self
    # Executes the provided package.
    #
    # @param [Course] course The course which this evaluation belongs to. This is necessary to
    #   determine which workers get access to execute the package.
    # @param [Coursemology::Polyglot::Language] language The language runtime to use to run this
    #   package.
    # @param [Fixnum] memory_limit The memory limit for the evaluation, in MiB.
    # @param [Fixnum|ActiveSupport::Duration] time_limit The time limit for the evaluation, in
    #   seconds.
    # @param [String] package The path to the package. The package is assumed to be a valid package;
    #   no parsing is done on the package.
    # @param [nil|Fixnum] timeout The duration to elapse before timing out. When the operation
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
    @time_limit = time_limit
    @package = package
    @timeout = timeout || DEFAULT_TIMEOUT
  end

  # Creates the evaluation, waits for its completion, then returns the result.
  #
  # @return [Result]
  def execute
    evaluation = create_evaluation
    wait_for_evaluation(evaluation)
    Result.new(evaluation.stdout, evaluation.stderr, evaluation.test_report)
  ensure
    evaluation.destroy! if evaluation
  end

  # Creates a new evaluation, attaching the provided package and specifying all its input
  # parameters.
  #
  # @return [Course::Assessment::ProgrammingEvaluation]
  def create_evaluation
    package_path = SendFile.send_file(@package)
    Course::Assessment::ProgrammingEvaluation.create(
      course: @course, language: @language, package_path: package_path, memory_limit: @memory_limit,
      time_limit: @time_limit.to_i)
  end

  # Waits for the given evaluation to enter the finished state.
  #
  # @param [Course::Assessment::ProgrammingEvaluation] evaluation The evaluation to wait for.
  # @raise [Timeout::Error] When the evaluation timeout has elapsed.
  def wait_for_evaluation(evaluation)
    wait_result = evaluation.wait(timeout: @timeout,
                                  while_callback: -> { !evaluation.tap(&:reload).finished? })

    fail Timeout::Error if wait_result.nil?
  end
end
