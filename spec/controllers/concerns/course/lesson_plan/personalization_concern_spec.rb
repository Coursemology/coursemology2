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
    let!(:assessment1) do
      create(:course_assessment_assessment, course: course, end_at: 3.days.from_now, published: true)
    end
    let!(:assessment2) do
      create(:course_assessment_assessment, course: course, end_at: 3.days.from_now, published: true)
    end
    let!(:assessment3) do
      create(:course_assessment_assessment, course: course, end_at: 3.days.from_now, published: true)
    end

    context 'when course user is on the fixed algorithm' do
      let!(:course_user) { create(:course_user, course: course, timeline_algorithm: 'fixed') }
      let!(:submission1) do
        create(:course_assessment_submission, assessment: assessment1, creator: course_user.user).tap(&:finalise!)
      end

      it 'does not create any personal times' do
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        expect(course_user.personal_times.count).to eq(0)
      end
    end

    context 'when course user is on the fomo algorithm' do
      let!(:course_user) { create(:course_user, course: course, timeline_algorithm: 'fomo') }
      let!(:submission1) do
        create(:course_assessment_submission, assessment: assessment1, creator: course_user.user).tap(&:finalise!)
      end

      it 'creates personal times' do
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        expect(course_user.personal_times.count).to eq(course.assessments.count - 1)
      end
    end

    context 'when course user is on the stragglers algorithm' do
      let!(:course_user) { create(:course_user, course: course, timeline_algorithm: 'stragglers') }
      let!(:submission1) do
        create(:course_assessment_submission, assessment: assessment1, creator: course_user.user).tap(&:finalise!)
      end

      it 'creates personal times' do
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        expect(course_user.personal_times.count).to eq(course.assessments.count - 1)
      end
    end

    context 'when course user is on the otot algorithm' do
      let!(:course_user) { create(:course_user, course: course, timeline_algorithm: 'otot') }
      let!(:submission1) do
        create(:course_assessment_submission, assessment: assessment1, creator: course_user.user).tap(&:finalise!)
      end

      it 'creates personal times' do
        dummy_controller.send(:update_personalized_timeline_for, course_user)
        expect(course_user.personal_times.count).to eq(course.assessments.count - 1)
      end
    end
  end
end
