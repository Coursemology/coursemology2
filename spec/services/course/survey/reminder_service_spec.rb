# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::ReminderService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:survey) do
      create(:survey, course: course, published: true, end_at: Time.zone.now + 1.day,
                      creator: course.creator, updater: course.creator)
    end
    let!(:unresponded_student) { create(:course_student, course: course) }
    let!(:responded_student) { create(:course_student, course: course) }
    let!(:response) do
      create(:response, survey: survey, course_user: responded_student,
                        submitted_at: Time.zone.now,
                        creator: responded_student.user, updater: responded_student.user)
    end
    let(:course_creator_email) { course.creator.email }
    let(:unresponded_student_email) { unresponded_student.user.email }
    let(:responded_student_email) { responded_student.user.email }

    describe '#closing_reminder' do
      subject do
        Course::Survey::ReminderService.closing_reminder(survey, survey.closing_reminder_token)
      end

      it 'notifies students who have not completed the survey and sends a summary to staff' do
        subject
        emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
        expect(emails).not_to include(responded_student_email)

        find_email_body = lambda do |email|
          ActionMailer::Base.deliveries.find { |mail| mail.to.last == email }.body.parts.first.body
        end
        student_email_body = find_email_body.call(unresponded_student_email)
        staff_email_body = find_email_body.call(course_creator_email)

        expect(student_email_body).to include('course.mailer.survey_closing_reminder_email.message')
        expect(staff_email_body).to include('course.mailer.survey_closing_summary_email.message')
      end

      context 'when "survey closing" emails are disabled' do
        before do
          context = OpenStruct.new(key: Course::SurveyComponent.key, current_course: course)
          Course::Settings::SurveyComponent.new(context).
            update_email_setting('key' => 'survey_closing', 'enabled' => false)
          course.save!
        end

        it 'does not send email notifications' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end
    end
  end
end
