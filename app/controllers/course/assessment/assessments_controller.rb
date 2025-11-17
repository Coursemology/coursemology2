# frozen_string_literal: true
class Course::Assessment::AssessmentsController < Course::Assessment::Controller # rubocop:disable Metrics/ClassLength
  include Course::Assessment::AssessmentsHelper
  include Course::KoditsuWorkspaceConcern
  include Course::Assessment::KoditsuAssessmentConcern
  include Course::Assessment::Question::KoditsuQuestionConcern
  include Course::Assessment::KoditsuAssessmentInvitationConcern

  before_action :load_submissions, only: [:show]
  after_action :create_koditsu_invitation_job, only: [:update]
  after_action :create_fetch_koditsu_submissions_job, only: [:update]

  include Course::Assessment::MonitoringConcern

  before_action :load_question_duplication_data, only: [:show, :reorder]

  COURSE_USERS = { my_students: 'my_students',
                   my_students_w_phantom: 'my_students_w_phantom',
                   students: 'students',
                   students_w_phantom: 'students_w_phantom' }.freeze

  def index
    @assessments = @assessments.ordered_by_date_and_title.with_submissions_by(current_user)

    load_assessment_submission_counts if !@assessments.empty? && can?(:manage, @assessments.first)

    @items_hash = @course.lesson_plan_items.where(actable_id: @assessments.pluck(:id),
                                                  actable_type: Course::Assessment.name).
                  preload(actable: :conditions).
                  with_reference_times_for(current_course_user, current_course).
                  with_personal_times_for(current_course_user).
                  to_h do |item|
      [item.actable_id, item]
    end

    @conditional_service = Course::Assessment::AchievementPreloadService.new(@assessments)
  end

  def show
    @assessment_time = @assessment.time_for(current_course_user)
    return render 'authenticate' unless can_access_assessment?

    @question_assessments = @assessment.question_assessments.with_question_actables
    @assessment_conditions = @assessment.assessment_conditions.includes({ conditional: :actable })
    @questions = @assessment.questions.includes({ actable: :test_cases })

    @requirements = @assessment.specific_conditions.map do |condition|
      {
        title: condition.title,
        satisfied: current_course_user.present? ? condition.satisfied_by?(current_course_user) : nil
      }.compact
    end
  end

  def new
  end

  def create
    # Randomized Assessment is temporarily hidden (PR#5406)
    # @assessment.update_randomization(randomization_params)

    ActiveRecord::Base.transaction do
      @assessment.save!
      upsert_monitoring! if can_manage_monitor?

      flag_assessment_not_synced_with_koditsu

      render json: { id: @assessment.id }
    end
  rescue StandardError
    render json: { errors: @assessment.errors }, status: :bad_request
  end

  def edit
    @assessment.description = helpers.sanitize_ckeditor_rich_text(@assessment.description)
    @programming_questions = @assessment.programming_questions

    @programming_qns_invalid_for_koditsu = @programming_questions.reject do |question|
      question.language.koditsu_whitelisted?
    end
  end

  def update
    @assessment.update_mode(autograded_params)

    # Randomized Assessment is temporarily hidden (PR#5406)
    # @assessment.update_randomization(randomization_params)

    ActiveRecord::Base.transaction do
      @assessment.update!(assessment_params)
      upsert_monitoring! if can_manage_monitor?

      flag_assessment_not_synced_with_koditsu

      head :ok
    end
  rescue StandardError
    render json: { errors: @assessment.errors }, status: :bad_request
  end

  def destroy
    if @assessment.destroy
      render json: {
        redirect: course_assessments_path(current_course,
                                          category: @assessment.tab.category_id,
                                          tab: @assessment.tab_id)
      }
    else
      render json: { errors: @assessment.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def sync_with_koditsu
    is_course_koditsu_enabled = current_course.component_enabled?(Course::KoditsuPlatformComponent)
    is_koditsu_enabled = is_course_koditsu_enabled && @assessment.is_koditsu_enabled

    return head(:bad_request) unless is_koditsu_enabled

    setup_koditsu_workspace unless current_course.koditsu_workspace_id

    is_new_assessment = !@assessment.koditsu_assessment_id

    success = @assessment.class.transaction do
      create_or_update_assessment_in_koditsu

      if is_new_assessment
        create_koditsu_invitation_job
        create_fetch_koditsu_submissions_job
      end

      @assessment.questions.each do |question|
        next if question.is_synced_with_koditsu

        @question = question
        @programming_question = question.specific

        create_or_edit_question_in_koditsu
      end

      arrange_questions_in_assessment_in_koditsu

      true
    end

    if success
      head :ok
    else
      head :bad_request
    end
  end

  def invite_to_koditsu
    is_course_koditsu_enabled = current_course.component_enabled?(Course::KoditsuPlatformComponent)
    is_assessment_koditsu_enabled = @assessment.koditsu_assessment_id && @assessment.is_koditsu_enabled
    is_koditsu_enabled = is_course_koditsu_enabled && is_assessment_koditsu_enabled

    return head(:bad_request) unless is_koditsu_enabled

    status, response = send_invitation_for_koditsu_assessment(@assessment)

    return head(:bad_request) unless [201, 207].include?(status)

    if all_invitation_successful?(response)
      head :ok
    else
      head :bad_request
    end
  end

  # Reorder questions for an assessment
  def reorder
    unless valid_ordering?(question_order_ids)
      return render json: {
        errors: I18n.t('course.assessment.assessments.invalid_questions_order')
      }, status: :bad_request
    end

    Course::QuestionAssessment.transaction do
      question_order_ids.each_with_index do |id, index|
        question_assessments_hash[id].update!(weight: index)
      end
    end

    head :ok
  rescue StandardError
    head :bad_request
  end

  def authenticate
    if assessment_not_started(@assessment.time_for(current_course_user)) ||
       authentication_service.authenticate(params.require(:assessment).permit(:password)[:password])
      render json: { redirectUrl: course_assessment_path(current_course, @assessment) }
    else
      render json: { errors: @assessment.errors }, status: :bad_request
    end
  end

  def remind
    authorize!(:manage, @assessment)
    return head :bad_request unless student_course_users

    Course::Assessment::ReminderService.
      send_closing_reminder(@assessment, student_course_users.pluck(:id), include_unsubscribed: true)
    head :ok
  end

  # Fetch the count of all automated feedback in this assessment's submissions.
  # Currently all this feedback is in file annotations,
  # if more feedback types are added this function should be extended.
  def auto_feedback_count
    authorize!(:manage, @assessment)
    return head :bad_request unless student_course_users

    render json: {
      count: draft_file_annotation_posts(student_course_users).count
    }, status: :ok
  end

  # Publish all automated feedback in this assessment's submissions.
  def publish_auto_feedback
    authorize!(:manage, @assessment)
    return head :bad_request unless student_course_users

    ActiveRecord::Base.transaction do
      posts = draft_file_annotation_posts(student_course_users)
      # Important to update codaveri feedback first, so the result set of posts query doesn't change
      Course::Discussion::Post::CodaveriFeedback.
        where(post_id: posts.ids).
        update_all(status: :accepted, rating: params[:rating])
      posts.update_all(workflow_state: :published)

      return head :ok
    end

    render json: { error: e.message }, status: :unprocessable_entity
  end

  def requirements
    requirements = @assessment.specific_conditions.filter_map do |condition|
      condition.title unless current_course_user.present? && condition.satisfied_by?(current_course_user)
    end

    render json: requirements
  end

  # This endpoint provides the view. The actual data is fetched client-side from the statistics module.
  def statistics
    authorize!(:read_statistics, current_course)
  end

  # This endpoint provides the view. The actual data is fetched client-side from the plagiarism module.
  def plagiarism
    authorize!(:manage_plagiarism, current_course)
  end

  protected

  def load_assessment_options
    return super if skip_tab_filter?

    { through: :tab }
  end

  private

  def load_assessment_submission_counts
    real_student_ids = current_course.course_users.students.without_phantom_users.pluck(:user_id)
    @total_count = real_student_ids.count
    @assessment_counts = Course::Assessment::Submission.
                         without_attempting_state.
                         by_users(real_student_ids).
                         group(:assessment_id).
                         count
  end

  def question_order_ids
    @question_order_ids ||= begin
      integer_type = ActiveModel::Type::Integer.new
      params.require(:question_order).map { |id| integer_type.cast(id) }
    end
  end

  def assessment_params
    base_params = [:title, :description, :base_exp, :time_bonus_exp, :start_at, :end_at, :tab_id,
                   :bonus_end_at, :published, :autograded, :show_mcq_mrq_solution, :show_private,
                   :show_evaluation, :use_public, :use_private, :use_evaluation, :has_personal_times,
                   :affects_personal_times, :block_student_viewing_after_submitted, :has_todo,
                   :time_limit, :is_koditsu_enabled, :show_rubric_to_students]
    base_params += if autograded?
                     [:skippable, :allow_partial_submission, :show_mcq_answer]
                   else
                     [:view_password, :session_password, :tabbed_view, :delayed_grade_publication]
                   end
    params.require(:assessment).permit(*base_params, folder_params)
  end

  def auto_feedback_count_params
    params.require(:course_users)
  end

  def publish_auto_feedback_params
    params.require(:assessment).permit(:course_users, :rating)
  end

  def autograded_params
    params.require(:assessment).permit(:autograded)
  end

  # Randomized Assessment is temporarily hidden (PR#5406)
  # def randomization_params
  #   params.require(:assessment).permit(:randomization)
  # end

  # Infer the autograded state from @assessment or params.
  def autograded?
    if @assessment&.autograded
      true
    elsif @assessment && @assessment.autograded == false
      false
    else
      params[:assessment] && params[:assessment][:autograded]
    end
  end

  # Merges the parameters for category and tab IDs from either the assessment parameter or the
  # query string.
  def tab_params
    params.permit(:category, :tab, assessment: [:category, :tab]).tap do |tab_params|
      tab_params.merge!(tab_params.delete(:assessment)) if tab_params.key?(:assessment)
    end
  end

  # Checks to see if the assessment resource requires should be filtered by tab and category.
  #
  # Currently only index, new, and create actions require filtering.
  def skip_tab_filter?
    !['index', 'new', 'create'].include?(params[:action])
  end

  def tab
    @tab ||=
      if skip_tab_filter?
        super
      elsif tab_params[:tab]
        category.tabs.find(tab_params[:tab])
      else
        category.tabs.first!
      end
  end

  def category
    @category ||=
      if skip_tab_filter?
        super
      elsif tab_params[:category]
        current_course.assessment_categories.find(tab_params[:category])
      else
        current_course.assessment_categories.first!
      end
  end

  def load_question_duplication_data
    @question_duplication_dropdown_data = ordered_assessments_by_tab
  end

  # Maps question ids to their respective questions
  #
  # @return [Hash{Integer => Course::QuestionAssessment}]
  def question_assessments_hash
    @question_assessments_hash ||= @assessment.question_assessments.to_h do |qa|
      [qa.id, qa]
    end
  end

  # Checks if a proposed question ordering is valid
  #
  # @param [Array<Integer>] proposed_ordering
  # @return [Boolean]
  def valid_ordering?(proposed_ordering)
    question_assessments_hash.keys.sort == proposed_ordering.sort
  end

  def create_koditsu_invitation_job
    is_course_koditsu_enabled = current_course.component_enabled?(Course::KoditsuPlatformComponent)
    is_assessment_koditsu_enabled = @assessment.koditsu_assessment_id && @assessment.is_koditsu_enabled

    return unless is_course_koditsu_enabled && is_assessment_koditsu_enabled

    return if Time.zone.now > @assessment.end_at

    if Time.zone.now > @assessment.start_at - 12.hours
      Course::Assessment::InviteToKoditsuJob.perform_later(@assessment.id, @assessment.updated_at)
    else
      execute_koditsu_invitation_job_later
    end
  end

  def execute_koditsu_invitation_job_later
    Course::Assessment::InviteToKoditsuJob.
      set(wait_until: @assessment.start_at - 12.hours).
      perform_later(@assessment.id, @assessment.updated_at)
  end

  def create_fetch_koditsu_submissions_job
    is_course_koditsu_enabled = current_course.component_enabled?(Course::KoditsuPlatformComponent)
    is_assessment_koditsu_enabled = @assessment.koditsu_assessment_id && @assessment.is_koditsu_enabled

    return unless is_course_koditsu_enabled && is_assessment_koditsu_enabled

    return if Time.zone.now > @assessment.end_at

    Course::Assessment::Submission::FetchSubmissionsFromKoditsuJob.
      set(wait_until: @assessment.end_at).
      perform_later(@assessment.id, @assessment.updated_at, current_user)
  end

  # Mapping of `tab_id`s to their compound titles. If the tab is the only one in its category,
  # the category title is used. Otherwise, the category is prepended to the tab title.
  #
  # @return [Hash{Integer => String}]
  def compound_tab_titles
    @compound_tab_titles ||= begin
      category_titles = current_course.assessment_categories.pluck(:id, :title).to_h
      current_course.assessment_tabs.pluck(:id, :category_id, :title).
        group_by { |_, category_id, _| category_id }.
        flat_map do |category_id, tabs|
          category_title = category_titles[category_id]
          tabs.map do |id, _, title|
            [id, (tabs.length > 1) ? "#{category_title} - #{title}" : category_title]
          end
        end.to_h
    end
  end

  # Data used to populate the 'duplicate question' downdown.
  # The assessments are sectioned by tabs and ordered by date and time.
  #
  # @return [Array<Hash{title: String, assessments: Array}>] Array containing one hash per tab.
  def ordered_assessments_by_tab
    tabs = current_course.assessments.ordered_by_date_and_title.
           pluck(:id, :tab_id, 'course_lesson_plan_items.title', :is_koditsu_enabled).
           group_by { |_, tab_id, _, _| tab_id }.
           map do |tab_id, assessments|
             {
               title: compound_tab_titles[tab_id],
               assessments: assessments.map do |id, _, title, is_koditsu|
                 { id: id, title: title, is_koditsu: is_koditsu }
               end
             }
           end
    tabs.sort_by { |tab_hash| tab_hash[:title] }
  end

  def student_course_users
    case params[:course_users]
    when COURSE_USERS[:my_students]
      current_course_user.my_students.without_phantom_users
    when COURSE_USERS[:my_students_w_phantom]
      current_course_user.my_students
    when COURSE_USERS[:students_w_phantom]
      @assessment.course.course_users.students
    when COURSE_USERS[:students]
      @assessment.course.course_users.students.without_phantom_users
    else
      false
    end
  end

  def can_access_assessment?
    return true unless @assessment.view_password_protected?

    can?(:access, @assessment) || can?(:manage, @assessment)
  end

  def authentication_service
    @authentication_service ||= Course::Assessment::AuthenticationService.new(@assessment, current_session_id)
  end

  def submissions
    @submissions ||=
      if @assessment.submissions.loaded?
        @assessment.submissions.select { |s| s.creator_id == current_user.id }
      else
        @assessment.submissions.where(creator_id: current_user.id)
      end
  end

  # Fetch all draft file annotation posts (generated by Codaveri)
  def draft_file_annotation_posts(course_users)
    programming_answer_ids =
      Course::Assessment::Answer.
      includes(:submission).
      where({ submission: { assessment_id: @assessment.id, creator_id: course_users.pluck(:user_id) } }).
      where(actable_type: Course::Assessment::Answer::Programming.name).
      pluck(:actable_id)

    file_annotation_ids =
      Course::Assessment::Answer::ProgrammingFileAnnotation.
      includes(file: :answer).
      where({ file: { answer: programming_answer_ids } }).
      pluck(:id)

    Course::Discussion::Post.unscoped.
      only_draft_posts.
      includes(:topic).
      where(topic: { actable_id: file_annotation_ids })
  end

  alias_method :load_submissions, :submissions
  alias_method :sync_assessment_and_question_in_koditsu, :sync_with_koditsu
end
