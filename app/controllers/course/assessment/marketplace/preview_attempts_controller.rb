# frozen_string_literal: true
class Course::Assessment::Marketplace::PreviewAttemptsController < # rubocop:disable Metrics/ClassLength
  Course::Assessment::Marketplace::Controller
  include Course::Assessment::LiveFeedback::MessageConcern
  include Course::Assessment::LiveFeedback::ThreadConcern
  include Course::Assessment::Submission::SubmissionsControllerServiceConcern
  # Per-answer draft save (#save_draft) and submit (#submit_answer) reuse the same answer
  # write path as the platform AnswersController.
  include Course::Assessment::Answer::UpdateAnswerConcern
  include Course::Assessment::Answer::SubmitAnswerConcern

  MEMBER_ACTIONS = [
    :edit, :update, :auto_grade, :reset, :reload_answer, :reevaluate_answer, :generate_feedback,
    :generate_live_feedback, :create_live_feedback_chat, :create_scribing_scribble,
    :save_draft, :submit_answer
  ].freeze

  before_action :load_listing, only: [:create]
  before_action :load_attempt, only: MEMBER_ACTIONS
  before_action :authorize_attempt!, only: [:create, *MEMBER_ACTIONS]
  # Questions may be added to the source assessment after an attempt already exists; without this,
  # newly added questions have no submission_question row and _questions.json.jbuilder (reused) raises.
  # Mirrors submissions_controller. auto_grade also renders 'edit' directly, so it needs the same guard.
  before_action :load_or_create_submission_questions,
                only: [:edit, :update, :auto_grade, :reset, :reload_answer, :reevaluate_answer,
                       :generate_feedback, :generate_live_feedback, :create_live_feedback_chat,
                       :create_scribing_scribble, :save_draft, :submit_answer]

  # Defines #update: service.update → answer saves + workflow transitions + render 'edit'. @assessment/
  # @submission are snapshot at service memoization, hence set in load_attempt, never in the action.
  delegate_to_service(:update)
  delegate_to_service(:load_or_create_submission_questions)

  def create
    attempt = existing_attempt || build_attempt
    attempt.create_new_answers
    render json: { id: attempt.id, assessmentId: attempt.assessment_id }
  rescue ActiveRecord::RecordInvalid => e
    # The previewer already has an attempt for this assessment (e.g. a real submission because they are
    # also a student in the source course). validate_unique_submission (unscoped) fails the create with
    # the friendly collision error; never reuse their real submission as a preview.
    render json: { errors: e.record.errors.full_messages }, status: :conflict
  end

  def edit
    # implicit render of preview_attempts/edit.json.jbuilder
  end

  def auto_grade
    Course::Assessment::Marketplace::PreviewAutoGradingService.grade(@attempt)
    # Re-load (NOT @attempt.reload): reload drops the calculated `grade` select that edit.json needs.
    load_attempt
    render 'edit'
  end

  def reset
    @attempt.reset_attempt!
    load_attempt
    render 'edit'
  end

  def reload_answer
    @answer = @submission.answers.find_by(id: reload_answer_params[:answer_id])

    if @answer.nil?
      head :bad_request
    elsif reload_answer_params[:reset_answer]
      @new_answer = @answer.reset_answer
      render @new_answer
    else
      render @answer
    end
  end

  def reevaluate_answer
    @answer = @submission.answers.find_by(id: reload_answer_params[:answer_id])
    return head :bad_request if @answer.nil?

    job = @answer.auto_grade!(redirect_to_path: nil, reduce_priority: true)
    if job.nil?
      @answer.reload
      render @answer
    else
      render partial: 'jobs/submitted', locals: { job: job.job }
    end
  end

  def generate_feedback
    @answer = @submission.answers.find_by(id: reload_answer_params[:answer_id])
    return head :bad_request if @answer.nil?

    job = @answer.generate_feedback
    render partial: 'jobs/submitted', locals: { job: job }
  end

  # Per-answer autosave. Mirrors AnswersController#update; the whole-submission #update above
  # is a different (finalise/mark) path.
  def save_draft
    @answer = @submission.answers.find_by(id: params[:answer_id])
    return head :bad_request if @answer.nil?

    if update_answer(@answer, draft_answer_params)
      render @answer
    else
      render json: { errors: @answer.errors }, status: :bad_request
    end
  end

  # Per-question submit + autograde. Mirrors AnswersController#submit_answer. The per-answer
  # auto_grade path (answer.auto_grade!) is already exercised by #reevaluate_answer above and
  # PreviewAutoGradingService, so it is safe on a bare preview Attempt (no EXP/publish tail).
  def submit_answer
    @answer = @submission.answers.find_by(id: params[:answer_id])
    return head :bad_request if @answer.nil?

    if update_answer(@answer, draft_answer_params)
      if should_auto_grade_on_submit(@answer)
        auto_grade_answer(@answer)
      else
        render @answer
      end
    else
      render json: { errors: @answer.errors }, status: :bad_request
    end
  end

  def generate_live_feedback # rubocop:disable Metrics/AbcSize, Metrics/MethodLength
    @answer = @submission.answers.find_by(id: live_feedback_params[:answer_id])
    return head :bad_request if @answer.nil?

    system_thread = active_live_feedback_thread
    return head :bad_request if system_thread.nil?

    @thread_id = system_thread.codaveri_thread_id

    user_messages_count = system_thread.messages.
                          where(creator_id: system_thread.submission_creator_id).count
    if current_course.codaveri_get_help_usage_limited? &&
       user_messages_count >= current_course.codaveri_max_get_help_user_messages
      head :too_many_requests and return
    end

    @message = live_feedback_params[:message]
    @options = live_feedback_params[:options]
    @option_id = live_feedback_params[:option_id]

    handle_save_user_message

    status, response = @answer.generate_live_feedback(@thread_id, @message)

    render json: response, status: status
  end

  def create_live_feedback_chat
    @answer = @submission.answers.find_by(id: answer_params[:answer_id])
    return head :bad_request if @answer.nil?

    status, body = safe_create_and_save_thread_info

    @thread_id = body['thread']['id']
    @thread_status = body['thread']['status']

    render 'course/assessment/submission/submissions/create_live_feedback_chat', status: status
  end

  def fetch_live_feedback_chat
    @answer_id = live_feedback_params[:answer_id]
    answer = Course::Assessment::Answer.find(@answer_id)
    authorize_preview_attempt_for_answer!(answer, :fetch_live_feedback_chat)

    @thread = live_feedback_thread_for_answer(answer)
    return head :bad_request if @thread.nil?

    render 'course/assessment/submission/submissions/fetch_live_feedback_chat'
  end

  def fetch_live_feedback_status
    thread_id = thread_params[:thread_id]
    @thread = Course::Assessment::LiveFeedback::Thread.find_by(codaveri_thread_id: thread_id)
    return head :bad_request if @thread.nil?

    # Authorize BEFORE the external (paid) Codaveri call: this collection action has no upfront
    # authorize_attempt! gate, and the thread is resolvable from the DB alone. Doing the API call first
    # would let an unauthorized caller trigger outbound calls / use the result as an existence oracle.
    authorize_preview_attempt_for_thread!(@thread, :fetch_live_feedback_status)

    codaveri_api_service = CodaveriAsyncApiService.new("chat/feedback/threads/#{thread_id}", nil)
    response_status, response_body = codaveri_api_service.get
    raise CodaveriError, { status: response_status, body: response_body } if response_status != 200

    @thread_status = response_body['data']['thread']['status']
    @thread.update!(is_active: @thread_status == 'active')

    render 'course/assessment/submission/submissions/fetch_live_feedback_status', status: response_status
  end

  def save_live_feedback
    current_thread_id = params[:current_thread_id]
    content = params[:content]
    is_error = params[:is_error]

    @thread = Course::Assessment::LiveFeedback::Thread.find_by(codaveri_thread_id: current_thread_id)
    return head :bad_request if @thread.nil?

    authorize_preview_attempt_for_thread!(@thread, :save_live_feedback)

    @thread.class.transaction do
      @new_message = save_new_feedback(content, is_error)

      associate_new_message_with_existing_files
    end
  end

  def create_scribing_scribble
    @scribing_answer = preview_scribing_answer
    return head :bad_request unless @scribing_answer
    return head :bad_request if scribing_scribble_params[:answer_id].to_i != @scribing_answer.id

    @scribble = Course::Assessment::Answer::ScribingScribble.
                find_or_initialize_by(creator: current_user, answer_id: @scribing_answer.id)
    @scribble.assign_attributes(scribing_scribble_params)
    @scribble.save

    render json: @scribing_answer
  end

  # The action delegated by delegate_to_service cannot authorize inline — gate everything here.
  MEMBER_ACTION_ABILITIES = {
    'edit' => :read,
    'update' => :update,
    'auto_grade' => :grade,
    'reset' => :reset,
    'reload_answer' => :reload_answer,
    'reevaluate_answer' => :reevaluate_answer,
    'generate_feedback' => :generate_feedback,
    'generate_live_feedback' => :generate_live_feedback,
    'create_live_feedback_chat' => :create_live_feedback_chat,
    'create_scribing_scribble' => :create_scribing_scribble,
    'save_draft' => :save_draft,
    'submit_answer' => :submit_answer
  }.freeze

  private

  def authorize_attempt!
    if action_name == 'create'
      authorize! :create, Course::Assessment::Attempt
      # Published-listing / course gate: creation is only for a published marketplace listing's source
      # assessment (the ability's :create grant is class-level and course-agnostic on its own).
      authorize! :preview_in_marketplace, source_assessment
    elsif MEMBER_ACTION_ABILITIES.key?(action_name)
      authorize! MEMBER_ACTION_ABILITIES.fetch(action_name), @attempt
    else
      authorize! action_name.to_sym, @attempt
    end
  end

  # Swap the platform UpdateService for the preview subclass (the service concern reads this).
  def service_class
    Course::Assessment::Marketplace::PreviewUpdateService
  end

  def load_listing
    @listing = Course::Assessment::Marketplace::Listing.find(params[:listing_id])
  end

  def source_assessment
    @source_assessment ||= @listing.assessment
  end

  # Key on previews only, so a real submission for the same (assessment, creator) is never mistaken for
  # a reusable preview.
  def existing_attempt
    Course::Assessment::Attempt.previews.find_by(assessment: source_assessment, creator: current_user)
  end

  def build_attempt
    User.with_stamper(current_user) do
      Course::Assessment::Attempt.create!(
        assessment: source_assessment, creator: current_user, updater: current_user
      )
    end
  end

  # Member routes are shallow (no listing_id): the attempt resolves its own assessment. Load with the
  # calculated grade/graded_at/log_count/grader_ids the reused edit payload reads.
  def load_attempt
    @attempt = Course::Assessment::Attempt.previews.
               calculated(:grade, :graded_at, :log_count, :grader_ids).find(params[:id])
    @submission = @attempt
    @assessment = @attempt.assessment
  end

  def reload_answer_params
    params.permit(:answer_id, :reset_answer)
  end

  # UpdateAnswerConcern#update_answer permits its own answer-type fields off this root; require
  # the wrapper key only. (The existing #answer_params permits :answer_id for live feedback.)
  def draft_answer_params
    params.require(:answer)
  end

  def answer_params
    params.permit(:answer_id)
  end

  def live_feedback_params
    params.permit(:message, :answer_id, :option_id, options: [])
  end

  def thread_params
    params.permit(:thread_id)
  end

  def scribing_scribble_params
    params.require(:scribble).permit(:answer_id, :content)
  end

  def preview_scribing_answer
    answer = @submission.answers.find_by(id: params[:answer_id])
    return unless answer&.actable.is_a?(Course::Assessment::Answer::Scribing)

    answer.actable
  end

  # Design C: submission_questions reference the attempt via submission_id (no polymorphic
  # attemptable_type), so the thread lookups filter on submission_id alone.
  def active_live_feedback_thread
    Course::Assessment::LiveFeedback::Thread.
      joins(:submission_question).
      where(
        submission_question: {
          submission_id: @submission.id,
          question_id: @answer.question.id
        },
        is_active: true
      ).
      first
  end

  def safe_create_and_save_thread_info
    submission_question = Course::Assessment::SubmissionQuestion.where(
      submission_id: @submission.id,
      question_id: @answer.question.id
    ).first

    submission_question.with_lock do
      existing_active_threads = Course::Assessment::LiveFeedback::Thread.
                                where(submission_question_id: submission_question.id, is_active: true)

      return existing_thread_status(existing_active_threads.first) unless existing_active_threads.empty?

      create_and_save_thread_if_empty(submission_question)
    end
  end

  def live_feedback_thread_for_answer(answer)
    submission = answer.submission
    question = answer.question

    submission_question = Course::Assessment::SubmissionQuestion.
                          where(submission_id: submission.id, question_id: question.id).first

    Course::Assessment::LiveFeedback::Thread.where(submission_question_id: submission_question.id).
      order(created_at: :desc).preload(:messages).first
  end

  def authorize_preview_attempt_for_answer!(answer, action)
    attempt = answer.submission
    raise CanCan::AccessDenied unless attempt.preview?

    authorize! action, attempt
  end

  def authorize_preview_attempt_for_thread!(thread, action)
    attempt = thread.submission_question.submission
    raise CanCan::AccessDenied unless attempt.preview?

    authorize! action, attempt
  end

  def save_new_feedback(content, is_error)
    new_message = Course::Assessment::LiveFeedback::Message.create({
      thread_id: @thread.id,
      is_error: is_error,
      content: content,
      creator_id: 0,
      created_at: Time.zone.now,
      option_id: nil
    })

    raise ActiveRecord::Rollback unless new_message.persisted?

    new_message
  end

  def associate_new_message_with_existing_files
    last_message = @thread.messages.where.not(id: @new_message.id).max_by(&:id)
    return [] if last_message.nil?

    file_ids = Course::Assessment::LiveFeedback::MessageFile.
               where(message_id: last_message.id).pluck(:file_id)

    new_message_files = file_ids.map do |file_id|
      {
        message_id: @new_message.id,
        file_id: file_id
      }
    end

    files = Course::Assessment::LiveFeedback::MessageFile.insert_all(new_message_files)
    raise ActiveRecord::Rollback if !new_message_files.empty? && (files.nil? || files.rows.empty?)
  end
end
