# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingCodaveriFeedbackService
  def initialize(assessment, question, answer)
    @course = assessment.course
    @assessment = assessment
    @question = question
    @answer = answer
    @answer_files = answer.files

    @answer_object = { api_version: 'latest',
                       user_id: answer.submission.creator_id.to_s,
                       language_version: { language: '', version: '' },
                       files_student: [],
                       problem_id: '',
                       course_name: @course.title }
  end

  def run_codaveri_feedback_service
    construct_feedback_object
    request_codaveri_feedback
    process_codaveri_feedback
  end

  private

  # Grades into the given +Course::Assessment::Answer::AutoGrading+ object. This assigns the grade
  # and makes sure answer is in the correct state.
  #
  # @param [Course::Assessment::Answer] answer The answer to be graded.
  # @return [Course::Assessment::Answer] The graded answer. Note that this answer is not persisted
  #   yet.
  def construct_feedback_object
    return unless @question.codaveri_id

    @answer_object[:problem_id] = @question.codaveri_id

    @answer_object[:language_version][:language] = @question.polyglot_language_name
    @answer_object[:language_version][:version] = @question.polyglot_language_version

    @answer_object[:is_only_itsp] = true if @course.codaveri_itsp_enabled?

    @answer_files.each do |file|
      file_template = default_codaveri_student_file_template
      file_template[:path] = file.filename
      file_template[:content] = file.content

      @answer_object[:files_student].append(file_template)
    end

    # For debugging purpose
    # File.write('codaveri_feedback_test.json', @answer_object.to_json)

    @answer_object
  end

  def request_codaveri_feedback
    post_response = connect_to_codaveri

    response_status = post_response.status
    response_body = valid_json(post_response.body)
    response_success = response_body['success']

    unless response_status == 200 && response_success
      raise CodaveriError,
            { status: response_status, body: response_body }
    end

    feedback_files = response_body['data']['feedback_files']
    @feedback_files_hash = feedback_files.to_h { |file| [file['path'], file['feedback_lines']] }
  end

  def valid_json(json)
    JSON.parse(json)
  rescue JSON::ParserError => _e
    { 'success' => false, 'message' => json }
  end

  def connect_to_codaveri
    connection = Excon.new('https://api.codaveri.com/feedback')
    connection.post(
      headers: {
        'x-api-key' => ENV['CODAVERI_API_KEY'],
        'Content-Type' => 'application/json'
      },
      body: @answer_object.to_json
    )
  end

  def process_codaveri_feedback
    @answer_files.each do |file|
      feedback_lines = @feedback_files_hash[file.filename]
      next if feedback_lines.nil?

      feedback_lines.each do |line|
        save_annotation(file, line)
      end
    end
  end

  def save_annotation(file, feedback_line) # rubocop:disable Metrics/AbcSize
    feedback_id = feedback_line['feedback_id']
    # linenum is added by 1 as an empty line is added to the code content at the client side.
    linenum = feedback_line['linenum'].to_i + 1
    feedback = feedback_line['feedback']

    annotation = file.annotations.find_or_initialize_by(line: linenum)

    # Remove old codaveri posts in the same annotation
    annotation.posts.where(creator_id: 0).destroy_all

    new_post = annotation.posts.build(title: @assessment.title, text: feedback, creator: User.system,
                                      updater: User.system, workflow_state: :draft)

    new_post.build_codaveri_feedback(codaveri_feedback_id: feedback_id,
                                     original_feedback: feedback, status: :pending_review)

    new_post.save!
    annotation.save!

    create_topic_subscription(new_post.topic)
    new_post.topic.mark_as_pending
  end

  def create_topic_subscription(discussion_topic)
    # Ensure the student who wrote the code gets notified when someone comments on his code
    discussion_topic.ensure_subscribed_by(@answer.submission.creator)

    # Ensure all group managers get a notification when someone adds a programming annotation
    # to the answer.
    answer_course_user = @answer.submission.course_user
    answer_course_user.my_managers.each do |manager|
      discussion_topic.ensure_subscribed_by(manager.user)
    end
  end

  def default_codaveri_student_file_template
    {
      path: '',
      content: ''
    }
  end
end
