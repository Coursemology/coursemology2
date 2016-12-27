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
    @programming_question.assign_attributes programming_question_params

    if programming_question_params[:file]
      @programming_question.package_type = :zip_upload
    else
      @programming_question.package_type = :online_editor
    end

    programming_question_service.generate_package(params) do |file|
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
      format.json do
        @meta = programming_question_service.extract_meta
        render 'edit'
      end
    end
  end

  def update
    @programming_question.assign_attributes programming_question_params

    programming_question_service.generate_package(params) do |file|
      @programming_question.file = file
    end

    respond_to do |format|
      format.html do
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
      format.json do
        if @programming_question.save!
          if @programming_question.import_job
            @redirect_url = job_path(@programming_question.import_job)
          end
        end

        render '_props'
      end
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

  def programming_question_service
    Course::Assessment::Question::Programming::ProgrammingPackageService.new(@programming_question)
  end
end
