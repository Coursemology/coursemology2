# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::EnrolRequestsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, :enrollable) }
    let(:admin) { course.course_users.first.user }
    let(:immutable_request) do
      create(:course_enrol_request, :pending, course: course, user: user).tap do |stub|
        allow(stub).to receive(:update).and_return(false)
      end
    end

    before { controller_sign_in(controller, user) }

    describe '#create' do
      subject { post :create, params: { course_id: course } }

      context 'when a user creates a new enrolment request' do
        it 'redirects and sets the proper success flash message' do
          subject
          is_expected.to have_http_status(:ok)
        end

        it 'sends an email notification to course owner', type: :mailer do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          email_subjects = ActionMailer::Base.deliveries.map(&:subject)

          expect(ActionMailer::Base.deliveries.count).to eq(1)
          expect(emails).to include(admin.email)
          expect(email_subjects).to include('course.mailer.user_enrol_requested_email.subject')
        end

        context 'when there is an existing pending request' do
          before do
            create(:course_enrol_request, :pending, course: course, user: user)
          end

          it 'sets the proper danger flash message' do
            subject
            is_expected.to have_http_status(:bad_request)
          end
        end

        context 'when there is no existing pending request' do
          before do
            create(:course_enrol_request, :rejected, course: course, user: user)
          end

          it 'sets the proper danger flash message' do
            subject
            is_expected.to have_http_status(:ok)
          end
        end
      end
    end

    describe '#destroy' do
      subject { delete :destroy, params: { course_id: course, id: request } }

      context 'when a user cancels an enrolment request' do
        let!(:request) { create(:course_enrol_request, :pending, course: course, user: user) }
        it 'redirects and sets the proper success flash message' do
          subject
          is_expected.to have_http_status(:ok)
        end
      end

      context 'when a user cancels a processed enrolment request' do
        let!(:request) { create(:course_enrol_request, :approved, course: course, user: user) }
        it 'redirects and sets the proper message' do
          subject
          is_expected.to have_http_status(:bad_request)
        end
      end
    end

    describe '#approve' do
      before { controller_sign_in(controller, admin) }
      let!(:request) { create(:course_enrol_request, :pending, course: course, user: user) }

      subject do
        patch :approve, params: { course_id: course,
                                  id: request,
                                  course_user: { name: user.name, role: 'student', phantom: false },
                                  format: 'json' }
      end

      context 'when a valid request is approved' do
        it 'adds the user to the course' do
          subject
          expect(subject).to have_http_status(:ok)

          request.reload
          expect(request.workflow_state).to eq('approved')
          course_user = course.course_users.find_by(user_id: request.user.id)
          expect(course_user).to be_present
        end

        it 'sends an acceptance email notification', type: :mailer do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          email_subjects = ActionMailer::Base.deliveries.map(&:subject)

          expect(ActionMailer::Base.deliveries.count).to be <= 2 # TODO: Flaky test, randomly return 1 or 2
          expect(emails).to include(user.email)
          expect(email_subjects).to include('course.mailer.user_added_email.subject')
        end
      end

      context 'when a course user already exists' do
        let!(:course_user) { create(:course_student, course: course, user: user) }
        it 'returns bad_request with errors' do
          subject
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end

      context 'when a course user exists but is soft-deleted' do
        let!(:course_user) { create(:course_student, course: course, user: user, deleted_at: Time.current) }

        it 'restores the soft-deleted course user' do
          expect { subject }.to change { course.course_users.with_deleted.count }.by(0)
          expect(subject).to have_http_status(:ok)

          request.reload
          expect(request.workflow_state).to eq('approved')

          restored_course_user = course.course_users.find_by(user_id: request.user.id)
          expect(restored_course_user).to be_present
          expect(restored_course_user.deleted_at).to be_nil
        end

        it 'sends an acceptance email notification', type: :mailer do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).flatten
          email_subjects = ActionMailer::Base.deliveries.map(&:subject)

          expect(ActionMailer::Base.deliveries.count).to be <= 2 # TODO: Flaky test, randomly return 1 or 2
          expect(emails).to include(user.email)
          expect(email_subjects).to include('course.mailer.user_added_email.subject')
        end
      end

      context 'when the course user creation fails' do
        before do
          allow_any_instance_of(CourseUser).to receive(:save).and_return(false)
        end

        it 'returns bad_request with errors' do
          subject
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end

    describe '#reject' do
      before { controller_sign_in(controller, admin) }
      let!(:request) { create(:course_enrol_request, :pending, course: course, user: user) }

      subject do
        patch :reject, params: { course_id: course,
                                 id: request,
                                 format: 'json' }
      end

      context 'when a valid request is rejected' do
        it 'does not add the user to the course' do
          subject
          expect(subject).to have_http_status(:ok)

          request.reload
          expect(request.workflow_state).to eq('rejected')
          course_user = course.course_users.find_by(user_id: request.user.id)
          expect(course_user).to be_nil
        end

        it 'sends a rejection email', type: :mailer do
          subject
          emails = ActionMailer::Base.deliveries.map(&:to).map(&:first)
          email_subjects = ActionMailer::Base.deliveries.map(&:subject)

          expect(ActionMailer::Base.deliveries.count).to eq(1)
          expect(emails).to include(user.email)
          expect(email_subjects).to include('course.mailer.user_rejected_email.subject')
        end
      end

      context 'when a valid request is failed to be rejected' do
        before do
          controller.instance_variable_set(:@enrol_request, request)
        end

        let(:request) { immutable_request }

        it 'fails to reject the request' do
          subject

          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end

      context 'when the enrol request update fails' do
        before do
          allow_any_instance_of(Course::EnrolRequest).to receive(:update).and_return(false)
        end

        it 'returns bad_request with errors' do
          subject
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end
  end
end
