# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingController < \
  Course::Assessment::QuestionsController
  load_and_authorize_resource :programming_question,
                              class: Course::Assessment::Question::Programming,
                              through: :assessment, parent: false

  def new
    respond_to do |format|
      format.html
      format.json { render 'new' }
    end
  end

  def create
    @programming_question.package_type =
      programming_question_params.key?(:file) ? :zip_upload : :online_editor

    programming_package_service.generate_package(params) if @programming_question.edit_online?

    save_and_redirect 'new'
  end

  def edit
    respond_to do |format|
      format.html
      format.json do
        @meta = programming_package_service.extract_meta
        render 'edit'
      end
    end
  end

  def update
    @programming_question.assign_attributes programming_question_params
    @programming_question.skills.clear if programming_question_params[:skill_ids].blank?

    programming_package_service.generate_package(params) if @programming_question.edit_online?

    respond_to do |format|
      format.html { save_and_redirect 'edit' }
      format.json { save_and_render_json }
    end
  end

  def destroy
    if @programming_question.destroy
      redirect_to course_assessment_path(current_course, @assessment),
                  success: t('.success')
    else
      error = @programming_question.errors.full_messages.to_sentence
      redirect_to course_assessment_path(current_course, @assessment),
                  danger: t('.failure', error: error)
    end
  end

  private

  def programming_question_params
    params.require(:question_programming).permit(
      :title, :description, :staff_only_comments, :maximum_grade,
      :language_id, :memory_limit, :time_limit, :attempt_limit,
      *attachment_params,
      skill_ids: []
    )
  end

  def save_and_redirect(template)
    if @programming_question.save
      if @programming_question.import_job
        redirect_to job_path(@programming_question.import_job)
      else
        redirect_to course_assessment_path(current_course, @assessment),
                    success: t('.success')
      end
    else
      render template
    end
  end

  def save_and_render_json
    if @programming_question.save && @programming_question.import_job
      @redirect_url = job_path(@programming_question.import_job)
    end

    render '_props'
  end

  def programming_package_service
    Course::Assessment::Question::Programming::ProgrammingPackageService.new(@programming_question)
  end
end
