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
      redirect_to course_material_folder_path(current_course, @folder),
                  success: t('.success', name: @material.name)
    else
      render 'edit'
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
      @assessment.create_new_submission(@submission)

      authentication_service.save_token_to_session(@submission.session_id)
      log_service.log_submission_access(request) if @assessment.session_password_protected?
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
