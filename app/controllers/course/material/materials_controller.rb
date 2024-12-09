# frozen_string_literal: true
class Course::Material::MaterialsController < Course::Material::Controller
  load_and_authorize_resource :material, through: :folder, class: 'Course::Material'

  def show
    authorize!(:read_owner, @material.folder)
    create_submission if @folder.owner_type == 'Course::Assessment'
    render json: { url: @material.attachment.url(filename: @material.name), name: @material.name }
  end

  def update
    if @material.workflow_state != 'chunking' && @material.update(material_params)
      # deletes material's text chunk if file has been changed and file has been chunked
      delete_material_text_chunks if material_params['file'] && @material.workflow_state == 'chunked'
      course_user = @material.attachment.updater.course_users.find_by(course: current_course)
      user = course_user || @material.attachment.updater
      render json: { id: @material.id,
                     name: @material.name,
                     description: @material.description,
                     updatedAt: @material.attachment.updated_at,
                     workflowState: @material.workflow_state,
                     updater: { id: user.id, name: user.name,
                                userUrl: url_to_user_or_course_user(current_course, user) } },
             status: :ok
    else
      render json: { errors: @folder.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def destroy
    if @material.destroy && @material.workflow_state != 'chunking'
      head :ok
    else
      render json: { errors: @material.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def create_text_chunks
    job = last_text_chunking_job
    if job
      render partial: 'jobs/submitted', locals: { job: job }
    else
      job = @material.text_chunking!(current_user)
      render partial: 'jobs/submitted', locals: { job: job.job }
    end
  end

  def destroy_text_chunks
    if @material.text_chunks.destroy_all && @material.workflow_state == 'chunked'
      @material.delete_chunks!
      @material.save
      head :ok
    else
      render json: { errors: @material.errors.full_messages.to_sentence }, status: :bad_request
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
        authentication_service.save_token_to_redis(@submission.session_id)
        log_service.log_submission_access(request) if @assessment.session_password_protected?
        @submission.create_new_answers
      end
    end
    success
  end

  def authentication_service
    @authentication_service ||=
      Course::Assessment::SessionAuthenticationService.new(@assessment, current_session_id, @submission)
  end

  def log_service
    @log_service ||=
      Course::Assessment::SessionLogService.new(@assessment, current_session_id, @submission)
  end

  def last_text_chunking_job
    job = @material.text_chunking&.job
    (job&.status == 'submitted') ? job : nil
  end

  def delete_material_text_chunks
    if @material.text_chunks.destroy_all
      @material.delete_chunks!
      @material.save
    else
      render json: { errors: @material.errors.full_messages.to_sentence }, status: :bad_request
    end
  end
end
