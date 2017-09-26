# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AssessmentNotifier, type: :notifier do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:settings_context) do
      OpenStruct.new(key: Course::AssessmentsComponent.key, current_course: course)
    end

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
      let!(:course_user) { create(:course_user, course: course) }
      let(:user) { course_user.user }
      let!(:submission) { create(:submission, course: course, creator: user) }

      subject { Course::AssessmentNotifier.assessment_submitted(user, course_user, submission) }

      context 'when "new submission" emails are disabled' do
        before do
          setting = {
            'key' => 'new_submission', 'enabled' => false,
            'options' => { 'category_id' => submission.assessment.tab.category.id }
          }
          Course::Settings::AssessmentsComponent.new(settings_context).update_email_setting(setting)
          course.save!
        end

        it 'does not send email notifications' do
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

    describe '#assessment_opening' do
      let(:course) { create(:course) }
      let!(:assessment) { create(:course_assessment_assessment, course: course) }
      let!(:user) { create(:course_user, course: course).user }

      subject { Course::AssessmentNotifier.assessment_opening(user, assessment) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end

      it 'sends an email notification' do
        expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(2)
      end

      context 'when "assessment opening" emails are disabled' do
        before do
          setting = {
            'key' => 'assessment_opening', 'enabled' => false,
            'options' => { 'category_id' => assessment.tab.category.id }
          }
          Course::Settings::AssessmentsComponent.new(settings_context).update_email_setting(setting)
          course.save!
        end

        it 'does not send email notifications' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end
      end
    end
  end
end
