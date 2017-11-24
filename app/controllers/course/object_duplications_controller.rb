# frozen_string_literal: true
class Course::ObjectDuplicationsController < Course::ComponentController
  before_action :authorize_duplication
  helper Course::Achievement::AchievementsHelper

  def new
    respond_to do |format|
      format.json do
        load_target_courses_data
        load_assessments_component_data
        load_survey_component_data
        load_achievements_component_data
        load_materials_component_data
        load_videos_component_data
      end
    end
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
    ActsAsTenant.without_tenant do
      @target_courses = Course.accessible_by(current_ability, :duplicate_to).includes(:instance)
      @root_folder_map = Course::Material::Folder.root.includes(:materials, :children).
                         where(course_id: @target_courses.map(&:id)).map do |folder|
                           [folder.course_id, folder]
                         end.to_h
    end
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
    @videos = current_course.videos
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
      'ASSESSMENT' => ->(ids) { current_course.assessments.find(ids) },
      'SURVEY' => ->(ids) { current_course.surveys.find(ids) },
      'ACHIEVEMENT' => ->(ids) { current_course.achievements.find(ids) },
      'FOLDER' => ->(ids) { current_course.material_folders.concrete.find(ids) },
      'MATERIAL' => ->(ids) { current_course.materials.in_concrete_folder.find(ids) },
      'VIDEO' => ->(ids) { current_course.videos.find(ids) }
    }
  end

  def objects_to_duplicate
    create_duplication_params[:items].to_h.map do |item_type, ids|
      course_item_finders[item_type].call(ids)
    end.flatten
  end
end
