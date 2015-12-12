class Course::Assessment::Question::ProgrammingController < \
  Course::Assessment::QuestionsController
  load_and_authorize_resource :programming_question,
                              class: Course::Assessment::Question::Programming,
                              through: :assessment, parent: false

  def new
  end

  def create
    if @programming_question.save
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
  end

  def update
    if @programming_question.update_attributes(programming_question_params)
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
      :title, :description, :maximum_grade, :language_id, :memory_limit, :time_limit,
      *attachment_params)
  end
end
