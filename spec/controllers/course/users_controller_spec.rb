# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UsersController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, :opened) }
    let(:course_user_immutable_stub) do
      stub = CourseUser.new(course: course)
      allow(stub).to receive(:save).and_return(false)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    describe '#students' do
      before { sign_in(user) }
      subject { get :students, course_id: course }

      context 'when a course manager visits the page' do
        let!(:course_lecturer) { create(:course_manager, :approved, course: course, user: user) }

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
      subject { get :staff, course_id: course }

      context 'when a course manager visits the page' do
        let!(:course_lecturer) { create(:course_manager, :approved, course: course, user: user) }

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
      subject { put :update, course_id: course, id: course_user, course_user: updated_course_user }
      let!(:course_user_to_update) { create(:course_user) }
      let(:updated_course_user) { { role: :teaching_assistant } }

      context 'when the user is a manager' do
        let!(:logged_in_course_user) do
          create(:course_manager, :approved, course: course, user: user)
        end
        let(:course_user) { create(:course_manager, course: course) }

        it 'updates the Course User' do
          expect { subject }.to change { course_user.reload.role }.to('teaching_assistant')
        end

        it 'sets the proper flash message' do
          subject
          expect(flash[:success]).to eq(I18n.t('course.users.update.success'))
        end

        it 'does not send a notification email to the user' do
          expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(0)
        end

        context 'when the user cannot be saved' do
          before do
            controller.instance_variable_set(:@course_user, course_user_immutable_stub)
            subject
          end

          it { is_expected.to redirect_to(course_users_staff_path(course)) }
          it 'sets an error flash message' do
            expect(flash[:danger]).to eq('')
          end
        end

        context 'when the user transitions from the requested state to the approved state' do
          let(:updated_course_user) { { workflow_state: :approved } }
          it 'sends a notification email to the user' do
            expect { subject }.to change { ActionMailer::Base.deliveries.count }.by(1)
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
      subject { delete :destroy, course_id: course, id: course_user_to_delete }

      let!(:course_user_to_delete) { create(:course_user, course: course, user: create(:user)) }

      context 'when the user is a manager' do
        let!(:course_user) { create(:course_manager, :approved, course: course, user: user) }

        it 'destroys the registration record' do
          expect { subject }.to change { course.course_users.reload.count }.by(-1)
        end
        it { is_expected.to redirect_to(course_users_students_path(course)) }
        it 'sets the proper flash message' do
          subject
          expect(flash[:success]).to eq(I18n.t('course.users.destroy.success'))
        end

        context 'when the user cannot be destroyed' do
          before do
            controller.instance_variable_set(:@course_user, course_user_immutable_stub)
            subject
          end

          it { is_expected.to redirect_to(course_users_students_path(course)) }
          it 'sets an error flash message' do
            expect(flash[:danger]).to eq('')
          end
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
  end
end
