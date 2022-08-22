# frozen_string_literal: true
class Course::Material::MaterialsController < Course::Material::Controller
  load_and_authorize_resource :material, through: :folder, class: Course::Material.name

  def show
    authorize!(:read_owner, @material.folder)
    create_submission if @folder.owner_type == 'Course::Assessment'
    redirect_to @material.attachment.url(filename: @material.name)
  end

  def edit
  end

  def update
    if @material.update(material_params)
      respond_to do |format|
        format.html do
          redirect_to course_material_folder_path(current_course, @folder),
                      success: t('.success', name: @material.name)
        end
        format.json do
          course_user = @material.updater.course_users.find_by(course: current_course)
          if course_user
            id = course_user.id
            name = course_user.name
          else
            id = @material.updater.id
            name = @material.updater.name
          end
          render json: { id: @material.id,
                         name: @material.name,
                         description: @material.description,
                         updatedAt: @material.updated_at,
                         updater: { id: id, name: name, isCourseUser: !course_user.nil? }},
                         status: :ok
        end
      end
    else
      respond_to do |format|
        format.html { render 'edit' }
        format.json { render json: { errors: @folder.errors }, status: :bad_request }
      end
    end
  end

  def destroy
    if @material.destroy
      respond_to do |format|
        format.html do
          redirect_to course_material_folder_path(current_course, @folder),
                      success: t('.success', name: @material.name)
        end
        format.json { head :ok }
      end
    else
      redirect_to course_material_folder_path(current_course, @folder),
                  danger: t('.failure', message: @material.errors.full_messages.to_sentence)
    end
  end

  private

  def material_params
    params.require(:material).permit(:name, :description, attachments_params)
  end

  def create_submission
    current_course_user = current_course.course_users.find_by(user: current_user)
    @assessment = @folder.owner
    existing_submission = @assessment.submissions.find_by(creator: current_user)
    unless existing_submission
      @submission = @assessment.submissions.new(course_user: current_course_user)
      @submission.session_id = authentication_service.generate_authentication_token
      success = @assessment.create_new_submission(@submission, current_user)

      if success
        authentication_service.save_token_to_session(@submission.session_id)
        log_service.log_submission_access(request) if @assessment.session_password_protected?
        @submission.create_new_answers
      end
    end
    success
  end

  def authentication_service
    @authentication_service ||=
      Course::Assessment::SessionAuthenticationService.new(@assessment, session, @submission)
  end

  def log_service
    @log_service ||=
      Course::Assessment::SessionLogService.new(@assessment, session, @submission)
  end
end
