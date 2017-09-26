# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AnnouncementNotifier, type: :notifier do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#new_announcement' do
      let(:course) { create(:course) }
      let!(:user) { create(:course_user, course: course).user }
      let(:announcement) { create(:course_announcement, course: course) }

      before do
        allow_any_instance_of(Course::Announcement).to receive(:send_notification)
      end

      subject { Course::AnnouncementNotifier.new_announcement(user, announcement) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end

      it 'sends an email notification' do
        expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(2)
      end

      context 'when email notification for new announcement is disabled' do
        before do
          context = OpenStruct.new(key: Course::AnnouncementsComponent.key, current_course: course)
          Course::Settings::AnnouncementsComponent.new(context).
            update_email_setting('key' => 'new_announcement', 'enabled' => false)
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
