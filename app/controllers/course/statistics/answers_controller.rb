# frozen_string_literal: true
class Course::Statistics::AnswersController < Course::Statistics::Controller
  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')

  MAX_ANSWERS_COUNT = 10

  def question_answer_details
    @answer = Course::Assessment::Answer.find(answer_params[:id])
    @submission = @answer.submission
    @assessment = @submission.assessment

    @submission_question = Course::Assessment::SubmissionQuestion.
                           where(submission_id: @answer.submission_id, question_id: @answer.question_id).
                           includes(actable: { files: { annotations:
                                             { discussion_topic: { posts: :codaveri_feedback } } } },
                                    discussion_topic: { posts: :codaveri_feedback }).first

    fetch_all_answers(@answer.submission_id, @answer.question_id)
  end

  def all_answers
    @submission_question = Course::Assessment::SubmissionQuestion.find(submission_question_params[:id])
    submission_id = @submission_question.submission_id
    @submission = Course::Assessment::Submission.find(submission_id)

    question_id = @submission_question.question_id
    @question = Course::Assessment::Question.find(question_id)
    @assessment = @submission.assessment

    @submission_question = Course::Assessment::SubmissionQuestion.
                           where(submission_id: submission_id, question_id: question_id).
                           includes({ discussion_topic: { posts: :codaveri_feedback } }).first
    @question_index = question_index(question_id)
    @all_answers = Course::Assessment::Answer.
                   unscope(:order).
                   order(:created_at).
                   where(submission_id: submission_id, question_id: question_id)
  end

  private

  def answer_params
    params.permit(:id)
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

  def fetch_all_answers(submission_id, question_id)
    answers = Course::Assessment::Answer.
              unscope(:order).
              order(created_at: :desc).
              where(submission_id: submission_id, question_id: question_id)

    current_answer = answers.find(&:current_answer?)
    @all_answers = answers.where(current_answer: false).limit(MAX_ANSWERS_COUNT - 1).to_a.reverse
    @all_answers.unshift(current_answer)
  end
end
