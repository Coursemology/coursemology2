# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::PersonalizationConcern do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    class self::DummyController < ApplicationController
      include Course::LessonPlan::PersonalizationConcern
    end

    let(:dummy_controller) { self.class::DummyController.new }

    let!(:course) { create(:course) }
    let!(:assessment) do
      create(:course_assessment_assessment, course: course, end_at: 3.days.from_now, published: true)
    end
    let!(:overdue_assessment) do
      create(:course_assessment_assessment, course: course, start_at: 20.days.ago, end_at: 10.days.ago, published: true)
    end
    let!(:yet_to_open_assessment) do
      create(:course_assessment_assessment, course: course, start_at: 1.days.from_now, end_at: 10.days.from_now,
                                            published: true)
    end
    let!(:already_open_assessment) do
      create(:course_assessment_assessment, course: course, start_at: 1.days.ago, end_at: 10.days.from_now,
                                            published: true)
    end

    context 'when course user is on the fixed algorithm' do
      let!(:course_user) { create(:course_user, course: course, timeline_algorithm: 'fixed') }
      let!(:submission1) do
        create(:course_assessment_submission, assessment: assessment, creator: course_user.user).tap(&:finalise!)
      end

      it 'does not create any personal times' do
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        expect(course_user.personal_times.count).to eq(0)
      end
    end

    context 'when course user is on the fomo algorithm' do
      let!(:course_user) { create(:course_user, course: course, timeline_algorithm: 'fomo') }
      let!(:submission1) do
        create(:course_assessment_submission, assessment: assessment, creator: course_user.user).tap(&:finalise!)
      end

      it 'creates personal times' do
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        expect(course_user.personal_times.count).to eq(course.assessments.count - 1)
      end
    end

    context 'when course user is on the stragglers algorithm' do
      let!(:course_user) { create(:course_user, course: course, timeline_algorithm: 'stragglers') }

      def submit_assessment(assessment)
        create(:course_assessment_submission, assessment: assessment, creator: course_user.user).
          tap(&:finalise!)
      end

      it 'creates personal times' do
        submit_assessment(assessment)
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        expect(course_user.personal_times.count).to eq(course.assessments.count - 1)
      end

      it 'shifts the end_at of non-open items forward' do
        submit_assessment(overdue_assessment)
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        original_end_at = yet_to_open_assessment.lesson_plan_item.personal_time_for(course_user).end_at

        submit_assessment(assessment)
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        new_end_at = yet_to_open_assessment.lesson_plan_item.personal_time_for(course_user).end_at
        expect(new_end_at).to be < original_end_at
      end

      it 'does not shift the end_at of already open items forward' do
        submit_assessment(overdue_assessment)
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        original_end_at = already_open_assessment.lesson_plan_item.personal_time_for(course_user).end_at

        submit_assessment(assessment)
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        new_end_at = already_open_assessment.lesson_plan_item.personal_time_for(course_user).end_at

        expect(new_end_at).to eq(original_end_at)
      end

      it 'rounds off to 2359' do
        submit_assessment(overdue_assessment)
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        end_at = assessment.lesson_plan_item.personal_time_for(course_user).end_at
        course_tz = course.time_zone
        expect(end_at.in_time_zone(course_tz).strftime('%H:%M')).to eq('23:59')
      end
    end

    context 'when course user is on the otot algorithm' do
      let!(:course_user) { create(:course_user, course: course, timeline_algorithm: 'otot') }
      let!(:submission1) do
        create(:course_assessment_submission, assessment: assessment, creator: course_user.user).tap(&:finalise!)
      end

      it 'creates personal times' do
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        expect(course_user.personal_times.count).to eq(course.assessments.count - 1)
      end
    end

    context 'when there are lesson plan items without end times' do
      let!(:no_end_time_assessment) do
        create(:course_assessment_assessment, course: course, start_at: 1.days.ago, published: true)
      end

      it 'still works for fixed algorithm' do
        course_user = create(:course_user, course: course, timeline_algorithm: 'fixed')
        create(:course_assessment_submission, assessment: assessment, creator: course_user.user).tap(&:finalise!)
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        expect(course_user.personal_times.count).to eq(0)
      end

      it 'still works for fomo timeline' do
        course_user = create(:course_user, course: course, timeline_algorithm: 'fomo')
        create(:course_assessment_submission, assessment: assessment, creator: course_user.user).tap(&:finalise!)
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        expect(course_user.personal_times.count).to eq(course.assessments.count - 1)
      end

      it 'still works for stragglers timeline' do
        course_user = create(:course_user, course: course, timeline_algorithm: 'stragglers')
        create(:course_assessment_submission, assessment: assessment, creator: course_user.user).tap(&:finalise!)
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        expect(course_user.personal_times.count).to eq(course.assessments.count - 1)
      end

      # No test for OTOT since as of right now, OTOT is composed of stragglers and fomo
    end
  end
end
