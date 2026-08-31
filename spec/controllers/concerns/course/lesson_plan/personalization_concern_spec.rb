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

      it 'does not create any personal times when performed on user' do
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        expect(course_user.personal_times.count).to eq(0)
      end

      it 'does not create any learning rate records' do
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        expect(course_user.learning_rate_records.count).to eq(0)
      end

      it 'does not create any personal times for user when performed on item' do
        dummy_controller.send(:update_personalized_timeline_for_item, assessment.lesson_plan_item)
        expect(course_user.personal_times.count).to eq(0)
      end
    end

    context 'when course user is on the fomo algorithm' do
      let!(:course_user) { create(:course_user, course: course, timeline_algorithm: 'fomo') }
      let!(:submission1) do
        create(:course_assessment_submission, assessment: assessment, creator: course_user.user).tap(&:finalise!)
      end

      it 'creates personal times for unsubmitted assessments when performed on user' do
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        expect(course_user.personal_times.count).to eq(course.assessments.count - 1)
      end

      it 'creates a single personal time for user when performed on unsubmitted item' do
        dummy_controller.send(:update_personalized_timeline_for_item, yet_to_open_assessment.lesson_plan_item)
        expect(course_user.personal_times.count).to eq(1)
      end

      it 'creates no personal times for user when performed on submitted item' do
        dummy_controller.send(:update_personalized_timeline_for_item, assessment.lesson_plan_item)
        expect(course_user.personal_times.count).to eq(0)
      end

      it 'creates a learning rate record' do
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        expect(course_user.learning_rate_records.count).to eq(1)
      end
    end

    context 'when course user is on the stragglers algorithm' do
      let!(:course_user) { create(:course_user, course: course, timeline_algorithm: 'stragglers') }

      def submit_assessment(assessment)
        create(:course_assessment_submission, assessment: assessment, creator: course_user.user).
          tap(&:finalise!)
      end

      it 'creates personal times for unsubmitted assessments when performed on user' do
        submit_assessment(assessment)
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        expect(course_user.personal_times.count).to eq(course.assessments.count - 1)
      end

      it 'creates a single personal time for user when performed on unsubmitted item' do
        submit_assessment(assessment)
        dummy_controller.send(:update_personalized_timeline_for_item, yet_to_open_assessment.lesson_plan_item)
        expect(course_user.personal_times.count).to eq(1)
      end

      it 'creates no personal times for user when performed on submitted item' do
        submit_assessment(assessment)
        dummy_controller.send(:update_personalized_timeline_for_item, assessment.lesson_plan_item)
        expect(course_user.personal_times.count).to eq(0)
      end

      it 'creates a learning rate record' do
        submit_assessment(assessment)
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        expect(course_user.learning_rate_records.count).to eq(1)
      end

      it 'shifts the end_at of non-open items forward' do
        submit_assessment(overdue_assessment)
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        original_end_at = yet_to_open_assessment.lesson_plan_item.personal_time_for(course_user).end_at

        submit_assessment(assessment)
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        new_end_at = yet_to_open_assessment.lesson_plan_item.personal_time_for(course_user).end_at
        expect(new_end_at).to be < original_end_at
      end

      it 'does not shift the end_at of already open items forward' do
        submit_assessment(overdue_assessment)
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        original_end_at = already_open_assessment.lesson_plan_item.personal_time_for(course_user).end_at

        submit_assessment(assessment)
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        new_end_at = already_open_assessment.lesson_plan_item.personal_time_for(course_user).end_at

        expect(new_end_at).to eq(original_end_at)
      end

      it 'rounds off to 2359' do
        submit_assessment(overdue_assessment)
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
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

      it 'creates personal times for unsubmitted assessments when performed on user' do
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        expect(course_user.personal_times.count).to eq(course.assessments.count - 1)
      end

      it 'creates a single personal time for user when performed on unsubmitted item' do
        dummy_controller.send(:update_personalized_timeline_for_item, yet_to_open_assessment.lesson_plan_item)
        expect(course_user.personal_times.count).to eq(1)
      end

      it 'creates no personal times for user when performed on submitted item' do
        dummy_controller.send(:update_personalized_timeline_for_item, assessment.lesson_plan_item)
        expect(course_user.personal_times.count).to eq(0)
      end

      it 'creates a learning rate record' do
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        expect(course_user.learning_rate_records.count).to eq(1)
      end
    end

    context 'when there are lesson plan items without end times' do
      let!(:no_end_time_assessment) do
        create(:course_assessment_assessment, course: course, start_at: 1.days.ago, published: true)
      end

      it 'still works for fixed algorithm' do
        course_user = create(:course_user, course: course, timeline_algorithm: 'fixed')
        create(:course_assessment_submission, assessment: assessment, creator: course_user.user).tap(&:finalise!)
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        expect(course_user.personal_times.count).to eq(0)
      end

      it 'still works for fomo timeline' do
        course_user = create(:course_user, course: course, timeline_algorithm: 'fomo')
        create(:course_assessment_submission, assessment: assessment, creator: course_user.user).tap(&:finalise!)
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        expect(course_user.personal_times.count).to eq(course.assessments.count - 1)
      end

      it 'still works for stragglers timeline' do
        course_user = create(:course_user, course: course, timeline_algorithm: 'stragglers')
        create(:course_assessment_submission, assessment: assessment, creator: course_user.user).tap(&:finalise!)
        dummy_controller.send(:update_personalized_timeline_for_user, course_user)
        expect(course_user.personal_times.count).to eq(course.assessments.count - 1)
      end

      # No test for OTOT since as of right now, OTOT is composed of stragglers and fomo
    end

    context 'when the course has many course users' do
      let!(:course_users) do
        create_list(:course_user, 3, course: course, timeline_algorithm: 'fomo').each do |course_user|
          create(:course_assessment_submission, assessment: assessment, creator: course_user.user).tap(&:finalise!)
        end
      end

      it 'shifts the item for every course user' do
        dummy_controller.send(:update_personalized_timeline_for_item, yet_to_open_assessment.lesson_plan_item)

        course_users.each do |course_user|
          expect(course_user.personal_times.count).to eq(1)
        end
      end

      # The users are streamed with find_each rather than preloaded, so nothing here may fall back
      # to querying each user's course individually. Loading them through the association keeps
      # `course` set on each record via inverse_of; querying CourseUser directly would not, and the
      # N+1 would be invisible without this assertion since the strategies read course.time_zone.
      it 'does not query the course once per user' do
        queries = 0
        subscriber = ActiveSupport::Notifications.subscribe('sql.active_record') do |*, payload|
          queries += 1 if payload[:sql].match?(/FROM "courses"/)
        end
        begin
          dummy_controller.send(:update_personalized_timeline_for_item, yet_to_open_assessment.lesson_plan_item)
        ensure
          ActiveSupport::Notifications.unsubscribe(subscriber)
        end

        expect(queries).to eq(1) # the single Course.find, and nothing per user
      end
    end
  end
end
