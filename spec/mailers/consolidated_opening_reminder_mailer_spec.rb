# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ConsolidatedOpeningReminderMailer, type: :mailer do
  include ApplicationNotificationsHelper

  with_tenant(:instance) do
    let(:instance) { Instance.default }
    let(:course) { create(:course) }
    let(:course_user) { create(:course_user, course: course, name: 'tester') }
    let(:user) { course_user.user }
    let!(:assessments) do
      create_list(:course_assessment_assessment, 3, course: course,
                                                    start_at: 1.hour.from_now, published: true)
    end
    let!(:category_id) { assessments.first.tab.category.id }
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

    def set_consolidated_opening_reminder_setting(component, category_id, setting, regular, phantom)
      email_setting = course.
                      setting_emails.
                      where(component: component,
                            course_assessment_category_id: category_id,
                            setting: setting).first
      email_setting.update!(regular: regular, phantom: phantom)
    end

    def unsubscribe(component, category_id, setting)
      setting_email = course.
                      setting_emails.
                      where(component: component,
                            course_assessment_category_id: category_id,
                            setting: setting).first
      course_user.email_unsubscriptions.create!(course_setting_email: setting_email)
    end

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

    context 'when a user unsubscribes from assessments, videos and surveys opening' do
      before do
        unsubscribe(:assessments, category_id, :opening_reminder)
        unsubscribe(:videos, nil, :opening_reminder)
        unsubscribe(:surveys, nil, :opening_reminder)
      end

      it 'does not send an email notification to the user' do
        expect(mail.message).to be_kind_of(ActionMailer::Base::NullMail)
      end
    end

    context 'when a user unsubscribes from assessments opening' do
      before do
        unsubscribe(:assessments, category_id, :opening_reminder)
      end

      it 'does not include the assessments in the email notification' do
        expect(mail.body.raw_source).to_not include(I18n.t('notifiers.course.'\
                                                           'consolidated_opening_reminder_notifier.'\
                                                           'opening_reminder.course_notifications.'\
                                                           'course.assessment.section_header'))

        assessments.each do |assessment|
          expect(mail.body.raw_source).to_not include(assessment.title)
        end
      end

      it 'includes the surveys in the email notification' do
        expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                       'consolidated_opening_reminder_notifier.'\
                                                       'opening_reminder.course_notifications.'\
                                                       'course.survey.section_header'))

        surveys.each do |survey|
          expect(mail.body.raw_source).to include(survey.title)
        end
      end

      it 'includes the videos in the email notification' do
        expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                       'consolidated_opening_reminder_notifier.'\
                                                       'opening_reminder.course_notifications.'\
                                                       'course.video.section_header'))

        videos.each do |video|
          expect(mail.body.raw_source).to include(video.title)
        end
      end
    end

    context 'when a user unsubscribes from videos opening' do
      before do
        unsubscribe(:videos, nil, :opening_reminder)
      end

      it 'includes the assessments in the email notification' do
        expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                       'consolidated_opening_reminder_notifier.'\
                                                       'opening_reminder.course_notifications.'\
                                                       'course.assessment.section_header'))

        assessments.each do |assessment|
          expect(mail.body.raw_source).to include(assessment.title)
        end
      end

      it 'includes the surveys in the email notification' do
        expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                       'consolidated_opening_reminder_notifier.'\
                                                       'opening_reminder.course_notifications.'\
                                                       'course.survey.section_header'))

        surveys.each do |survey|
          expect(mail.body.raw_source).to include(survey.title)
        end
      end

      it 'doees not include the videos in the email notification' do
        expect(mail.body.raw_source).to_not include(I18n.t('notifiers.course.'\
                                                           'consolidated_opening_reminder_notifier.'\
                                                           'opening_reminder.course_notifications.'\
                                                           'course.video.section_header'))

        videos.each do |video|
          expect(mail.body.raw_source).to_not include(video.title)
        end
      end
    end

    context 'when a user unsubscribes from surveys opening' do
      before do
        unsubscribe(:surveys, nil, :opening_reminder)
      end

      it 'includes the assessments in the email notification' do
        expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                       'consolidated_opening_reminder_notifier.'\
                                                       'opening_reminder.course_notifications.'\
                                                       'course.assessment.section_header'))

        assessments.each do |assessment|
          expect(mail.body.raw_source).to include(assessment.title)
        end
      end

      it 'does not include the surveys in the email notification' do
        expect(mail.body.raw_source).to_not include(I18n.t('notifiers.course.'\
                                                           'consolidated_opening_reminder_notifier.'\
                                                           'opening_reminder.course_notifications.'\
                                                           'course.survey.section_header'))

        surveys.each do |survey|
          expect(mail.body.raw_source).to_not include(survey.title)
        end
      end

      it 'includes the videos in the email notification' do
        expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                       'consolidated_opening_reminder_notifier.'\
                                                       'opening_reminder.course_notifications.'\
                                                       'course.video.section_header'))

        videos.each do |video|
          expect(mail.body.raw_source).to include(video.title)
        end
      end
    end

    context 'when email setting for assessments opening is disabled' do
      before do
        set_consolidated_opening_reminder_setting(:assessments, category_id, :opening_reminder, false, true)
      end

      it 'does not include the assessments in the email notification' do
        expect(mail.body.raw_source).to_not include(I18n.t('notifiers.course.'\
                                                           'consolidated_opening_reminder_notifier.'\
                                                           'opening_reminder.course_notifications.'\
                                                           'course.assessment.section_header'))

        assessments.each do |assessment|
          expect(mail.body.raw_source).to_not include(assessment.title)
        end
      end

      it 'includes the surveys in the email notification' do
        expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                       'consolidated_opening_reminder_notifier.'\
                                                       'opening_reminder.course_notifications.'\
                                                       'course.survey.section_header'))

        surveys.each do |survey|
          expect(mail.body.raw_source).to include(survey.title)
        end
      end

      it 'includes the videos in the email notification' do
        expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                       'consolidated_opening_reminder_notifier.'\
                                                       'opening_reminder.course_notifications.'\
                                                       'course.video.section_header'))

        videos.each do |video|
          expect(mail.body.raw_source).to include(video.title)
        end
      end
    end

    context 'when email setting for videos opening is disabled' do
      before { set_consolidated_opening_reminder_setting(:videos, nil, :opening_reminder, false, true) }

      it 'includes the assessments in the email notification' do
        expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                       'consolidated_opening_reminder_notifier.'\
                                                       'opening_reminder.course_notifications.'\
                                                       'course.assessment.section_header'))

        assessments.each do |assessment|
          expect(mail.body.raw_source).to include(assessment.title)
        end
      end

      it 'includes the surveys in the email notification' do
        expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                       'consolidated_opening_reminder_notifier.'\
                                                       'opening_reminder.course_notifications.'\
                                                       'course.survey.section_header'))

        surveys.each do |survey|
          expect(mail.body.raw_source).to include(survey.title)
        end
      end

      it 'doees not include the videos in the email notification' do
        expect(mail.body.raw_source).to_not include(I18n.t('notifiers.course.'\
                                                           'consolidated_opening_reminder_notifier.'\
                                                           'opening_reminder.course_notifications.'\
                                                           'course.video.section_header'))

        videos.each do |video|
          expect(mail.body.raw_source).to_not include(video.title)
        end
      end
    end

    context 'when email setting for surveys opening is disabled' do
      before { set_consolidated_opening_reminder_setting(:surveys, nil, :opening_reminder, false, true) }

      it 'includes the assessments in the email notification' do
        expect(mail.body.raw_source).to include(I18n.t('notifiers.course.'\
                                                       'consolidated_opening_reminder_notifier.'\
                                                       'opening_reminder.course_notifications.'\
                                                       'course.assessment.section_header'))

        assessments.each do |assessment|
          expect(mail.body.raw_source).to include(assessment.title)
        end
      end

      it 'does not include the surveys in the email notification' do
        expect(mail.body.raw_source).to_not include(I18n.t('notifiers.course.'\
                                                           'consolidated_opening_reminder_notifier.'\
                                                           'opening_reminder.course_notifications.'\
                                                           'course.survey.section_header'))

        surveys.each do |survey|
          expect(mail.body.raw_source).to_not include(survey.title)
        end
      end

      it 'includes the videos in the email notification' do
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
end
