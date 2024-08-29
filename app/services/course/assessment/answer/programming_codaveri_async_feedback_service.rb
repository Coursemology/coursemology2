# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingCodaveriAsyncFeedbackService # rubocop:disable Metrics/ClassLength
  CODAVERI_LANGUAGE_MAPPING = {
    en: 'english',
    zh: 'chinese'
  }.freeze
  DEFAULT_CODAVERI_LANGUAGE = 'english'

  def initialize(assessment, question, answer, require_token, feedback_config)
    @course = assessment.course
    @assessment = assessment
    @question = question
    @answer = answer
    @answer_files = answer.files

    @answer_object = {
      userId: answer.submission.creator_id.to_s,
      courseName: @course.title,
      config: feedback_config.nil? ? self.class.default_config : feedback_config,
      languageVersion: {
        language: '',
        version: ''
      },
      files: [],
      applyVerification: true,
      requireToken: require_token,
      problemId: ''
    }
  end

  def run_codaveri_feedback_service
    construct_feedback_object
    request_codaveri_feedback
  end

  def fetch_codaveri_feedback(feedback_id)
    api_namespace = @course.codaveri_itsp_enabled? ? 'v2/feedback/ITSP' : 'v2/feedback/LLM'
    codaveri_api_service = CodaveriAsyncApiService.new(api_namespace, { id: feedback_id })
    codaveri_api_service.get
  end

  def save_codaveri_feedback(response_body)
    feedback_files = response_body['data']['feedbackFiles']
    @feedback_files_hash = feedback_files.to_h { |file| [file['path'], file['feedbackLines']] }

    process_codaveri_feedback
  end

  def self.default_config
    {
      persona: 'novice',
      categories: ['functionality'],
      revealLevel: 'solution',
      tone: 'encouraging',
      language: 'english',
      customPrompt: ''
    }
  end

  def self.language_from_locale(locale)
    CODAVERI_LANGUAGE_MAPPING.fetch(locale.to_sym, DEFAULT_CODAVERI_LANGUAGE)
  end

  private

  # Grades into the given +Course::Assessment::Answer::AutoGrading+ object. This assigns the grade
  # and makes sure answer is in the correct state.
  #
  # @param [Course::Assessment::Answer] answer The answer to be graded.
  # @return [Course::Assessment::Answer] The graded answer. Note that this answer is not persisted
  #   yet.
  def construct_feedback_object # rubocop:disable Metrics/AbcSize
    return unless @question.codaveri_id

    @answer_object[:problemId] = @question.codaveri_id

    @answer_object[:languageVersion][:language] = @question.polyglot_language_name
    @answer_object[:languageVersion][:version] = @question.polyglot_language_version

    # @answer_object[:is_only_itsp] = true if @course.codaveri_itsp_enabled?

    @answer_files.each do |file|
      file_template = default_codaveri_student_file_template
      file_template[:path] = file.filename
      file_template[:content] = file.content

      @answer_object[:files].append(file_template)
    end

    @answer_object
  end

  def request_codaveri_feedback
    api_namespace = @course.codaveri_itsp_enabled? ? 'v2/feedback/ITSP' : 'v2/feedback/LLM'
    codaveri_api_service = CodaveriAsyncApiService.new(api_namespace, @answer_object)
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
    feedback_id = feedback_line['id']
    linenum = feedback_line['linenum'].to_i
    feedback = feedback_line['feedback']

    annotation = file.annotations.find_or_initialize_by(line: linenum)

    # Remove old codaveri posts in the same annotation
    # annotation.posts.where(creator_id: 0).destroy_all

    if @course.codaveri_feedback_workflow == 'publish'
      post_workflow_state = :published
      feedback_status = :accepted
    else
      post_workflow_state = :draft
      feedback_status = :pending_review
    end

    new_post = annotation.posts.build(title: @assessment.title, text: feedback, creator: User.system,
                                      updater: User.system, workflow_state: post_workflow_state)

    new_post.build_codaveri_feedback(codaveri_feedback_id: feedback_id,
                                     original_feedback: feedback, status: feedback_status)

    new_post.save!
    annotation.save!

    create_topic_subscription(new_post.topic)
    new_post.topic.mark_as_pending if @course.codaveri_feedback_workflow != 'publish'
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
