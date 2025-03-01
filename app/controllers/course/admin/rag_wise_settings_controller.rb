# frozen_string_literal: true
class Course::Admin::RagWiseSettingsController < Course::Admin::Controller
  before_action :set_parent_courses, only: [:forums, :courses]
  before_action :authorize_import_forums, only: [:import_course_forums, :destroy_imported_discussions]
  def edit
    respond_to do |format|
      format.json
    end
  end

  def update
    if @settings.update(rag_wise_settings_params) && current_course.save
      render 'edit'
    else
      render json: { errors: @settings.errors }, status: :bad_request
    end
  end

  def materials
    @materials = current_course.materials.includes(:folder).
                 where('course_materials.name ~* ?', '\\.(pdf|txt)$').to_a
  end

  def folders
    @folders = current_course.material_folders
  end

  def courses
    course_users = CourseUser.where(
      user_id: current_user.id,
      course_id: @parent_courses.map(&:id)
    ).index_by(&:course_id) # Load CourseUsers into a hash for fast lookup

    @courses = @parent_courses.map do |course|
      {
        course: course,
        canManageCourse: course_users[course.id]&.manager_or_owner?
      }
    end
  end

  def forums
    @forums = Course::Forum.includes(:course_forum_exports).
              where(course_id: @parent_courses.map(&:id)).
              map do |forum|
      imports_hash = forum.course_forum_exports.to_h { |imp| [imp.course_id, imp] }
      {
        forum: forum,
        workflow_state: imports_hash[current_course.id]&.workflow_state || 'not_imported'
      }
    end
  end

  def import_course_forums
    forum_ids = import_course_forum_params[:forum_ids]
    current_course.create_missing_forum_imports(forum_ids)

    forum_imports = current_course.forum_imports.where(imported_forum_id: forum_ids)
    job = nil
    if forum_ids.length == 1
      @forum_import = forum_imports.first
      job = last_forum_importing_job
    end
    if job
      render partial: 'jobs/submitted', locals: { job: job }
    else
      job = Course::Forum::Import.forum_importing!(forum_imports,
                                                   current_user)
      render partial: 'jobs/submitted', locals: { job: job.job }
    end
  end

  def destroy_imported_discussions
    forum_imports = current_course.forum_imports.where(imported_forum_id: import_course_forum_params[:forum_ids])
    if Course::Forum::Import.destroy_imported_discussions(forum_imports)
      head :ok
    else
      render json: { errors: forum_imports.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  private

  def authorize_import_forums
    forum_ids = import_course_forum_params[:forum_ids]
    authorize!(:import_course_forums, Course::Forum.find(forum_ids.first).course)
  end

  def set_parent_courses
    parent_courses = []
    course = current_course

    # Traverse the parent chain
    while course.duplication_traceable.present? && course.duplication_traceable.source_id.present?
      next_course = course.duplication_traceable.source
      parent_courses << next_course
      course = next_course
    end

    # Set @parent_courses to the found parent courses
    @parent_courses = Course.where(id: parent_courses.map(&:id))
  end

  def rag_wise_settings_params
    params.require(:settings_rag_wise_component).permit(:response_workflow, :roleplay)
  end

  def import_course_forum_params
    params.require(:forum_imports).permit(forum_ids: [])
  end

  def component
    current_component_host[:course_rag_wise_component]
  end

  def last_forum_importing_job
    job = @forum_import&.job
    (job&.status == 'submitted') ? job : nil
  end
end
