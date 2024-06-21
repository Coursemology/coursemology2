# frozen_string_literal: true
# Sets up a programming evaluation, queues it for execution by codaveri evaluators, then returns the results.
class Course::Assessment::ProgrammingCodaveriEvaluationService
  # The default timeout for the job to finish.
  DEFAULT_TIMEOUT = 5.minutes
  MEMORY_LIMIT = Course::Assessment::Question::Programming::MEMORY_LIMIT

  POLL_INTERVAL_SECONDS = 2
  MAX_POLL_RETRIES = 1000

  # Represents a result of evaluating an answer.
  Result = Struct.new(:stdout, :stderr, :evaluation_results, :exit_code, :evaluation_id) do
    # Checks if the evaluation errored.
    #
    # This does not count failing test cases as an error, although the exit code is nonzero.
    #
    # @return [Boolean]
    def error?
      false
      # evaluation_results.values.all?(&:nil?) && exit_code != 0
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
    # Executes the provided answer.
    #
    # @param [Course] course The course.
    # @param [Course::Assessment::Question::Programming] question The programming question being
    #   graded.
    # @param [Course::Assessment::Answer::Programming] answer The answer specified by the student.
    # @return [Course::Assessment::ProgrammingCodaveriEvaluationService::Result]
    #
    # @raise [Timeout::Error] When the operation times out.
    def execute(course, question, answer, timeout = nil)
      new(course, question, answer, timeout).execute
    end
  end

  # Evaluate the package in Codaveri and return the output that matters.
  #
  # @return [Result]
  # @raise [Timeout::Error] When the evaluation timeout has elapsed.
  def execute
    stdout, stderr, evaluation_results, exit_code = Timeout.timeout(@timeout) { evaluate_in_codaveri }
    Result.new(stdout, stderr, evaluation_results, exit_code)
  end

  private

  def initialize(course, question, answer, timeout)
    @course = course
    @question = question
    @answer = answer
    @language = question.language
    @memory_limit = question.memory_limit || MEMORY_LIMIT
    @time_limit = question.time_limit ? [question.time_limit, question.max_time_limit].min : question.max_time_limit
    @timeout = timeout || DEFAULT_TIMEOUT

    @answer_object = { languageVersion: { language: '', version: '' },
                       files: [],
                       problemId: '',
                       # TODO: discuss if we should expose CM database ID
                       userId: '-1' }

    @codaveri_evaluation_results = nil
  end

  # Makes an API call to Codaveri to run the evaluation, waits for its completion, then returns the
  # stuff Coursemology cares about.
  #
  # @return [Array<(String, String, String, Integer)>] The stdout, stderr, test report and exit
  #   code.
  def evaluate_in_codaveri
    construct_grading_object
    response_status, response_body, evaluation_id = request_codaveri_evaluation
    poll_codaveri_evaluation_results(response_status, response_body, evaluation_id)
    build_evaluation_result
  end

  # Constructs codaveri evaluation answer object.
  def construct_grading_object
    return unless @question.codaveri_id

    @answer_object[:problemId] = @question.codaveri_id

    @answer_object[:languageVersion][:language] = @question.polyglot_language_name
    @answer_object[:languageVersion][:version] = @question.polyglot_language_version

    @answer.files.each do |file|
      file_template = default_codaveri_student_file_template
      file_template[:path] = file.filename
      file_template[:content] = file.content

      @answer_object[:files].append(file_template)
    end

    # For debugging purpose
    # File.write('codaveri_evaluation_test.json', @answer_object.to_json)

    @answer_object
  end

  def request_codaveri_evaluation
    codaveri_api_service = CodaveriAsyncApiService.new('v2/evaluate', @answer_object)
    response_status, response_body = codaveri_api_service.post

    response_success = response_body['success']

    if response_status == 201 && response_success
      [response_status, response_body, response_body['data']['id']]
    elsif response_status == 200 && response_success
      [response_status, response_body, nil]
    else
      raise CodaveriError,
            { status: response_status, body: response_body }
    end
  end

  def fetch_codaveri_evaluation(evaluation_id)
    codaveri_api_service = CodaveriAsyncApiService.new('v2/evaluate', { id: evaluation_id })
    codaveri_api_service.get
  end

  def poll_codaveri_evaluation_results(response_status, response_body, evaluation_id)
    poll_count = 0
    until ![201, 202].include?(response_status) || poll_count >= MAX_POLL_RETRIES
      sleep(POLL_INTERVAL_SECONDS)
      response_status, response_body = fetch_codaveri_evaluation(evaluation_id)
      poll_count += 1
    end

    response_success = response_body['success']
    if response_status == 200 && response_success
      @codaveri_evaluation_results = response_body['data']['exprResults']
    else
      raise CodaveriError,
            { status: response_status, body: response_body }
    end
  end

  def build_evaluation_result # rubocop:disable Metrics/CyclomaticComplexity
    stdout = @codaveri_evaluation_results.map { |result| result['run']['stdout'] }.reject(&:empty?).join('\n')
    stderr = @codaveri_evaluation_results.map { |result| result['run']['stderr'] }.reject(&:empty?).join('\n')
    exit_code = @codaveri_evaluation_results.map { |result| result['run']['success'] }.all? { |n| n == 1 } ? 0 : 2
    [stdout, stderr, @codaveri_evaluation_results, exit_code]
  end

  def default_codaveri_student_file_template
    {
      path: '',
      content: ''
    }
  end
end
