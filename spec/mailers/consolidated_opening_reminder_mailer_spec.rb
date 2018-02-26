# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ConsolidatedOpeningReminderMailer, type: :mailer do
  include ApplicationNotificationsHelper

  with_tenant(:instance) do
    let(:user) { create(:user, name: 'tester') }
    let(:instance) { Instance.default }
    let(:course) { create(:course) }
    let!(:assessments) do
      create_list(:course_assessment_assessment, 3, course: course,
                                                    start_at: 1.hour.from_now, published: true)
    end
    let!(:surveys) do
      create_list(:course_survey, 2, course: course, start_at: 1.hour.from_now, published: true)
    end
    let!(:videos) do
      create_list(:course_video, 3, course: course, start_at: 1.hour.from_now, published: true)
    end
    let(:activity) do
      create(:activity, object: course,
                        notifier_type: 'Course::ConsolidatedOpeningReminderNotifier',
                        event: :opening_reminder)
    end
    let(:notification) { create(:course_notification, :email, activity: activity) }
    let(:template) { notification_view_path(notification) }
    let(:mail) do
      ConsolidatedOpeningReminderMailer.email(recipient: user, notification: notification,
                                              view_path: template)
    end
    let(:text) { mail.body.parts.find { |part| part.content_type.start_with?('text/plain') }.to_s }
    let(:html) { mail.body.parts.find { |part| part.content_type.start_with?('text/html') }.to_s }

    it 'sends to the correct person' do
      expect(mail.to).to contain_exactly(user.primary_email_record.email)
    end

    it 'sets the correct subject' do
      expect(mail.subject).to eq(I18n.t('.notifiers.course.'\
                                        'consolidated_opening_reminder_notifier.'\
                                        'opening_reminder.course_notifications.email.subject'))
    end

    it 'includes the assessments' do
      expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                     'consolidated_opening_reminder_notifier.'\
                                                     'opening_reminder.course_notifications.'\
                                                     'course.assessment.section_header'))

      assessments.each do |assessment|
        expect(mail.body.raw_source).to include(assessment.title)
      end
    end

    it 'includes the surveys' do
      expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                     'consolidated_opening_reminder_notifier.'\
                                                     'opening_reminder.course_notifications.'\
                                                     'course.survey.section_header'))

      surveys.each do |survey|
        expect(mail.body.raw_source).to include(survey.title)
      end
    end

    it 'includes the videos' do
      expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                     'consolidated_opening_reminder_notifier.'\
                                                     'opening_reminder.course_notifications.'\
                                                     'course.video.section_header'))

      videos.each do |video|
        expect(mail.body.raw_source).to include(video.title)
      end
    end
  end
end
