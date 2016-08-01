# frozen_string_literal: true
class Course::Assessment::Submission::UpdateGuidedAssessmentService <
  Course::Assessment::Submission::UpdateService

  def load_or_create_answers
    super if @submission.attempting?

    @answers = @submission.answers.where(question: current_question)
  end

  private

  def step_param
    params.permit(:step)[:step]
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
    @assessment.questions.where(id: current_question)
  end

  def current_question
    @current_question ||=
      begin
        step = step_param.to_i - 1
        if @submission.attempting?
          @assessment.questions.step(@submission, step)
        else
          step = [[0, step].max, @assessment.questions.length - 1].min
          @assessment.questions.fetch(step)
        end
      end
  end

  def current_step_path
    edit_course_assessment_submission_path(current_course, @assessment,
                                           @submission, step: step_param)
  end
end
