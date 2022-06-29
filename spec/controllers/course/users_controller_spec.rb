# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UsersController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, :enrollable) }
    let(:course_user_immutable_stub) do
      stub = CourseUser.new(course: course)
      allow(stub).to receive(:save).and_return(false)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    describe '#students' do
      before { sign_in(user) }
      subject { get :students, params: { course_id: course } }

      context 'when a course manager visits the page' do
        let!(:course_lecturer) { create(:course_manager, course: course, user: user) }

        it { is_expected.to render_template(:students) }
      end

      context 'when a student visits the page' do
        let!(:course_student) { create(:course_student, course: course, user: user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a user is not registered in the course' do
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#staff' do
      before { sign_in(user) }
      subject { get :staff, params: { course_id: course } }

      context 'when a course manager visits the page' do
        let!(:course_lecturer) { create(:course_manager, course: course, user: user) }

        it { is_expected.to render_template(:staff) }
      end

      context 'when a student visits the page' do
        let!(:course_student) { create(:course_student, course: course, user: user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a user is not registered in the course' do
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#update' do
      before { sign_in(user) }
      subject do
        put :update, as: :json, params: { course_id: course, id: course_user, course_user: updated_course_user }
      end
      let!(:course_user_to_update) { create(:course_user) }
      let(:updated_course_user) { { role: :teaching_assistant } }

      context 'when the user is a manager' do
        let!(:logged_in_course_user) { create(:course_manager, course: course, user: user) }
        let(:course_user) { create(:course_manager, course: course) }

        it 'updates the Course User' do
          expect { subject }.to change { course_user.reload.role }.to('teaching_assistant')
        end

        it 'succeeds with http status ok' do
          expect(subject).to have_http_status(:ok)
        end

        it 'does not send a notification email to the user', type: :mailer do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end

        context 'when the user cannot be saved' do
          before do
            controller.instance_variable_set(:@course_user, course_user_immutable_stub)
            subject
          end

          it 'fails with http status bad request' do
            expect(subject).to have_http_status(:bad_request)
          end
        end
      end

      context 'when the user is a student' do
        let!(:course_user) { create(:course_student, course: course, user: user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is not registered' do
        let!(:other_user) { create(:user) }
        let!(:course_user) { create(:course_student, course: course, user: other_user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#destroy' do
      before { sign_in(user) }
      subject { delete :destroy, as: :json, params: { course_id: course, id: course_user_to_delete } }

      let!(:course_user_to_delete) { create(:course_user, course: course) }

      context 'when the user is a manager' do
        let!(:course_user) { create(:course_manager, course: course, user: user) }

        it 'destroys the registration record' do
          expect { subject }.to change { course.course_users.reload.count }.by(-1)
        end
        it { is_expected.to have_http_status(:ok) }

        context 'when the user cannot be destroyed' do
          before do
            controller.instance_variable_set(:@course_user, course_user_immutable_stub)
            subject
          end

          it { is_expected.to have_http_status(:bad_request) }
        end
      end

      context 'when the user is a student' do
        let!(:course_user) { create(:course_student, course: course, user: user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when the user is not registered' do
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#upgrade_to_staff' do
      before { sign_in(user) }
      subject do
        put :upgrade_to_staff, params: {
          course_id: course,
          course_users: staff_to_be_params,
          user: { id: course_user.id }
        }, format: :json
      end
      let!(:course_user) { create(:course_manager, course: course, user: user) }
      let(:staff_to_be) { create(:course_student, course: course) }
      let(:staff_to_be_params) { { ids: [staff_to_be.id], role: :teaching_assistant } }
      let(:staff_to_be_stub) do
        stub = staff_to_be
        allow(stub).to receive(:save).and_return(false)
        stub
      end

      context 'when a course user can be upgraded to staff' do
        before do
          controller.instance_variable_set(:@course_user, staff_to_be_stub)
          subject
        end

        it 'succeeds with http status ok' do
          expect(subject).to have_http_status(:ok)
        end

        it 'updates the role' do
          expect(staff_to_be.reload.role).to eq('teaching_assistant')
        end
      end
    end
  end
end
