# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment, type: :model do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student) { create(:course_student, course: course) }

    describe '#submission_deadline_for' do
      subject { assessment.submission_deadline_for(student) }

      context 'when late submissions are allowed' do
        let(:assessment) { create(:assessment, course: course, end_at: 1.hour.ago) }

        it 'returns nil regardless of the deadline' do
          is_expected.to be_nil
        end
      end

      context 'when late submissions are disallowed' do
        let(:end_at) { 3.days.from_now }
        let(:assessment) do
          create(:assessment, course: course, end_at: end_at, is_late_submission_allowed: false)
        end

        it 'returns the deadline for the course user' do
          is_expected.to be_within(1.second).of(end_at)
        end

        context 'when the assessment has no deadline' do
          let(:end_at) { nil }

          it { is_expected.to be_nil }
        end

        context 'when the course user has a personal time' do
          let(:personal_end_at) { 5.days.from_now }

          before do
            personal_time = assessment.lesson_plan_item.find_or_create_personal_time_for(student)
            personal_time.update!(end_at: personal_end_at)
          end

          it 'returns the personalised deadline' do
            is_expected.to be_within(1.second).of(personal_end_at)
          end
        end
      end
    end

    describe '#submission_deadline_passed_for? (strict, for creation)' do
      subject { assessment.submission_deadline_passed_for?(student) }

      context 'when late submissions are disallowed and the deadline has passed' do
        let(:assessment) do
          create(:assessment, course: course, end_at: 1.hour.ago, is_late_submission_allowed: false)
        end

        it { is_expected.to be true }
      end

      context 'when late submissions are disallowed and the deadline is in the future' do
        let(:assessment) do
          create(:assessment, course: course, end_at: 1.hour.from_now, is_late_submission_allowed: false)
        end

        it { is_expected.to be false }
      end

      context 'when the deadline passed but only just (within the force-submit grace period)' do
        let(:assessment) do
          create(:assessment, course: course, end_at: 1.minute.ago, is_late_submission_allowed: false)
        end

        it 'is strictly passed — creation gets no grace' do
          is_expected.to be true
        end
      end

      context 'when late submissions are allowed' do
        let(:assessment) do
          create(:assessment, course: course, end_at: 1.hour.ago, is_late_submission_allowed: true)
        end

        it { is_expected.to be false }
      end
    end
  end
end
