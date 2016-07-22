# frozen_string_literal: true
class Course::Assessment::AssessmentsController < Course::Assessment::Controller
  def index
    @assessments = @assessments.ordered_by_date.with_submissions_by(current_user)
  end

  def show
  end

  def new
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

  protected

  def load_assessment_options
    return super if skip_tab_filter?

    { through: :tab }
  end

  private

  def assessment_params
    params.require(:assessment).permit(:title, :description, :base_exp, :time_bonus_exp,
                                       :extra_bonus_exp, :start_at, :end_at, :bonus_end_at,
                                       :draft, :display_mode, :autograded, folder_params)
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
end
