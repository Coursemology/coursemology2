# frozen_string_literal: true
class Course::Statistics::AnswersController < Course::Statistics::Controller
  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')

  def latest_answer
    @answer = Course::Assessment::Answer.find(answer_params[:id])
    @submission = @answer.submission
    @question = @answer.question
    @assessment = @submission.assessment

    submission_id = @answer.submission_id
    question_id = @answer.question_id

    @question_index = question_index(question_id)

    @submission_question = Course::Assessment::SubmissionQuestion.
                           where(submission_id: submission_id, question_id: question_id).
                           includes(actable: { files: { annotations:
                                             { discussion_topic: { posts: :codaveri_feedback } } } },
                                    discussion_topic: { posts: :codaveri_feedback }).first
  end

  def attempts
    answer = Course::Assessment::Answer.find(answer_params[:id])
    @submission = answer.submission
    @question = answer.question
    @assessment = @submission.assessment

    submission_id = answer.submission_id
    question_id = answer.question_id

    @question_index = question_index(question_id)

    @submission_question = Course::Assessment::SubmissionQuestion.
                           where(submission_id: submission_id, question_id: question_id).
                           includes(actable: { files: { annotations:
                                             { discussion_topic: { posts: :codaveri_feedback } } } },
                                    discussion_topic: { posts: :codaveri_feedback }).first

    fetch_all_answers(submission_id, question_id, answer_params[:limit].to_i)
  end

  def all_attempts
    @submission_question = Course::Assessment::SubmissionQuestion.find(submission_question_params[:id])
    @submission = @submission_question.submission
    @question = @submission_question.question
    @assessment = @submission.assessment

    submission_id = @submission_question.submission_id
    question_id = @submission_question.question_id

    @question_index = question_index(question_id)

    fetch_all_answers(submission_id, question_id, -1)
  end

  private

  def answer_params
    params.permit(:id, :limit)
  end

  def submission_question_params
    params.permit(:id)
  end

  def question_index(question_id)
    question_ids = Course::QuestionAssessment.
                   where(assessment_id: @assessment.id).
                   order(:weight).
                   pluck(:question_id)

    question_ids.index(question_id)
  end

  def fetch_all_answers(submission_id, question_id, limit)
    @all_answers = if limit == -1
                     Course::Assessment::Answer.
                       unscope(:order).
                       order(:submitted_at).
                       where(submission_id: submission_id, question_id: question_id)
                   else
                     Course::Assessment::Answer.
                       unscope(:order).
                       order(:submitted_at).
                       where(submission_id: submission_id, question_id: question_id).
                       limit(limit)
                   end
  end
end
