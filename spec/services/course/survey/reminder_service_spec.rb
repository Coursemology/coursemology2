# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::ReminderService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:course_creator) { course.course_users.first }
    let(:survey) do
      create(:survey, course: course, published: true, end_at: Time.zone.now + 1.day,
                      creator: course.creator, updater: course.creator)
    end
    let!(:unresponded_student) { create(:course_student, course: course) }
    let!(:unresponded_student_phantom) { create(:course_student, :phantom, course: course) }
    let!(:responded_student) { create(:course_student, course: course) }
    let!(:response) do
      create(:response, survey: survey, course_user: responded_student,
                        submitted_at: Time.zone.now,
                        creator: responded_student.user, updater: responded_student.user)
    end
    let(:course_creator_email) { course.creator.email }
    let(:unresponded_student_email) { unresponded_student.user.email }
    let(:unresponded_student_phantom_email) { unresponded_student_phantom.user.email }
    let(:responded_student_email) { responded_student.user.email }

    describe '#closing_reminder' do
      subject do
        Course::Survey::ReminderService.closing_reminder(survey, survey.closing_reminder_token)
      end

      def set_survey_email_setting(setting, regular, phantom)
        email_setting = course.
                        setting_emails.
                        where(component: :surveys,
                              course_assessment_category_id: nil,
                              setting: setting).first
        email_setting.update!(regular: regular, phantom: phantom)
      end

      it 'notifies students who have not completed the survey and sends a summary to staff' do
        subject
        emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
        expect(emails).to include(course_creator_email)
        expect(emails).to include(unresponded_student_email)
        expect(emails).to include(unresponded_student_phantom_email)

        expect(emails).not_to include(responded_student_email)

        find_email_body = lambda do |email|
          ActionMailer::Base.deliveries.find { |mail| mail.to.last == email }.body.parts.first.body
        end
        student_email_body = find_email_body.call(unresponded_student_email)
        staff_email_body = find_email_body.call(course_creator_email)

        expect(student_email_body).to include('course.mailer.survey_closing_reminder_email.message')
        expect(staff_email_body).to include('course.mailer.survey_closing_summary_email.message')
      end

      context 'when a user unsubscribes from the closing reminder' do
        before do
          setting_email = course.
                          setting_emails.
                          where(component: :surveys,
                                course_assessment_category_id: nil,
                                setting: :closing_reminder).first
          unresponded_student.email_unsubscriptions.create!(course_setting_email: setting_email)
        end

        it 'does not send an email notification to the user' do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          expect(emails).to include(course_creator_email)
          expect(emails).to include(unresponded_student_phantom_email)

          expect(emails).not_to include(unresponded_student_email)
          expect(emails).not_to include(responded_student_email)
        end
      end

      context 'when a user unsubscribes from the closing reminder summary' do
        before do
          setting_email = course.
                          setting_emails.
                          where(component: :surveys,
                                course_assessment_category_id: nil,
                                setting: :closing_reminder_summary).first
          course_creator.email_unsubscriptions.create!(course_setting_email: setting_email)
        end

        it 'does not send an email notification to the user' do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          expect(emails).to include(unresponded_student_email)
          expect(emails).to include(unresponded_student_phantom_email)

          expect(emails).not_to include(course_creator_email)
          expect(emails).not_to include(responded_student_email)
        end
      end

      context 'when "survey closing" emails are disabled for phantom user' do
        before { set_survey_email_setting(:closing_reminder, true, false) }

        it 'sends email notifications to regular users and summary emails to staff' do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          expect(emails).to include(course_creator_email)
          expect(emails).to include(unresponded_student_email)

          expect(emails).not_to include(responded_student_email)
          expect(emails).not_to include(unresponded_student_phantom_email)
        end
      end

      context 'when "survey closing" emails are disabled for regular user' do
        before { set_survey_email_setting(:closing_reminder, false, true) }

        it 'sends email notifications to phantom users and summary emails to staff' do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          expect(emails).to include(course_creator_email)
          expect(emails).to include(unresponded_student_phantom_email)

          expect(emails).not_to include(responded_student_email)
          expect(emails).not_to include(unresponded_student_email)
        end
      end

      context 'when "survey closing" emails are disabled' do
        before { set_survey_email_setting(:closing_reminder, false, false) }

        it 'does not send email notifications' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end

      context 'when "survey closing" and summary emails are disabled for phantom user' do
        before do
          set_survey_email_setting(:closing_reminder, true, false)
          set_survey_email_setting(:closing_reminder_summary, true, false)
        end

        it 'sends email notifications to regular users and summary emails to staff' do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          expect(emails).to include(course_creator_email)
          expect(emails).to include(unresponded_student_email)

          expect(emails).not_to include(responded_student_email)
          expect(emails).not_to include(unresponded_student_phantom_email)
        end
      end

      context 'when "survey closing" and summary emails are disabled for regular user' do
        before do
          course.course_users.first.update!(phantom: true)
          set_survey_email_setting(:closing_reminder, false, true)
          set_survey_email_setting(:closing_reminder_summary, false, true)
        end

        it 'sends email notifications to phantom users and summary emails to phantom staff' do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          expect(emails).to include(course_creator_email)
          expect(emails).to include(unresponded_student_phantom_email)

          expect(emails).not_to include(responded_student_email)
          expect(emails).not_to include(unresponded_student_email)
        end
      end
    end
  end
end
