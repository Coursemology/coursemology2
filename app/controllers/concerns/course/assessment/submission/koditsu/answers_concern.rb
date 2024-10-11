# frozen_string_literal: true
module Course::Assessment::Submission::Koditsu::AnswersConcern
  extend ActiveSupport::Concern

  def build_answer_hash(answers)
    @answer_hash = answers.to_h do |answer|
      question = answer.question
      koditsu_question_id = question.koditsu_question_id
      [koditsu_question_id, [question, answer]]
    end
  end

  def destroy_all_existing_autogradings(answers)
    Course::Assessment::Answer::ProgrammingAutoGrading.where(answer: answers).destroy_all
  end

  def destroy_all_existing_files(answers)
    answer_ids = answers.map(&:actable_id)

    Course::Assessment::Answer::ProgrammingFile.where(answer_id: answer_ids).destroy_all
  end

  def update_all_submission_files(submission_answers)
    updated_files = submission_answers.flat_map do |submission_answer|
      _, answer = @answer_hash[submission_answer['questionId']]

      submission_answer['files'].map do |file|
        {
          filename: file['path'],
          content: file['content'],
          answer_id: answer.actable_id
        }
      end
    end

    raise ActiveRecord::Rollback unless Course::Assessment::Answer::ProgrammingFile.
                                        insert_all(updated_files)
  end

  def process_all_answers(submission_answers)
    update_all_submission_files(submission_answers)

    process_all_test_case_results(submission_answers)
  end

  def process_all_test_case_results(submission_answers)
    submission_with_test_case_results = submission_answers.reject do |sa|
      sa['exprTestcaseResults'].empty?
    end

    @autograding_id_hash = submission_with_test_case_results.to_h do |submission_answer|
      _, answer = @answer_hash[submission_answer['questionId']]

      autograding_id = new_autograding_id(answer)

      [answer.id, autograding_id]
    end

    update_all_answer_status(submission_with_test_case_results)
    save_all_test_case_results(submission_with_test_case_results)
  end

  def update_all_answer_status(submission_answers)
    submitted_answers = submission_answers.filter { |answer| answer['status'] == 'submitted' }

    updated_answer_objects = submitted_answers.map do |submitted_answer|
      question, answer = @answer_hash[submitted_answer['questionId']]
      build_answer_object(question, answer, submitted_answer)
    end

    raise ActiveRecord::Rollback unless Course::Assessment::Answer.upsert_all(updated_answer_objects)
  end

  def build_answer_object(question, answer, submitted_answer)
    {
      id: answer.id,
      submission_id: answer.submission_id,
      question_id: question.id,
      workflow_state: 'submitted',
      correct: submitted_answer['exprTestcaseResults'].all? { |tc| tc['result']['success'] },
      submitted_at: DateTime.parse(submitted_answer['filesSavedAt']).in_time_zone&.iso8601 ||
        Time.now.utc
    }
  end

  def save_all_test_case_results(submission_answers)
    test_case_result_objects = submission_answers.flat_map do |submission_answer|
      question, answer = @answer_hash[submission_answer['questionId']]
      test_case_index_id_hash = @test_cases_order[question.id]
      test_case_results = submission_answer['exprTestcaseResults']

      test_case_results.map do |tc_result|
        {
          auto_grading_id: @autograding_id_hash[answer.id],
          test_case_id: test_case_index_id_hash[tc_result['testcase']['index']],
          passed: tc_result['result']['success'],
          messages: { output: tc_result['result']['display'] }
        }
      end
    end

    raise ActiveRecord::Rollback unless Course::Assessment::Answer::ProgrammingAutoGradingTestResult.
                                        insert_all(test_case_result_objects)
  end

  def new_autograding_id(answer)
    autograding = Course::Assessment::Answer::ProgrammingAutoGrading.new(answer: answer)
    raise ActiveRecord::Rollback unless autograding.save!

    autograding.id
  end
end
