# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AnnouncementNotifier, type: :notifier do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#new_announcement' do
      let(:course) { create(:course) }
      let!(:course_user) { create(:course_manager, course: course) }
      let!(:course_user_manager) { course_user.user }
      let!(:course_user_normal) { create(:course_user, course: course).user }
      let!(:course_user_phantom1) { create(:course_user, :phantom, course: course).user }
      let!(:course_user_phantom2) { create(:course_user, :phantom, course: course).user }
      let(:announcement) { create(:course_announcement, course: course) }

      def set_announcement_email_setting(setting, regular, phantom)
        email_setting = course.
                        setting_emails.
                        where(component: :announcements,
                              course_assessment_category_id: nil,
                              setting: setting).first
        email_setting.update!(regular: regular, phantom: phantom)
      end

      before do
        allow_any_instance_of(Course::Announcement).to receive(:setup_opening_reminders)
      end

      subject { Course::AnnouncementNotifier.new_announcement(course_user_manager, announcement) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end

      it 'sends an email notification' do
        expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(5)
      end

      context 'when a user unsubscribes' do
        before do
          setting_email = course.
                          setting_emails.
                          where(component: :announcements,
                                course_assessment_category_id: nil,
                                setting: :new_announcement).first
          course_user.email_unsubscriptions.create!(course_setting_email: setting_email)
        end

        it 'does not send an email notification to the user' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(4)
        end
      end

      context 'when email notification for new announcement is disabled for all users' do
        before { set_announcement_email_setting(:new_announcement, false, false) }

        it 'does not send a course notification' do
          expect { subject }.to change(course.notifications, :count).by(0)
        end

        it 'does not send email notifications' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end

      context 'when email notification for new announcement is disabled for phantom users' do
        before do
          set_announcement_email_setting(:new_announcement, true, false)
        end

        it 'sends a course notification' do
          expect { subject }.to change(course.notifications, :count).by(1)
        end

        it 'does not send email notifications to phantom users' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(3)
        end
      end

      context 'when email notification for new announcement is disabled for regular users' do
        before do
          set_announcement_email_setting(:new_announcement, false, true)
        end

        it 'sends a course notification' do
          expect { subject }.to change(course.notifications, :count).by(1)
        end

        it 'does not send email notifications to regular users' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(2)
        end
      end
    end
  end
end
