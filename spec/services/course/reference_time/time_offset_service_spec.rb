# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ReferenceTime::TimeOffsetService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:start_at) { 5.days.ago }
    let(:bonus_end_at) { 3.days.ago }
    let(:end_at) { 1.day.ago }
    let!(:assessment) do
      create(:assessment, course: course, start_at: start_at, bonus_end_at: bonus_end_at, end_at: end_at)
    end
    let!(:video) { create(:video, course: course, start_at: start_at, bonus_end_at: bonus_end_at, end_at: end_at) }
    let!(:survey) { create(:survey, course: course, start_at: start_at, bonus_end_at: bonus_end_at, end_at: end_at) }

    describe '#shift_all_times' do
      subject do
        Course::ReferenceTime::TimeOffsetService.shift_all_times(course.reference_times, 1, 1, 1)
      end

      it 'shifts all the start_at, end_at and bonus_end_at for all items' do
        offset_time = 1.days + 1.hours + 1.minutes

        subject

        expect(assessment.reload.start_at).to be_within(1.second).of start_at + offset_time
        expect(video.reload.start_at).to be_within(1.second).of start_at + offset_time
        expect(survey.reload.start_at).to be_within(1.second).of start_at + offset_time

        expect(assessment.reload.bonus_end_at).to be_within(1.second).of bonus_end_at + offset_time
        expect(video.reload.bonus_end_at).to be_within(1.second).of bonus_end_at + offset_time
        expect(survey.reload.bonus_end_at).to be_within(1.second).of bonus_end_at + offset_time

        expect(assessment.reload.end_at).to be_within(1.second).of end_at + offset_time
        expect(video.reload.end_at).to be_within(1.second).of end_at + offset_time
        expect(survey.reload.end_at).to be_within(1.second).of end_at + offset_time
      end
    end
  end
end
