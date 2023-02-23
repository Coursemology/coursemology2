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

    source_tab = Course::Assessment::Tab.find(source_tab_id)
    destination_tab = Course::Assessment::Tab.find(destination_tab_id)
    moved_assessments_count = 0

    ActiveRecord::Base.transaction do
      source_tab.assessments.each do |assessment|
        assessment.update!(tab: destination_tab)
        moved_assessments_count += 1
      end
    end

    render json: { moved_assessments_count: moved_assessments_count }
  rescue StandardError
    head :bad_request
  end

  def move_tabs
    source_category_id, destination_category_id = move_tabs_params

    source_category = Course::Assessment::Category.find(source_category_id)
    moved_tabs_count = 0

    ActiveRecord::Base.transaction do
      source_category.tabs.each do |tab|
        tab.update!(category_id: destination_category_id)
        moved_tabs_count += 1
      end
    end

    render json: { moved_tabs_count: moved_tabs_count }
  rescue StandardError
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
    params.require(:course).permit(
      :show_public_test_cases_output,
      :show_stdout_and_stderr,
      # Randomized Assessment is temporarily hidden (PR#5406)
      # :allow_randomization,
      :allow_mrq_options_randomization,
      :programming_max_time_limit,
      assessment_categories_attributes: [
        :id,
        :title,
        :weight,
        tabs_attributes: [
          :id,
          :title,
          :weight,
          :category_id
        ]
      ]
    )
  end

  # @return [Course::AssessmentsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_assessments_component]
  end
end
