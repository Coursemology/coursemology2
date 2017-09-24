# frozen_string_literal: true
class Course::ObjectDuplicationsController < Course::ComponentController
  before_action :authorize_duplication

  def new
    load_target_courses_data
    load_assessments_component_data
  end

  def create
    job = Course::ObjectDuplicationJob.perform_later(
      current_course, authorized_target_course, objects_to_duplicate, current_user: current_user
    ).job
    render json: { redirect_url: job_path(job) }
  end

  protected

  def authorize_duplication
    authorize!(:duplicate, current_course)
  end

  private

  def load_target_courses_data
    @target_courses = ActsAsTenant.without_tenant do
      Course.accessible_by(current_ability, :duplicate_to).includes(:instance)
    end
  end

  def load_assessments_component_data
    @categories = current_course.assessment_categories.includes(tabs: :assessments)
  end

  def create_duplication_params
    @create_duplication_params ||= begin
      items_params = course_item_finders.keys.map { |key| { key => [] } }
      params.require(:object_duplication).permit(:target_course_id, items: items_params)
    end
  end

  def authorized_target_course
    ActsAsTenant.without_tenant do
      Course.find(create_duplication_params[:target_course_id]).tap do |target_course|
        authorize!(:duplicate_to, target_course)
      end
    end
  end

  # @return [Hash] Hash mapping each item type to finders that search for items of that type within
  #   the current course
  def course_item_finders
    @course_item_finders ||= {
      'CATEGORY' => ->(ids) { current_course.assessment_categories.find(ids) },
      'TAB' => ->(ids) { current_course.assessment_tabs.find(ids) },
      'ASSESSMENT' => ->(ids) { current_course.assessments.find(ids) }
    }
  end

  def objects_to_duplicate
    create_duplication_params[:items].map do |item_type, ids|
      course_item_finders[item_type].call(ids)
    end.flatten
  end
end
