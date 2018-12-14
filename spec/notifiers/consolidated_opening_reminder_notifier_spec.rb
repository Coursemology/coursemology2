# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ConsolidatedOpeningReminderNotifier, type: :notifier do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#opening_reminder' do
      context 'when user does not have a personal time' do
        let(:course) { create(:course) }
        let!(:user) { create(:course_user, course: course).user }
        let!(:video) do
          create(:course_video, course: course, start_at: 1.hour.from_now, published: true)
        end

        subject { Course::ConsolidatedOpeningReminderNotifier.opening_reminder(course) }

        it 'sends a course notification' do
          expect { subject }.to change(course.notifications, :count).by(1)
        end

        it 'sends an email notification' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(2)
        end

        context 'when email notification for video opening is disabled' do
          before do
            context = OpenStruct.new(key: Course::VideosComponent.key, current_course: course)
            Course::Settings::VideosComponent.new(context).
              update_email_setting('key' => 'video_opening', 'enabled' => false)
            course.save!
          end

          it 'does not send a course notification' do
            expect { subject }.to change(course.notifications, :count).by(0)
          end

          it 'does not send an email notification' do
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
          before do
            context = OpenStruct.new(key: Course::VideosComponent.key, current_course: course)
            Course::Settings::VideosComponent.new(context).
              update_email_setting('key' => 'video_opening', 'enabled' => false)
            course.save!
          end

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
          before do
            context = OpenStruct.new(key: Course::VideosComponent.key, current_course: course)
            Course::Settings::VideosComponent.new(context).
              update_email_setting('key' => 'video_opening', 'enabled' => false)
            course.save!
          end

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
