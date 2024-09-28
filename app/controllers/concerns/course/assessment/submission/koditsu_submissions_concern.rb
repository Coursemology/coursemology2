# frozen_string_literal: true
# rubocop:disable Metrics/ModuleLength
module Course::Assessment::Submission::KoditsuSubmissionsConcern
  extend ActiveSupport::Concern
  include Course::Assessment::Question::KoditsuQuestionConcern

  def fetch_all_submissions_from_koditsu(assessment, user)
    @assessment = assessment
    @user = user
    submission_service = Course::Assessment::Submission::KoditsuSubmissionService.new(@assessment)
    status, response = submission_service.run_fetch_all_submissions

    return [status, nil] if status != 200 && status != 207

    @all_submissions = response
    @questions = @assessment.questions.includes({ actable: :test_cases })

    @test_cases_order = @questions.to_h do |question|
      test_cases = question.actable.test_cases
      [question.id, sort_for_koditsu(test_cases)]
    end

    @all_submissions.each do |submission|
      next if submission['status'] == 'notStarted' || submission['status'] == 'error'

      process_submission(submission)
    end
  end

  private

  def order_test_cases_type
    {
      'public' => 0,
      'private' => 1,
      'evaluation' => 2
    }
  end

  def submission_status_hash
    {
      'inProgress' => 'attempting',
      'submitted' => 'submitted'
    }
  end

  def sort_for_koditsu(test_cases)
    return [] if test_cases.empty?

    mapped_test_cases = test_cases.map do |tc|
      [tc.id, tc.identifier.split('/').last]
    end

    sorted_test_cases = mapped_test_cases.sort_by do |_, identifier|
      parts = identifier.split('_')

      [order_test_cases_type[parts[1]], parts[2].to_i]
    end

    sorted_test_cases.map { |id, _| id }.each_with_index.to_h { |id, index| [index + 1, id] }
  end

  # TODO: optimise this function to remove N+1 occasion
  def process_submission(submission)
    state = submission_status_hash[submission['status']]
    submitted_at = calculate_submission_time(state, submission['questions'])
    creator = find_creator(submission['user'])
    course_user = find_course_user(creator)

    cm_submission = find_or_create_submission(creator, course_user)

    cm_submission.class.transaction do
      update_submission(cm_submission, state, submitted_at)
      process_submission_answers(submission, cm_submission)
    end
  end

  def process_submission_answers(submission, cm_submission)
    answers = Course::Assessment::Answer.
              includes(:question).
              where(submission_id: cm_submission.id)

    @answer_hash = build_answer_hash(answers)

    submission['questions'].each do |submission_answer|
      next if ['notStarted', 'error'].include?(submission_answer['status'])

      process_answer(submission_answer)
    end
  end

  def process_answer(submission_answer)
    question, answer = @answer_hash[submission_answer['questionId']]
    update_files(submission_answer['files'], answer)
    process_test_case_results(submission_answer, question, answer)
  end

  def calculate_submission_time(state, questions)
    return nil unless state == 'submitted'

    questions.map do |question|
      DateTime.parse(question['filesSavedAt']).in_time_zone
    end.max&.iso8601
  end

  def find_creator(user_info)
    User.joins(:emails).
      where(users: { name: user_info['name'] },
            user_emails: { email: user_info['email'] }).
      first
  end

  def find_course_user(creator)
    CourseUser.find_by(course_id: current_course.id, user_id: creator.id)
  end

  def find_or_create_submission(creator, course_user)
    cm_submission = Course::Assessment::Submission.find_by(assessment: @assessment, creator: creator)
    return cm_submission if cm_submission

    User.with_stamper(creator) do
      new_submission = @assessment.submissions.new(creator: creator, course_user: course_user)
      success = @assessment.create_new_submission(new_submission, course_user)

      raise ActiveRecord::Rollback unless success

      new_submission.create_new_answers
      new_submission
    end
  end

  def update_submission(cm_submission, state, submitted_at)
    update_submission_object = { workflow_state: state, submitted_at: submitted_at }

    User.with_stamper(@user) do
      raise ActiveRecord::Rollback unless cm_submission.update!(update_submission_object)
    end
  end

  def build_answer_hash(answers)
    answers.to_h do |answer|
      question = answer.question
      koditsu_question_id = question.koditsu_question_id
      [koditsu_question_id, [question, answer]]
    end
  end

  def update_files(files, answer)
    files&.each do |file|
      programming_file = Course::Assessment::Answer::ProgrammingFile.
                         find_by(answer_id: answer.actable_id, filename: file['path'])

      raise ActiveRecord::Rollback unless programming_file.update!(content: file['content'])
    end
  end

  def process_test_case_results(submission_answer, question, answer)
    test_case_results = submission_answer['exprTestCaseResults']
    return if test_case_results&.empty?

    autograding = recreate_autograding(answer)
    auto_grading_id = autograding.id

    is_answer_correct = test_case_results.all? { |tc| tc['result']['success'] }
    update_answer_status(submission_answer, answer, is_answer_correct)
    save_test_case_results(test_case_results, question, auto_grading_id)
  end

  def recreate_autograding(answer)
    autograding_object = Course::Assessment::Answer::ProgrammingAutoGrading.find_by(answer: answer)
    raise ActiveRecord::Rollback if autograding_object && !autograding_object&.destroy!

    autograding = Course::Assessment::Answer::ProgrammingAutoGrading.new(answer: answer)
    raise ActiveRecord::Rollback unless autograding.save!

    autograding
  end

  def update_answer_status(submission_answer, answer, is_answer_correct)
    raise ActiveRecord::Rollback unless submission_answer['status'] != 'submitted' || answer.update!(
      workflow_state: 'submitted',
      correct: is_answer_correct,
      submitted_at: DateTime.parse(submission_answer['filesSavedAt']).in_time_zone&.iso8601 || Time.now.utc
    )
  end

  def save_test_case_results(test_case_results, question, auto_grading_id)
    index_id_hash = @test_cases_order[question.id]
    test_case_results.each do |tc_result|
      result = Course::Assessment::Answer::ProgrammingAutoGradingTestResult.new(
        auto_grading_id: auto_grading_id,
        test_case_id: index_id_hash[tc_result['testcase']['index']],
        passed: tc_result['result']['success'],
        messages: { output: tc_result['result']['display'] }
      )
      raise ActiveRecord::Rollback unless result.save!
    end
  end
end
# rubocop:enable Metrics/ModuleLength
