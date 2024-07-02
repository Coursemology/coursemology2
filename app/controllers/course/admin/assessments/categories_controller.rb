# frozen_string_literal: true
class Course::Admin::Assessments::CategoriesController < Course::Admin::Controller
  load_and_authorize_resource :category,
                              through: :course,
                              through_association: :assessment_categories,
                              class: 'Course::Assessment::Category'

  def new
  end

  def create
    if @category.save
      render 'course/admin/assessment_settings/edit'
    else
      render json: { errors: @category.errors }, status: :bad_request
    end
  end

  def destroy
    tab_ids = @category.tabs.map(&:id)
    if @category.destroy
      tab_ids.each do |tab_id|
        Course::Settings::AssessmentsComponent.delete_lesson_plan_item_setting(current_course,
                                                                               tab_id)
      end
      render 'course/admin/assessment_settings/edit'
    else
      render json: { errors: @category.errors }, status: :bad_request
    end
  end

  private

  def category_params
    params.require(:category).permit(:title, :weight)
  end

  # @return [Course::AssessmentsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
