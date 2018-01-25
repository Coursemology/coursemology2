# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::ConsolidatedOpeningReminderNotifier, type: :notifier do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#opening_reminder' do
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
  end
end
