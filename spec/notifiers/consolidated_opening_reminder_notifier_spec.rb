# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ConsolidatedOpeningReminderNotifier, type: :mailer do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#opening_reminder' do
      def set_consolidated_opening_reminder_setting(component, category_id, setting, regular, phantom)
        email_setting = course.
                        setting_emails.
                        where(component: component,
                              course_assessment_category_id: category_id,
                              setting: setting).first
        email_setting.update!(regular: regular, phantom: phantom)
      end

      def unsubscribes(component, category_id, setting)
        setting_email = course.
                        setting_emails.
                        where(component: component,
                              course_assessment_category_id: category_id,
                              setting: setting).first
        course_user.email_unsubscriptions.create!(course_setting_email: setting_email)
      end

      context 'when user does not have a personal time' do
        let(:course) { create(:course) }
        let(:course_user) { create(:course_user, course: course) }
        let!(:user) { course_user.user }
        let!(:video) do
          create(:course_video, course: course, start_at: 1.hour.from_now, published: true)
        end

        subject { Course::ConsolidatedOpeningReminderNotifier.opening_reminder(course) }

        it 'sends a course notification' do
          expect { subject }.to change(course.notifications, :count).by(1)
        end

        it 'sends email notifications to everyone' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(2)
        end

        context 'when a user unsubscribes' do
          before do
            unsubscribes(:videos, nil, :opening_reminder)
          end

          it 'does not send an email notification to the user' do
            expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
          end
        end

        context 'when email notification for video opening is disabled for regular students' do
          before { set_consolidated_opening_reminder_setting(:videos, nil, :opening_reminder, false, true) }

          it 'does not send email notifications to the regular students' do
            expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
          end

          it 'sends email notifications to phantom students' do
            course_user.update!(phantom: true)
            expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
          end
        end

        context 'when email notification for video opening is disabled for phantom students' do
          before { set_consolidated_opening_reminder_setting(:videos, nil, :opening_reminder, true, false) }

          it 'does not send an email notification to the phantom students' do
            course_user.update!(phantom: true)
            expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
          end
        end

        context 'when email notification for video opening is disabled' do
          before { set_consolidated_opening_reminder_setting(:videos, nil, :opening_reminder, false, false) }

          it 'does not send an email notification to everyone' do
            expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
          end
        end
      end

      context 'when user has a personal time and personal time starts in an hour' do
        let(:course) { create(:course) }
        let!(:course_user) { create(:course_user, course: course) }
        let!(:user) { course_user.user }
        let!(:video) do
          create(:course_video, course: course, start_at: 1.hour.from_now, published: true)
        end
        let!(:personal_times) do
          course.course_users.map do |course_user|
            personal_time = video.find_or_create_personal_time_for(course_user)
            personal_time.start_at = 1.hour.from_now
            personal_time.save!
            personal_time
          end
        end

        subject { Course::ConsolidatedOpeningReminderNotifier.opening_reminder(course) }

        it 'sends a course notification' do
          expect { subject }.to change(course.notifications, :count).by(1)
        end

        it 'sends an email notification' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(2)
        end

        context 'when email notification for video opening is disabled' do
          before { set_consolidated_opening_reminder_setting(:videos, nil, :opening_reminder, false, false) }

          it 'does not send a course notification' do
            expect { subject }.to change(course.notifications, :count).by(0)
          end

          it 'does not send an email notification' do
            expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
          end
        end
      end

      context 'when user has a personal time and personal time starts a long time later' do
        let(:course) { create(:course) }
        let!(:course_user) { create(:course_user, course: course) }
        let!(:user) { course_user.user }
        let!(:video) do
          create(:course_video, course: course, start_at: 1.hour.from_now, published: true)
        end
        let!(:personal_times) do
          course.course_users.map do |course_user|
            personal_time = video.find_or_create_personal_time_for(course_user)
            personal_time.start_at = 100.hours.from_now
            personal_time.save!
            personal_time
          end
        end

        subject { Course::ConsolidatedOpeningReminderNotifier.opening_reminder(course) }

        it 'does not send a course notification' do
          expect { subject }.to change(course.notifications, :count).by(0)
        end

        it 'does not send an email notification' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end

        context 'when email notification for video opening is disabled' do
          before { set_consolidated_opening_reminder_setting(:videos, nil, :opening_reminder, false, false) }

          it 'does not send a course notification' do
            expect { subject }.to change(course.notifications, :count).by(0)
          end

          it 'does not send an email notification' do
            expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
          end
        end
      end
    end
  end
end
