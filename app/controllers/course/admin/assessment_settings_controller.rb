# frozen_string_literal: true
class Course::Admin::AssessmentSettingsController < Course::Admin::Controller
  add_breadcrumb :index, :course_admin_assessments_path

  def edit
    respond_to do |format|
      format.html { render 'course/admin/index' }
      format.json
    end
  end

  def update
    if current_course.update(category_params)
      render 'edit'
    else
      render json: { errors: current_course.errors }, status: :bad_request
    end
  end

  def move_assessments
    source_tab_id, destination_tab_id = move_assessments_params

    ActiveRecord::Base.transaction do
      @moved_count = Course::Assessment.where(tab_id: source_tab_id).update_all(tab_id: destination_tab_id)
    end

    render json: { moved_assessments_count: @moved_count }
  rescue ActiveRecord::StatementInvalid
    head :bad_request
  end

  def move_tabs
    source_category_id, destination_category_id = move_tabs_params

    ActiveRecord::Base.transaction do
      @moved_count = Course::Assessment::Tab.where(category_id: source_category_id).update_all(
        category_id: destination_category_id
      )
    end

    render json: { moved_tabs_count: @moved_count }
  rescue ActiveRecord::StatementInvalid
    head :bad_request
  end

  private

  def move_assessments_params
    params.require([:source_tab_id, :destination_tab_id])
  end

  def move_tabs_params
    params.require([:source_category_id, :destination_category_id])
  end

  def category_params
    params.require(:course).permit(:show_public_test_cases_output, :show_stdout_and_stderr,
                                   :allow_randomization, :allow_mrq_options_randomization,
                                   assessment_categories_attributes: [:id, :title, :weight,
                                                                      tabs_attributes: [:id, :title,
                                                                                        :weight,
                                                                                        :category_id]])
  end

  # @return [Course::AssessmentsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
