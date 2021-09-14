# frozen_string_literal: true
class Course::Admin::AssessmentSettingsController < Course::Admin::Controller
  add_breadcrumb :index, :course_admin_assessments_path

  def edit
    @categories = current_course.assessment_categories.includes(:tabs)
  end

  def update
    if current_course.update(category_params)
      redirect_to course_admin_assessments_path, success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def category_params
    params.require(:course).permit(:show_public_test_cases_output, :show_stdout_and_stderr,
                                   :allow_randomization, :allow_mrq_options_randomization,
                                   assessment_categories_attributes: [:id, :title, :weight,
                                                                      { tabs_attributes: [:id, :title, :weight, :category_id] }])
  end

  # @return [Course::AssessmentsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
