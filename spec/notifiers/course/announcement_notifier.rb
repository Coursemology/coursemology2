# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AnnouncementNotifier, type: :notifier do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    describe '#new_announcement' do
      let(:course) { create(:course) }
      let(:user) { create(:course_user, course: course).user }
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
    end
  end
end
