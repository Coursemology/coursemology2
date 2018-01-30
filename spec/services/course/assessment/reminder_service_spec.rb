# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::ReminderService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

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
