# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::CoursewidePersonalizedTimelineUpdateJob do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:timeline_algorithm) { 'fomo' }
    let!(:assessment) do
      create(:assessment, course: course, start_at: 1.day.from_now, end_at: 10.days.from_now, published: true)
    end
    let(:course_user) { create(:course_user, course: course, timeline_algorithm: timeline_algorithm) }
    let(:submitted_assessment) { create(:assessment, course: course, end_at: 3.days.from_now, published: true) }
    let(:submission) do
      create(:course_assessment_submission, assessment: submitted_assessment,
                                            creator: course_user.user).tap(&:finalise!)
    end
    subject { Course::LessonPlan::CoursewidePersonalizedTimelineUpdateJob }

    it 'can be queued' do
      expect { subject.perform_later(assessment.lesson_plan_item) }.
        to have_enqueued_job(subject).exactly(:once)
    end

    context 'when end_at of the assessment is changed' do
      it 'creates a timeline update job' do
        assessment.end_at = 2.days.from_now

        expect { assessment.save }.to have_enqueued_job(subject)
      end

      def shifted_personal_time
        item = assessment.lesson_plan_item
        personal_time = item.find_or_create_personal_time_for(course_user)
        personal_time.end_at = 5.days.from_now
        personal_time.save!
        personal_time
      end

      it 'updates the end_at of personal times' do
        submission
        personal_time = shifted_personal_time
        # 1 minute is for the lag between the assignment to this comparison
        expect(personal_time.end_at).to be_within(1.minute).of 5.days.from_now

        update_job = subject.perform_later(assessment.lesson_plan_item)
        update_job.perform_now
        expect(personal_time.reload.end_at).to be_within(1.second).of assessment.end_at
      end
    end

    context 'when start_at of the assessment is changed' do
      it 'creates a timeline update job' do
        assessment.start_at = 2.days.from_now

        expect { assessment.save }.to have_enqueued_job(subject)
      end

      let(:timeline_algorithm) { 'stragglers' }

      def shifted_personal_time
        item = assessment.lesson_plan_item
        personal_time = item.find_or_create_personal_time_for(course_user)
        personal_time.start_at = 3.days.from_now
        personal_time.save!
        personal_time
      end

      it 'updates the start_at of personal times' do
        submission
        personal_time = shifted_personal_time
        # 1 minute is for the lag between the assignment to this comparison
        expect(personal_time.start_at).to be_within(1.minute).of 3.days.from_now

        update_job = subject.perform_later(assessment.lesson_plan_item)
        update_job.perform_now
        expect(personal_time.reload.start_at).to be_within(1.second).of assessment.start_at
      end
    end
  end
end
