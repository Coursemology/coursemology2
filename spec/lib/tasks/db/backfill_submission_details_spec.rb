# frozen_string_literal: true
require 'rails_helper'
require 'rake'

RSpec.describe 'db:backfill_submission_details', type: :task do
  before(:all) do
    Rails.application.load_tasks unless Rake::Task.task_defined?('db:backfill_submission_details')
  end

  def run_task
    task = Rake::Task['db:backfill_submission_details']
    task.reenable
    task.invoke
  end

  def detail_count(attempt_id)
    ActiveRecord::Base.connection.select_value(
      "SELECT COUNT(*) FROM course_assessment_submission_details WHERE attempt_id = #{attempt_id}"
    ).to_i
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, course: course) }
    let(:student) { create(:course_student, course: course) }

    # A "base row with no extension" — a real submission whose detail row was dropped — stands in for
    # a row a still-old worker inserted during the rolling-deploy window. `Attempt#preview?` reads it
    # as a preview until the detail row is reconciled.
    it 'creates a detail row for a base attempt that is missing one' do
      submission = create(:course_assessment_submission, assessment: assessment, creator: student.user)
      attempt_id = submission.attempt_id
      Course::Assessment::Submission.where(attempt_id: attempt_id).delete_all
      expect(detail_count(attempt_id)).to eq(0)

      run_task

      expect(detail_count(attempt_id)).to eq(1)
    end

    it 'is idempotent — leaves an already-present detail row untouched' do
      submission = create(:course_assessment_submission, assessment: assessment, creator: student.user)

      run_task

      expect(detail_count(submission.attempt_id)).to eq(1)
    end
  end
end
