# frozen_string_literal: true
class Course::Assessment::AssessmentsController < Course::Assessment::Controller
  def index
    authorize! :index, @assessments
    @assessments = @assessments.ordered_by_date.with_submissions_by(current_user)
    @conditional_service = Course::Assessment::AchievementPreloadService.new(@assessments)
  end

  def show
  end

  def new
    @assessment.autograded = params[:autograded] == 'true'
  end

  def create
    if @assessment.save
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success', title: @assessment.title)
    else
      render 'new'
    end
  end

  def edit
  end

  def update
    if @assessment.update(assessment_params)
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success', title: @assessment.title)
    else
      render 'edit'
    end
  end

  def destroy
    if @assessment.destroy
      redirect_to course_assessments_path(current_course),
                  success: t('.success', assessment: @assessment.title)
    else
      redirect_to course_assessments_path(current_course),
                  danger: t('.failure', error: @assessment.errors.full_messages.to_sentence)
    end
  end

  # Reorder questions for an assessment
  def reorder
    unless valid_ordering?(question_order_params)
      raise ArgumentError, 'Invalid ordering for assessment questions'
    end

    Course::Assessment::Question.transaction do
      question_order_params.each_with_index do |id, index|
        questions_hash[id].update_attribute(:weight, index)
      end
    end
  end

  protected

  def load_assessment_options
    return super if skip_tab_filter?

    { through: :tab }
  end

  private

  def question_order_params
    params.require(:question_order)
  end

  def assessment_params
    params.require(:assessment).permit(:title, :description, :base_exp, :time_bonus_exp,
                                       :start_at, :end_at, :bonus_end_at,
                                       :published, :mode, :autograded, :password, :tabbed_view,
                                       :skippable, folder_params)
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

  # Maps question ids to their respective questions
  #
  # @return [Hash{Integer => Course::Assessment::Question}]
  def questions_hash
    @questions_hash ||= @assessment.questions.map do |question|
      [question.id.to_s, question]
    end.to_h
  end

  # Checks if a proposed question ordering is valid
  #
  # @param [Array<Integer>] proposed_ordering
  # @return [Boolean]
  def valid_ordering?(proposed_ordering)
    questions_hash.keys.sort == proposed_ordering.sort
  end
end
