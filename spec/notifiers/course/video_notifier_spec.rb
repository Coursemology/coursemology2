# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::VideoNotifier, type: :mailer do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#video_attempted' do
      let(:course) { create(:course) }
      let!(:video) { create(:video, course: course) }
      let!(:user) { create(:course_user, course: course).user }

      subject { Course::VideoNotifier.video_attempted(user, video) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end
    end

    describe '#video_closing' do
      let!(:now) { Time.zone.now }
      let(:activity) { Activity.find_by(object: video, event: :closing, actor: course_user_manager) }

      let(:course) { create(:course) }
      let!(:video) { create(:course_video, course: course, end_at: now) }
      let(:course_user_manager) { create(:course_manager, course: course).user }
      let!(:submitted_student_normal) { create(:course_student, course: course) }
      let!(:submitted_student_phantom) { create(:course_student, :phantom, course: course) }
      let!(:unsubmitted_student_normal) { create(:course_student, course: course) }
      let!(:unsubmitted_student_phantom1) { create(:course_student, :phantom, course: course) }
      let!(:unsubmitted_student_phantom2) { create(:course_student, :phantom, course: course) }
      let!(:video_submission_normal) do
        create(:video_submission, course: course, video: video, creator: submitted_student_normal.user)
      end
      let!(:video_submission_phantom) do
        create(:video_submission, course: course, video: video, creator: submitted_student_phantom.user)
      end

      def set_video_email_setting(setting, regular, phantom)
        email_setting = course.
                        setting_emails.
                        where(component: :videos,
                              course_assessment_category_id: nil,
                              setting: setting).first
        email_setting.update!(regular: regular, phantom: phantom)
      end

      subject { Course::VideoNotifier.video_closing(course_user_manager, video) }

      it 'sends a user notification' do
        expect { subject }.to change(UserNotification, :count).by(3)
      end

      it 'sends email notifications to students who have not attempted it' do
        expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(3)
      end

      it 'creates an activity' do
        subject
        expect(activity).not_to be_nil
      end

      context 'when a user unsubscribes' do
        before do
          setting_email = course.
                          setting_emails.
                          where(component: :videos,
                                course_assessment_category_id: nil,
                                setting: :closing_reminder).first
          unsubmitted_student_normal.email_unsubscriptions.create!(course_setting_email: setting_email)
        end

        it 'does not send an email notification to the user' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(2)
        end
      end

      context 'when email notification setting for video closing is disabled' do
        before { set_video_email_setting(:closing_reminder, false, false) }

        it 'does not send a user notification' do
          expect { subject }.to change(UserNotification, :count).by(0)
        end

        it 'does not send an email notification' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end

      context 'when email notification setting for video closing is disabled for phantom users' do
        before { set_video_email_setting(:closing_reminder, true, false) }

        it 'sends notifications to regular users' do
          expect { subject }.to change(UserNotification, :count).by(1)
        end

        it 'sends email notifications to regular users' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
        end
      end

      context 'when email notification setting for video closing is disabled for regular users' do
        before { set_video_email_setting(:closing_reminder, false, true) }

        it 'sends notifications to phantom users' do
          expect { subject }.to change(UserNotification, :count).by(2)
        end

        it 'sends email notifications to phantom users' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(2)
        end
      end
    end
  end
end
