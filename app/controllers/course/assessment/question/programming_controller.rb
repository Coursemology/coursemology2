# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingController < \
  Course::Assessment::QuestionsController
  load_and_authorize_resource :programming_question,
                              class: Course::Assessment::Question::Programming,
                              through: :assessment, parent: false

  def new
    @template = 'course/assessment/question/programming/new.json.jbuilder'
  end

  def create
    @template = 'course/assessment/question/programming/new.json.jbuilder'
    @programming_question.package_type = :zip_upload

    save_and_redirect('new', t('.success'))
  end

  def edit
    @template = 'course/assessment/question/programming/edit.json.jbuilder'
    @meta = programming_package_service.extract_meta if @programming_question.edit_online?
  end

  def update
    @programming_question.assign_attributes programming_question_params
    @programming_question.skills.clear if programming_question_params[:skill_ids].blank?

    respond_to do |format|
      format.html { save_and_redirect('edit', t('.success')) }
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

  def save_and_redirect(template, message)
    if @programming_question.save
      if @programming_question.import_job
        redirect_to job_path(@programming_question.import_job)
      else
        redirect_to course_assessment_path(current_course, @assessment),
                    success: message
      end
    else
      render template
    end
  end

  def save_and_render_json
    if @programming_question.save! && @programming_question.import_job
      @redirect_url = job_path(@programming_question.import_job)
    end

    render '_props'
  end

  def programming_package_service(params = nil)
    Course::Assessment::Question::Programming::ProgrammingPackageService.new(
      @programming_question, params
    )
  end
end
