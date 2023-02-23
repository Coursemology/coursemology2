# frozen_string_literal: true
# Sets up a programming evaluation, queues it for execution by codaveri evaluators, then returns the results.
class Course::Assessment::ProgrammingCodaveriEvaluationService
  # The default timeout for the job to finish.
  DEFAULT_TIMEOUT = 5.minutes
  MEMORY_LIMIT = Course::Assessment::Question::Programming::MEMORY_LIMIT

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
    # @param [string] course_title Title of the course.
    # @param [Course::Assessment::Question::Programming] question The programming question being
    #   graded.
    # @param [Course::Assessment::Answer::Programming] answer The answer specified by the student.
    # @return [Course::Assessment::ProgrammingCodaveriEvaluationService::Result]
    #
    # @raise [Timeout::Error] When the operation times out.
    def execute(course_title, question, answer, timeout = nil)
      new(course_title, question, answer, timeout).execute
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

  def initialize(course_title, question, answer, timeout)
    @question = question
    @answer = answer
    @language = question.language
    @memory_limit = question.memory_limit || MEMORY_LIMIT
    @time_limit = question.time_limit ? [question.time_limit, question.max_time_limit].min : question.max_time_limit
    @timeout = timeout || DEFAULT_TIMEOUT

    @answer_object = { api_version: 'latest',
                       language_version: { language: '', version: '' },
                       files: [],
                       problem_id: '',
                       course_name: course_title }

    @codaveri_evaluation_results = nil
  end

  # Makes an API call to Codaveri to run the evaluation, waits for its completion, then returns the
  # stuff Coursemology cares about.
  #
  # @return [Array<(String, String, String, Integer)>] The stdout, stderr, test report and exit
  #   code.
  def evaluate_in_codaveri
    construct_grading_object
    request_codaveri_evaluation
    build_evaluation_result
  end

  # Constructs codaveri evaluation answer object.
  def construct_grading_object
    return unless @question.codaveri_id

    @answer_object[:problem_id] = @question.codaveri_id

    @answer_object[:language_version][:language] = @question.polyglot_language_name
    @answer_object[:language_version][:version] = @question.polyglot_language_version

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
    post_response = connect_to_codaveri
    response_status = post_response.status
    response_body = valid_json(post_response.body)
    response_success = response_body['success']

    unless response_status == 200 && response_success
      raise CodaveriError,
            { status: response_status, body: response_body }
    end

    @codaveri_evaluation_results = response_body['data']['evaluation_results']
  end

  def valid_json(json)
    JSON.parse(json)
  rescue JSON::ParserError => _e
    { 'success' => false, 'message' => json }
  end

  def connect_to_codaveri
    connection = Excon.new('https://api.codaveri.com/code/evaluate')
    connection.post(
      headers: {
        'x-api-key' => ENV['CODAVERI_API_KEY'],
        'Content-Type' => 'application/json'
      },
      body: @answer_object.to_json
    )
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
