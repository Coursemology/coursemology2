# frozen_string_literal: true
class Course::Assessment::Submission::UpdateGuidedAssessmentService <
  Course::Assessment::Submission::UpdateService

  def update
    if params[:attempting_answer_id]
      submit_answer
    elsif params[:attempting_question_id]
      reattempt_question
    else
      super
    end
  end

  private

  def answer_id_param
    params.permit(:attempting_answer_id)[:attempting_answer_id]
  end

  def question_id_param
    params.permit(:attempting_question_id)[:attempting_question_id]
  end

  def step_param
    params.permit(:step)[:step]
  end

  def submit_answer
    if @submission.update_attributes(update_params)
      answer = @submission.answers.find(answer_id_param)
      answer.finalise!
      job = answer.auto_grade!(current_step_path)

      redirect_to job_path(job.job)
    else
      render 'edit'
    end
  end

  def reattempt_question
    question = @assessment.questions.find(question_id_param)
    question.attempt(@submission)
    if @submission.save
      redirect_to current_step_path
    else
      redirect_to current_step_path,
                  danger: t('course.assessment.submission.submissions.update.failure',
                            error: @submission.errors.full_messages.to_sentence)
    end
  end

  def questions_to_attempt
    @questions_to_attempt ||= @submission.assessment.questions.
                              step(@submission, step_param.to_i - 1)
  end

  def current_step_path
    edit_course_assessment_submission_path(current_course, @assessment,
                                           @submission, step: step_param)
  end
end
