# frozen_string_literal: true
class Course::Admin::Assessments::TabsController < Course::Admin::Controller
  load_and_authorize_resource :category,
                              through: :course,
                              through_association: :assessment_categories,
                              class: 'Course::Assessment::Category'
  load_and_authorize_resource :tab,
                              through: :category,
                              class: 'Course::Assessment::Tab'

  def new
  end

  def create
    if @tab.save
      render 'course/admin/assessment_settings/edit'
    else
      render json: { errors: @tab.errors }, status: :bad_request
    end
  end

  def destroy
    if @tab.destroy
      Course::Settings::AssessmentsComponent.delete_lesson_plan_item_setting(current_course,
                                                                             @tab.id)
      render 'course/admin/assessment_settings/edit'
    else
      render json: { errors: @tab.errors }, status: :bad_request
    end
  end

  private

  def tab_params
    params.require(:tab).permit(:title, :weight)
  end

  # @return [Course::AssessmentsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
