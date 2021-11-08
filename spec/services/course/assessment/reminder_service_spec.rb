# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::ReminderService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:course_creator) { course.course_users.first }
    let!(:student_regular) { create(:course_student, course: course) }
    let!(:student_phantom) { create(:course_student, :phantom, course: course) }

    let(:course_creator_email) { course.creator.email }
    let(:student_regular_email) { student_regular.user.email }
    let(:student_phantom_email) { student_phantom.user.email }

    describe '#closing_reminder' do
      let(:assessment) do
        create(:assessment, :published, :with_text_response_question, course: course, end_at: 2.days.from_now)
      end

      def set_assessment_email_setting(setting, regular, phantom)
        email_setting = course.
                        setting_emails.
                        where(component: :assessments,
                              course_assessment_category_id: assessment.tab.category.id,
                              setting: setting).first
        email_setting.update!(regular: regular, phantom: phantom)
      end

      subject do
        Course::Assessment::ReminderService.
          closing_reminder(assessment, assessment.closing_reminder_token)
      end

      context 'when "assessment closing" emails are enabled' do
        it 'sends email notifications to regular users and summary emails to staff' do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          expect(emails).to include(course_creator_email)
          expect(emails).to include(student_regular_email)
          expect(emails).to include(student_phantom_email)
        end
      end

      context 'when a user unsubscribes from the closing reminder' do
        before do
          setting_email = course.
                          setting_emails.
                          where(component: :assessments,
                                course_assessment_category_id: assessment.tab.category.id,
                                setting: :closing_reminder).first
          student_regular.email_unsubscriptions.create!(course_setting_email: setting_email)
        end

        it 'does not send an email notification to the user' do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          expect(emails).to include(course_creator_email)
          expect(emails).not_to include(student_regular_email)
          expect(emails).to include(student_phantom_email)
        end
      end

      context 'when a user unsubscribes from the closing reminder summary' do
        before do
          setting_email = course.
                          setting_emails.
                          where(component: :assessments,
                                course_assessment_category_id: assessment.tab.category.id,
                                setting: :closing_reminder_summary).first
          course_creator.email_unsubscriptions.create!(course_setting_email: setting_email)
        end

        it 'does not send an email notification to the user' do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          expect(emails).not_to include(course_creator_email)
          expect(emails).to include(student_regular_email)
          expect(emails).to include(student_phantom_email)
        end
      end

      context 'when "assessment closing" email setting is disabled for phantom users' do
        before { set_assessment_email_setting(:closing_reminder, true, false) }

        it 'sends email notifications to regular users and summary emails to staff' do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          expect(emails).to include(course_creator_email)
          expect(emails).to include(student_regular_email)

          expect(emails).not_to include(student_phantom_email)
        end
      end

      context 'when "assessment closing" email setting is disabled for regular users' do
        before { set_assessment_email_setting(:closing_reminder, false, true) }

        it 'sends email notifications to phantom users and summary emails to staff' do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          expect(emails).to include(course_creator_email)
          expect(emails).to include(student_phantom_email)

          expect(emails).not_to include(student_regular_email)
        end
      end

      context 'when "assessment closing" email setting is disabled for all users' do
        before { set_assessment_email_setting(:closing_reminder, false, false) }

        it 'does not send any email' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end

      context 'when "assessment closing" and summary email settings are disabled for phantom users' do
        before do
          set_assessment_email_setting(:closing_reminder, true, false)
          set_assessment_email_setting(:closing_reminder_summary, true, false)
        end

        it 'sends email notifications to regular users and summary emails to regular staff' do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          expect(emails).to include(course_creator_email)
          expect(emails).to include(student_regular_email)

          expect(emails).not_to include(student_phantom_email)
        end
      end

      context 'when "assessment closing" and summary email settings are disabled for regular users' do
        before do
          course.course_users.first.update!(phantom: true)
          set_assessment_email_setting(:closing_reminder, false, true)
          set_assessment_email_setting(:closing_reminder_summary, false, true)
        end
        it 'sends email notifications to phantom users and no summary emails to regular staff' do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          expect(emails).to include(course_creator_email)
          expect(emails).to include(student_phantom_email)

          expect(emails).not_to include(student_regular_email)
        end
      end
    end
  end
end
