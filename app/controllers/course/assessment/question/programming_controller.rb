# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingController < \
  Course::Assessment::QuestionsController
  include Course::Assessment::Question::Programming::PackageGenerationConcern
  load_and_authorize_resource :programming_question,
                              class: Course::Assessment::Question::Programming,
                              through: :assessment, parent: false

  def new
    respond_to do |format|
      format.html
      format.json {
        @can_switch_package_type = true
        @path = new_course_assessment_question_programming_path(current_course, @assessment).chomp('/new')
        render 'props'
      }
    end
  end

  def create
    if programming_question_params[:file]
      @programming_question.package_type = :zip_upload
    else
      @programming_question.package_type = :online_editor
    end

    package(@programming_question.language, @programming_question.attachment, params) do |file|
      @programming_question.file = file
    end

    if @programming_question.save!
      if @programming_question.import_job
        redirect_to job_path(@programming_question.import_job)
      else
        redirect_to course_assessment_path(current_course, @assessment),
                    success: t('.success')
      end
    else
      render 'new'
    end
  end

  def edit
    respond_to do |format|
      format.html
      format.json {
        @meta = extract_meta(@programming_question.language, @programming_question.attachment)
        @can_switch_package_type = false
        @path = course_assessment_question_programming_path(current_course, @assessment, @programming_question)
        render 'props'
      }
    end
  end

  def update
    package(@programming_question.language, @programming_question.attachment, params) do |file|
      @programming_question.file = file
    end

    if @programming_question.save!
      if @programming_question.import_job
        redirect_to job_path(@programming_question.import_job)
      else
        redirect_to course_assessment_path(current_course, @assessment),
                    success: t('.success')
      end
    else
      render 'edit'
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
end
