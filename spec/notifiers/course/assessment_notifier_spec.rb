# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AssessmentNotifier, type: :notifier do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#assessment_attempted' do
      let!(:course) { create(:course) }
      let!(:assessment) { create(:assessment, course: course) }
      let!(:user) { create(:course_user, course: course).user }

      subject { Course::AssessmentNotifier.assessment_attempted(user, assessment) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end
    end

    describe '#assessment_submitted' do
      let(:course) { create(:course) }
      let!(:course_creator) { course.course_users.first }
      let!(:course_user) { create(:course_user, course: course) }
      let(:user) { course_user.user }
      let!(:submission) { create(:submission, course: course, creator: user) }

      subject { Course::AssessmentNotifier.assessment_submitted(user, course_user, submission) }

      it 'does not send email notifications' do
        expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
      end

      context 'when a user unsubscribes' do
        before do
          setting_email = course.
                          setting_emails.
                          where(component: :assessments,
                                course_assessment_category_id: submission.assessment.tab.category.id,
                                setting: :new_submission).first
          course_creator.email_unsubscriptions.create!(course_setting_email: setting_email)
        end

        it 'does not send an email notification to the user' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end

      context 'when "new submission" email setting is disabled for regular staff' do
        before do
          email_setting = course.
                          setting_emails.
                          where(component: :assessments,
                                course_assessment_category_id: submission.assessment.tab.category.id,
                                setting: :new_submission).first
          email_setting.update!(regular: false, phantom: true)
        end

        it 'does not send email notifications to the regular staff' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end

      context 'when "new submission" email setting is disabled for phantom staff' do
        before do
          course_creator.update!(phantom: true)
          email_setting = course.
                          setting_emails.
                          where(component: :assessments,
                                course_assessment_category_id: submission.assessment.tab.category.id,
                                setting: :new_submission).first
          email_setting.update!(regular: true, phantom: false)
        end

        it 'does not send email notifications to the phantom staff' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end

      context 'when user does not belong to any group' do
        it 'sends an email notification' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
        end
      end

      context 'when user belongs to a group' do
        let(:group) { create(:course_group, course: course) }
        let(:teaching_assistant) { create(:course_teaching_assistant, course: course) }
        let!(:group_manager) do
          create(:course_group_manager, group: group, course_user: teaching_assistant)
        end
        let!(:group_user) { create(:course_group_user, group: group, course_user: course_user) }

        it 'sends an email notification' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(2)
        end
      end
    end
  end
end
