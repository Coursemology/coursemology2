# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::PersonalizedTimelineUpdateJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:submitted_assessment) do
      create(:assessment, course: course, start_at: 2.days.ago, end_at: 3.days.from_now, published: true)
    end
    let!(:upcoming_assessment) do
      create(:assessment, course: course, start_at: 5.days.from_now, end_at: 10.days.from_now, published: true)
    end
    let(:timeline_algorithm) { 'fomo' }
    let(:course_user) { create(:course_user, course: course, timeline_algorithm: timeline_algorithm) }
    let(:submission) do
      create(:course_assessment_submission, assessment: submitted_assessment, creator: course_user.user)
    end
    subject { Course::LessonPlan::PersonalizedTimelineUpdateJob }

    it 'can be queued' do
      expect { subject.perform_later(course_user) }.to have_enqueued_job(subject).exactly(:once)
    end

    it 'is enqueued when a submission is finalised' do
      expect { submission.finalise! }.to have_enqueued_job(subject).exactly(:once)
    end

    context 'when the course user is on a personalized timeline' do
      it 'shifts the timeline for the course user', :sidekiq_same_thread do
        submission.finalise!
        submission.save!
        expect(course_user.personal_times).to be_empty

        perform_sidekiq_jobs { subject.perform_later(course_user) }

        # The submitted item is never shifted, so only the upcoming one gets a personal time.
        expect(course_user.personal_times.count).to eq(1)
        expect(course_user.personal_times.first.lesson_plan_item_id).
          to eq(upcoming_assessment.lesson_plan_item.id)
      end

      it 'is safe to run more than once', :sidekiq_same_thread do
        submission.finalise!
        submission.save!

        perform_sidekiq_jobs { subject.perform_later(course_user) }
        first_run = course_user.personal_times.pluck(:lesson_plan_item_id, :start_at, :end_at)

        perform_sidekiq_jobs { subject.perform_later(course_user) }

        # Idempotent, and — importantly for the offload — it never accumulates rows: the timeline is
        # recomputed from current state rather than appended to.
        expect(course_user.personal_times.reload.pluck(:lesson_plan_item_id, :start_at, :end_at)).
          to match_array(first_run)
      end
    end

    context 'when the course user is on the fixed timeline' do
      let(:timeline_algorithm) { 'fixed' }

      it 'creates no personal times', :sidekiq_same_thread do
        submission.finalise!
        submission.save!

        perform_sidekiq_jobs { subject.perform_later(course_user) }

        expect(course_user.personal_times).to be_empty
      end
    end
  end
end
