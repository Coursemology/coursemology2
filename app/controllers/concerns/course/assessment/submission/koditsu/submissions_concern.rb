# frozen_string_literal: true
module Course::Assessment::Submission::Koditsu::SubmissionsConcern
  extend ActiveSupport::Concern
  include Course::Assessment::Question::KoditsuQuestionConcern
  include Course::Assessment::Submission::Koditsu::UsersConcern
  include Course::Assessment::Submission::Koditsu::AnswersConcern
  include Course::Assessment::Submission::Koditsu::TestCasesConcern
  include Course::Assessment::Submission::Koditsu::SubmissionTimesConcern

  def fetch_all_submissions_from_koditsu(assessment, user)
    @assessment = assessment
    @user = user
    submission_service = Course::Assessment::Submission::KoditsuSubmissionService.new(@assessment)
    status, response = submission_service.run_fetch_all_submissions

    return [status, nil] if status != 200 && status != 207

    process_fetch_submissions_response(response)
  end

  def process_fetch_submissions_response(response)
    @all_submissions = response
    @questions = @assessment.questions.includes({ actable: :test_cases })
    @test_cases_order = test_cases_order_for(@questions)
    @cu_submission_hash = course_user_submission_hash(@all_submissions)

    process_all_submissions
  end

  private

  def submission_status_hash
    {
      'inProgress' => 'attempting',
      'submitted' => 'submitted'
    }
  end

  def process_all_submissions
    create_new_submissions_if_not_existing

    @submission_hash = Course::Assessment::Submission.where(assessment: @assessment).to_h do |s|
      [s.creator_id, s]
    end

    @cu_submission_hash.each do |creator, submission|
      process_submission(submission, @submission_hash[creator.id])
    end
  end

  def process_submission(submission, cm_submission)
    state = submission_status_hash[submission['status']]
    submitted_at = calculate_submission_time(state, submission['questions'])

    cm_submission.class.transaction do
      update_submission(cm_submission, state, submitted_at)
      process_submission_answers(submission, cm_submission)
    end
  end

  def create_new_submissions_if_not_existing
    existing_submission_user_ids = Course::Assessment::Submission.where(assessment: @assessment).
                                   pluck(:creator_id)
    koditsu_submission_user_ids = @cu_submission_hash.keys.map { |creator, _| creator.id }
    user_ids_without_submission = koditsu_submission_user_ids - existing_submission_user_ids

    return if user_ids_without_submission.empty?

    user_info_hash = user_related_hash(user_ids_without_submission)

    user_ids_without_submission.each do |user_id|
      user, course_user = user_info_hash[user_id]

      create_new_submission_for(user, course_user)
    end
  end

  def create_new_submission_for(creator, course_user)
    User.with_stamper(creator) do
      new_submission = @assessment.submissions.new(creator: creator,
                                                   course_user: course_user)
      success = @assessment.create_new_submission(new_submission, course_user)

      raise ActiveRecord::Rollback unless success

      new_submission.create_new_answers
    end
  end

  def update_submission(cm_submission, state, submitted_at)
    update_submission_object = { workflow_state: state, submitted_at: submitted_at }

    User.with_stamper(@user) do
      raise ActiveRecord::Rollback unless cm_submission.update!(update_submission_object)
    end
  end

  def process_submission_answers(submission, cm_submission)
    answers = Course::Assessment::Answer.includes(:question).where(submission_id: cm_submission.id)

    build_answer_hash(answers)

    raise ActiveRecord::Rollback unless destroy_all_existing_autogradings(answers)
    raise ActiveRecord::Rollback unless destroy_all_existing_files(answers)

    submission_answers = submission['questions'].reject do |submission_answer|
      ['notStarted', 'error'].include?(submission_answer['status'])
    end

    process_all_answers(submission_answers)
  end
end
