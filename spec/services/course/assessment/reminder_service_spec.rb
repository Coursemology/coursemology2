# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::ReminderService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe '#opening_reminder' do
      let!(:now) { Time.zone.now }

      let(:user) { create(:course_user, course: course).user }
      let!(:assessment) { create(:assessment, start_at: now) }

      context 'when assessment is published' do
        it 'notify the users' do
          assessment.published = true

          expect_any_instance_of(Course::AssessmentNotifier).to receive(:assessment_opening).once
          subject.opening_reminder(user, assessment, assessment.start_at.to_f)
        end
      end

      context 'when assessment is a draft' do
        it 'does not notify the users' do
          expect_any_instance_of(Course::AssessmentNotifier).to_not receive(:assessment_opening)
          subject.opening_reminder(user, assessment, assessment.start_at.to_f)
        end
      end

      context "when assessment's start_date was changed" do
        it 'does not notify the users' do
          start_at = assessment.start_at.to_f
          assessment.start_at = now + 1.day

          expect_any_instance_of(Course::AssessmentNotifier).to_not receive(:assessment_opening)
          subject.opening_reminder(user, assessment, start_at)
        end
      end
    end

    describe '#closing_reminder' do
      let!(:now) { Time.zone.now }

      let(:user) { create(:course_user, course: course).user }
      let!(:assessment) { create(:assessment, end_at: now) }

      context 'when assessment is published' do
        it 'notify the users' do
          assessment.published = true

          expect_any_instance_of(Course::AssessmentNotifier).to receive(:assessment_closing).once
          subject.closing_reminder(user, assessment, assessment.end_at.to_f)
        end
      end

      context 'when assessment is a draft' do
        it 'does not notify the users' do
          expect_any_instance_of(Course::AssessmentNotifier).to_not receive(:assessment_closing)
          subject.closing_reminder(user, assessment, assessment.end_at.to_f)
        end
      end

      context "when assessment's end_date was changed" do
        it 'does not notify the users' do
          end_at = assessment.end_at.to_f
          assessment.end_at = now + 1.day

          expect_any_instance_of(Course::AssessmentNotifier).to_not receive(:assessment_closing)
          subject.closing_reminder(user, assessment, end_at)
        end
      end
    end
  end
end
