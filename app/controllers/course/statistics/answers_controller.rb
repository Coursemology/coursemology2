# frozen_string_literal: true
class Course::Statistics::AnswersController < Course::Statistics::Controller
  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')
  load_resource :answer, class: 'Course::Assessment::Answer', only: :show

  def show
    @submission = @answer.submission
    @assessment = @submission.assessment
    @question = @answer.question
  end

  def all_answers
    @submission_question = Course::Assessment::SubmissionQuestion.
                           where(
                             submission_id: all_answers_params[:submission_id],
                             question_id: all_answers_params[:question_id]
                           ).
                           includes(actable: { files: { annotations:
                                             { discussion_topic: { posts: :codaveri_feedback } } } },
                                    discussion_topic: { posts: :codaveri_feedback }).first
    @all_answers = Course::Assessment::Answer.
                   unscope(:order).
                   order(:created_at).
                   where(
                     submission_id: all_answers_params[:submission_id],
                     question_id: all_answers_params[:question_id]
                   ).
                   where.not(workflow_state: :attempting)
    @question = Course::Assessment::Question.find(all_answers_params[:question_id])
    assessment_id = Course::QuestionAssessment.where(question_id: @question.id).first.assessment_id
    @assessment = Course::Assessment.find(assessment_id)
    @submission = Course::Assessment::Submission.find(all_answers_params[:submission_id])

    fetch_all_actable_questions(@question)
  end

  private

  def all_answers_params
    params.permit(:submission_id, :question_id)
  end

  def fetch_all_actable_questions(question)
    unless versioned_question?(question)
      @all_actable_questions = [question.actable]
      return
    end

    question = question.actable
    @all_actable_questions = [question]
    while question.parent
      @all_actable_questions << question.parent
      question = question.parent
    end
  end

  # at the moment, we only support versioning for Programming Question. In the future, we might extend the support
  # for all auto-gradable questions, such as MCQ/MRQ.
  def versioned_question?(question)
    question.actable.is_a?(Course::Assessment::Question::Programming)
  end
end
