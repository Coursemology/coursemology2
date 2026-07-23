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

    @submission_hash = @assessment.submissions.to_h do |s|
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
    # `creator_id` is not a column on Submission's own (small) table — it lives on
    # `course_assessment_attempts` (Step 2c). Unqualified, `pluck` can't tell which joined table's
    # `creator_id` to read (Submission's own `acts_as :experience_points_record` default scope also
    # joins `course_experience_points_records`, which ALSO has a `creator_id` column), so Postgres
    # rejects it as ambiguous — same fix as `submissions_controller.rb#user_ids_without_submission`.
    existing_submission_user_ids = @assessment.submissions.pluck('course_assessment_attempts.creator_id')
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
      new_submission = @assessment.build_submission(creator: creator, course_user: course_user)
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
    # `cm_submission.id` is now the small Submission table's OWN id, not the Attempt id the
    # `attempt_id` FK needs — `course_assessment_submissions.id` is an independent serial column
    # (see the Task 1 backfill migration), not guaranteed equal to `attempt_id`. This was silently
    # correct pre-split, when `cm_submission` was a `Submission` instance mapped directly onto
    # `course_assessment_attempts` (so `.id` and `attempt_id` were the same value); the split
    # exposed it. `attempt_id` is a real, undelegated column already on Submission's own table.
    answers = Course::Assessment::Answer.includes(:question).where(attempt_id: cm_submission.attempt_id)

    build_answer_hash(answers)

    raise ActiveRecord::Rollback unless destroy_all_existing_autogradings(answers)
    raise ActiveRecord::Rollback unless destroy_all_existing_files(answers)

    submission_answers = submission['questions'].reject do |submission_answer|
      ['notStarted', 'error'].include?(submission_answer['status'])
    end

    process_all_answers(submission_answers)
  end
end
