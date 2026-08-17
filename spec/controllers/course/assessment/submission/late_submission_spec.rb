# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::SubmissionsController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student) { create(:course_student, course: course) }
    let(:late_allowed) { false }
    let(:assessment) do
      create(:assessment, :published_with_mcq_question, course: course,
                                                        end_at: end_at, is_late_submission_allowed: late_allowed)
    end

    before { controller_sign_in(controller, student.user) }

    describe '#create past the deadline' do
      subject { post :create, params: { course_id: course, assessment_id: assessment } }

      context 'when the deadline has passed' do
        let(:end_at) { 1.hour.ago }

        it 'is forbidden and creates no submission' do
          expect { subject }.not_to change(assessment.submissions, :count)
          expect(subject).to have_http_status(:forbidden)
          expect(JSON.parse(subject.body)['error']).to be_present
        end
      end

      context 'when the deadline is in the future' do
        let(:end_at) { 1.hour.from_now }

        it 'creates a submission' do
          expect { subject }.to change(assessment.submissions, :count).by(1)
        end
      end

      context 'when the deadline only just passed (within the edit grace period)' do
        let(:end_at) { 1.minute.ago }

        it 'is still forbidden — creation is enforced strictly, with no grace' do
          expect { subject }.not_to change(assessment.submissions, :count)
          expect(subject).to have_http_status(:forbidden)
        end
      end
    end

    describe '#update past the deadline' do
      let(:end_at) { 1.hour.ago }
      let!(:submission) do
        create(:submission, :attempting, assessment: assessment,
                                         creator: student.user, course_user: student)
      end

      subject do
        post :update, params: {
          course_id: course, assessment_id: assessment, id: submission,
          submission: { finalise: true }, format: :json
        }
      end

      it 'denies editing the attempting submission' do
        expect { subject }.to raise_exception(CanCan::AccessDenied)
        expect(submission.reload).to be_attempting
      end
    end

    describe '#edit fail-safe for an overdue submission' do
      let(:end_at) { 20.minutes.ago }
      # The student began before the deadline, which has since passed while they were still attempting.
      let!(:submission) do
        create(:submission, :attempting, assessment: assessment,
                                         creator: student.user, course_user: student).
          tap { |s| s.update_column(:created_at, 1.hour.ago) }
      end

      subject do
        get :edit, params: {
          course_id: course, assessment_id: assessment, id: submission, format: :json
        }
      end

      it 'force-submits the overdue submission before responding' do
        expect { subject }.
          to change { submission.reload.workflow_state }.from('attempting').to('submitted')
      end

      context 'when a manager (not the creator) opens the page' do
        let(:manager) { create(:course_manager, course: course) }

        before { controller_sign_in(controller, manager.user) }

        it 'does not force-submit the student\'s attempt' do
          expect { subject }.not_to(change { submission.reload.workflow_state })
          expect(submission.reload).to be_attempting
        end
      end

      context 'when the submission has been unsubmitted' do
        before { submission.update_column(:unsubmitted_at, Time.zone.now) }

        it 'does not force-submit it' do
          expect { subject }.not_to(change { submission.reload.workflow_state })
          expect(submission.reload).to be_attempting
        end
      end

      context 'when staff started a test run after the deadline had passed' do
        let(:staff) { create(:course_teaching_assistant, course: course) }
        # Created now, i.e. after the passed end date — the deadline does not apply to it.
        let!(:submission) do
          create(:submission, :attempting, assessment: assessment,
                                           creator: staff.user, course_user: staff)
        end

        before { controller_sign_in(controller, staff.user) }

        it 'does not force-submit the staff test submission' do
          expect { subject }.not_to(change { submission.reload.workflow_state })
          expect(submission.reload).to be_attempting
        end
      end
    end

    describe '#edit late flag' do
      render_views

      # Late submissions are allowed here, so the flag is meaningful; end_at and submitted_at are both
      # Time values, and the flag compares them directly.
      let(:late_allowed) { true }
      let(:end_at) { 1.hour.ago }
      let!(:submission) do
        create(:submission, :submitted, assessment: assessment,
                                        creator: student.user, course_user: student)
      end

      subject do
        get :edit, params: {
          course_id: course, assessment_id: assessment, id: submission, format: :json
        }
      end

      it 'flags a submission finalised after the deadline as late' do
        expect(JSON.parse(subject.body)['submission']['late']).to be true
      end
    end
  end
end
