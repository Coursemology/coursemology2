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
          subject.opening_reminder(user, assessment, assessment.opening_reminder_token)
        end
      end

      context 'when assessment is a draft' do
        it 'does not notify the users' do
          expect_any_instance_of(Course::AssessmentNotifier).to_not receive(:assessment_opening)
          subject.opening_reminder(user, assessment, assessment.opening_reminder_token)
        end

        context "when assessment's start_date was changed" do
          it 'does not notify the users' do
            assessment.start_at = now + 1.day

            expect_any_instance_of(Course::AssessmentNotifier).to_not receive(:assessment_opening)
            subject.opening_reminder(user, assessment, assessment.opening_reminder_token)
          end
        end
      end
    end

    describe '#closing_reminder' do
      let(:assessment) do
        create(:assessment, :published, :with_text_response_question, course: course)
      end

      subject do
        Course::Assessment::ReminderService.
          closing_reminder(assessment, assessment.closing_reminder_token)
      end

      context 'when "assessment closing" emails are disabled' do
        before do
          context = OpenStruct.new(key: Course::AssessmentsComponent.key, current_course: course)
          setting = {
            'key' => 'assessment_closing', 'enabled' => false,
            'options' => { 'category_id' => assessment.tab.category.id }
          }
          Course::Settings::AssessmentsComponent.new(context).update_email_setting(setting)
          course.save!
        end

        it 'does not send email notifications' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end
    end
  end
end
