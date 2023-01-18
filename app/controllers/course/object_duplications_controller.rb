# frozen_string_literal: true
class Course::ObjectDuplicationsController < Course::ComponentController
  before_action :authorize_duplication
  helper Course::Achievement::AchievementsHelper

  def new
    respond_to do |format|
      format.json do
        load_source_courses_data
        load_destination_courses_data
        load_items_data
      end
    end
  end

  def create
    job = Course::ObjectDuplicationJob.perform_later(
      current_course, authorized_destination_course, objects_to_duplicate, current_user: current_user
    ).job
    respond_to do |format|
      format.json { render partial: 'jobs/submitted', locals: { job: job } }
    end
  end

  # Duplication data for the current course
  def data
    respond_to do |format|
      format.json { load_items_data }
    end
  end

  protected

  def authorize_duplication
    authorize!(:duplicate_from, current_course)
  end

  private

  def load_source_courses_data
    ActsAsTenant.without_tenant do
      # Workaround to get Courses where current user is allowed to duplicate contents from
      # without having to use accessible_by, which can take up to 5 minutes with includes
      course_copiers = CourseUser.where(user: current_user).
                       where(role: CourseUser::MANAGER_ROLES.to_a) +
                       CourseUser.where(user: current_user).
                       where(role: :observer)
      @source_courses = Course.includes(:instance).find(course_copiers.map(&:course_id))
    end
  end

  def load_destination_courses_data
    ActsAsTenant.without_tenant do
      # Workaround to get Courses where current user plays one of manager roles
      # without having to use accessible_by, which can take up to 5 minutes with includes
      course_managers = CourseUser.where(user: current_user).
                        where(role: CourseUser::MANAGER_ROLES.to_a)
      @destination_courses = Course.includes(:instance).find(course_managers.map(&:course_id))
      @root_folder_map = Course::Material::Folder.root.includes(:materials, :children).
                         where(course_id: @destination_courses.map(&:id)).to_h do |folder|
                           [folder.course_id, folder]
                         end
    end
  end

  def load_items_data
    load_assessments_component_data
    load_survey_component_data
    load_achievements_component_data
    load_materials_component_data
    load_videos_component_data
  end

  def load_assessments_component_data
    @categories = current_course.assessment_categories.includes(tabs: :assessments)
  end

  def load_survey_component_data
    @surveys = current_course.surveys
  end

  def load_achievements_component_data
    @achievements = current_course.achievements
  end

  def load_materials_component_data
    @folders = current_course.material_folders.includes(:materials).concrete
  end

  def load_videos_component_data
    @video_tabs = current_course.video_tabs.includes(:videos)
  end

  def create_duplication_params
    @create_duplication_params ||= begin
      items_params = course_item_finders.keys.map { |key| { key => [] } }
      params.require(:object_duplication).permit(:destination_course_id, items: items_params)
    end
  end

  def authorized_destination_course
    ActsAsTenant.without_tenant do
      Course.find(create_duplication_params[:destination_course_id]).tap do |destination_course|
        authorize!(:duplicate_to, destination_course)
      end
    end
  end

  # @return [Hash] Hash mapping each item type to finders that search for items of that type within
  #   the current course
  def course_item_finders
    @course_item_finders ||= {
      'CATEGORY' => ->(ids) { current_course.assessment_categories.find(ids) },
      'TAB' => ->(ids) { current_course.assessment_tabs.find(ids) },
      'ASSESSMENT' => ->(ids) { current_course.assessments.find(ids) },
      'SURVEY' => ->(ids) { current_course.surveys.find(ids) },
      'ACHIEVEMENT' => ->(ids) { current_course.achievements.find(ids) },
      'FOLDER' => ->(ids) { current_course.material_folders.concrete.find(ids) },
      'MATERIAL' => ->(ids) { current_course.materials.in_concrete_folder.find(ids) },
      'VIDEO_TAB' => ->(ids) { current_course.video_tabs.find(ids) },
      'VIDEO' => ->(ids) { current_course.videos.find(ids) }
    }
  end

  def objects_to_duplicate
    create_duplication_params[:items].to_h.map do |item_type, ids|
      course_item_finders[item_type].call(ids)
    end.flatten
  end

  # @return [Course::DuplicationComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_duplication_component]
  end
end
