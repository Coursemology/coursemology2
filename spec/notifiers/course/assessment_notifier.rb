# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::AssessmentNotifier, type: :notifier do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    describe '#assessment_attempted' do
      let(:course) { create(:course) }
      let(:assessment) { create(:assessment, course: course) }
      let(:user) { create(:course_user, course: course).user }

      subject { Course::AssessmentNotifier.assessment_attempted(user, assessment) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end
    end

    describe '#assessment_submitted' do
      let(:course) { create(:course) }
      let(:course_user) { create(:course_user, course: course) }
      let(:user) { course_user.user }
      let(:submission) { create(:submission, course: course, creator: user) }

      context 'when user do not belongs to any group' do
        subject { Course::AssessmentNotifier.assessment_submitted(user, course_user, submission) }

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

        subject { Course::AssessmentNotifier.assessment_submitted(user, course_user, submission) }

        it 'sends an email notification' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(2)
        end
      end
    end

    describe '#assessment_opening' do
      let(:course) { create(:course) }
      let(:assessment) { create(:course_assessment_assessment, course: course) }
      let(:user) { create(:course_user, course: course).user }

      subject { Course::AssessmentNotifier.assessment_opening(user, assessment) }

      it 'sends a course notification' do
        expect { subject }.to change(course.notifications, :count).by(1)
      end

      it 'sends an email notification' do
        expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(2)
      end
    end

    describe '#assessment_closing' do
      let!(:now) { Time.zone.now }

      let(:course) { create(:course) }
      let(:assessment) { create(:course_assessment_assessment, course: course, end_at: now) }
      let(:user) { create(:course_manager, course: course).user }
      let!(:completed_student) { create(:course_student, course: course) }
      let!(:uncompleted_student) { create(:course_student, course: course) }
      let!(:phantom_student) { create(:course_student, :phantom, course: course) }
      let!(:submission) do
        create(:course_assessment_submission, :submitted,
               course: course, assessment: assessment,
               creator: completed_student.user)
      end
      let!(:uncompleted_submission) do
        create(:course_assessment_submission, :attempting,
               course: course, assessment: assessment,
               creator: uncompleted_student.user)
      end
      let!(:phantom_submission) do
        create(:course_assessment_submission, :attempting,
               course: course, assessment: assessment,
               creator: phantom_student.user)
      end

      subject { Course::AssessmentNotifier.assessment_closing(user, assessment) }

      it 'sends the accurate number of user notifications' do
        expect { subject }.to change(UserNotification, :count).by(2)
      end

      it 'sends an notification to phantom and non-phantom with uncompleted submissions' do
        expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(2)
      end
    end
  end
end
