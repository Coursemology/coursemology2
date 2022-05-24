# frozen_string_literal: true
class Course::Assessment::AssessmentsController < Course::Assessment::Controller
  include Course::Assessment::AssessmentsHelper
  before_action :load_question_duplication_data, only: [:show, :reorder]

  COURSE_USERS = { my_students: 'my_students',
                   my_students_w_phantom: 'my_students_w_phantom',
                   students: 'students',
                   students_w_phantom: 'students_w_phantom' }.freeze

  def index
    @assessments = @assessments.ordered_by_date_and_title.with_submissions_by(current_user)

    @items_hash = @course.lesson_plan_items.where(actable_id: @assessments.pluck(:id),
                                                  actable_type: Course::Assessment.name).
                  preload(actable: :conditions).
                  with_reference_times_for(current_course_user).
                  with_personal_times_for(current_course_user).
                  to_h do |item|
      [item.actable_id, item]
    end
    @conditional_service = Course::Assessment::AchievementPreloadService.new(@assessments)
  end

  def show
    render 'authenticate' unless can_access_assessment?

    @question_assessments = @assessment.question_assessments.with_question_actables
    @assessment_conditions = @assessment.assessment_conditions.includes({ conditional: :actable })
    @questions = @assessment.questions.includes({ actable: :test_cases })
  end

  def new
  end

  def create
    @assessment.update_randomization(randomization_params)
    if @assessment.save
      render json: { id: @assessment.id }, status: :ok
    else
      render json: { errors: @assessment.errors }, status: :bad_request
    end
  end

  def edit
    @assessment.description = helpers.format_html(@assessment.description)
  end

  def update
    @assessment.update_mode(autograded_params)
    @assessment.update_randomization(randomization_params)
    if @assessment.update(assessment_params)
      head :ok
    else
      render json: { errors: @assessment.errors }, status: :bad_request
    end
  end

  def destroy
    if @assessment.destroy
      redirect_to course_assessments_path(current_course, category: @assessment.tab.category_id,
                                                          tab: @assessment.tab_id),
                  success: t('.success', assessment: @assessment.title)
    else
      redirect_to course_assessment_path(current_course, @assessment),
                  danger: t('.failure', error: @assessment.errors.full_messages.to_sentence)
    end
  end

  # Reorder questions for an assessment
  def reorder
    raise ArgumentError, 'Invalid ordering for assessment questions' unless valid_ordering?(question_order_ids)

    Course::QuestionAssessment.transaction do
      question_order_ids.each_with_index do |id, index|
        question_assessments_hash[id].update_attribute(:weight, index)
      end
    end
  end

  def authenticate
    if assessment_not_started(@assessment.time_for(current_course_user))
      render json: { success: false }
    elsif authentication_service.authenticate(params.require(:assessment).permit(:password)[:password])
      render json: { success: true }
    else
      render json: { success: false }
    end
  end

  def remind
    authorize!(:manage, @assessment)
    return head :bad_request unless course_user_ids

    Course::Assessment::ReminderService.
      send_closing_reminder(@assessment, course_user_ids.pluck(:id), include_unsubscribed: true)
    head :ok
  end

  protected

  def load_assessment_options
    return super if skip_tab_filter?

    { through: :tab }
  end

  private

  def question_order_ids
    @order_from_user ||= begin
      integer_type = ActiveModel::Type::Integer.new
      params.require(:question_order).map { |id| integer_type.cast(id) }
    end
  end

  def assessment_params
    base_params = [:title, :description, :base_exp, :time_bonus_exp, :start_at, :end_at, :tab_id,
                   :bonus_end_at, :published, :autograded, :show_mcq_mrq_solution, :show_private,
                   :show_evaluation, :use_public, :use_private, :use_evaluation, :has_personal_times,
                   :affects_personal_times, :block_student_viewing_after_submitted]
    base_params += if autograded?
                     [:skippable, :allow_partial_submission, :show_mcq_answer]
                   else
                     [:view_password, :session_password, :tabbed_view, :delayed_grade_publication]
                   end
    params.require(:assessment).permit(*base_params, folder_params)
  end

  def autograded_params
    params.require(:assessment).permit(:autograded)
  end

  def randomization_params
    params.require(:assessment).permit(:randomization)
  end

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
            [id, tabs.length > 1 ? "#{category_title} - #{title}" : category_title]
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
           pluck(:id, :tab_id, 'course_lesson_plan_items.title').
           group_by { |_, tab_id, _| tab_id }.
           map do |tab_id, assessments|
             {
               title: compound_tab_titles[tab_id],
               assessments: assessments.map { |id, _, title| { id: id, title: title } }
             }
           end
    tabs.sort_by { |tab_hash| tab_hash[:title] }
  end

  def course_user_ids
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
    @authentication_service ||= Course::Assessment::AuthenticationService.new(@assessment, session)
  end
end
