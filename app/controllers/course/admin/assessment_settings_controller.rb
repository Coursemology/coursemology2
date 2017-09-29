# frozen_string_literal: true
class Course::Admin::AssessmentSettingsController < Course::Admin::Controller
  add_breadcrumb :index, :course_admin_assessments_path

  def edit
    @categories = current_course.assessment_categories.includes(:tabs)
  end

  def update
    if current_course.update_attributes(category_params)
      redirect_to course_admin_assessments_path, success: t('.success')
    else
      render 'edit'
    end
  end

  private

  def category_params
    params.require(:course).permit(:enable_public_test_cases_output,assessment_categories_attributes:
                                     [:id, :title, :weight,
                                      { tabs_attributes: [:id, :title, :weight, :category_id] }])
  end
end
