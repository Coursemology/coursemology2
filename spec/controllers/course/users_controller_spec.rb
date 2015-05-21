require 'rails_helper'

RSpec.describe Course::UsersController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:open_course) }
    let(:course_user_immutable_stub) do
      stub = CourseUser.new(course: course)
      allow(stub).to receive(:save).and_return(false)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end

    describe '#index' do
      before { sign_in(user) }
      subject { get :index, course_id: course }

      context 'when a course manager visits the page' do
        let!(:course_lecturer) { create(:course_manager, course: course, user: user) }

        it { is_expected.to render_template(:index) }
      end

      context 'when a student visits the page' do
        let!(:course_student) { create(:course_student, course: course, user: user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a user is not registered in the course' do
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end

    describe '#create' do
      before { sign_in(user) }
      subject { post :create, course_id: course, course_user: user_params }

      context 'when the user is not in the course' do
        let(:user_params) { { user_id: user.id } }

        context 'when the course is open' do
          context "when the course user is the students' own" do
            it 'creates a new request' do
              expect { subject }.
                to change { course.course_users.with_requested_state.reload.count }.by(1)
            end
            it { is_expected.to redirect_to(course_path(course)) }
            it 'sets the proper flash message' do
              subject
              expect(flash[:success]).to eq(I18n.t('course.users.create.success'))
            end
          end

          context 'when the user being added is someone else' do
            let(:user_params) { { user_id: create(:user).id } }
            it 'rejects the request' do
              expect { subject }.to raise_exception(CanCan::AccessDenied)
            end
          end
        end

        context 'course is closed' do
          before { course.update_attributes!(status: :closed) }
          it 'rejects the request' do
            expect { subject }.to raise_exception(CanCan::AccessDenied)
          end
        end
      end

      context 'when the user is already registered' do
        context 'when the user is a student of the course' do
          let!(:course_student) { create(:course_student, course: course, user: user) }
          let(:user_params) { { user_id: user.id } }

          it { expect { subject }.not_to change { course.course_users.reload.count } }
          it { is_expected.to redirect_to(course_path(course)) }
          it 'sets the proper flash message' do
            subject
            expect(flash[:info]).to eq(I18n.t('course.users.new.already_registered'))
          end
        end

        context 'when the user is a manager of the course' do
          let!(:course_manager) { create(:course_manager, course: course, user: user) }
          let(:user_params) { { user_id: user.id } }

          it { expect { subject }.not_to change { course.course_users.reload.count } }
          it { is_expected.to redirect_to(course_users_path(course)) }
          it 'sets the proper flash message' do
            subject
            expect(flash[:info]).to eq(I18n.t('course.users.new.already_registered'))
          end

          context 'when the manager is creating a new student' do
            let(:user_params) { { user_id: create(:user).id } }

            context 'when the course is closed' do
              before { course.update_attributes!(status: :closed) }
              it 'creates a new approved student' do
                expect { subject }.
                  to change { course.course_users.with_approved_state.reload.count }.by(1)
              end
            end

            context 'when the user cannot be saved' do
              before do
                controller.instance_variable_set(:@course_user, course_user_immutable_stub)
                subject
              end

              it { is_expected.to redirect_to(course_users_path(course)) }
            end
          end
        end
      end
    end

    describe '#update' do
      before { sign_in(user) }
      subject { put :update, course_id: course, id: course_user, course_user: updated_course_user }
      let!(:course_user_to_update) { create(:course_user) }
      let(:updated_course_user) { { role: :teaching_assistant } }

      context 'when the user is a manager' do
        let!(:course_user) { create(:course_manager, course: course, user: user) }

        it 'only updates the role' do
          expect { subject }.to change { course_user.reload.role }.to('teaching_assistant')
        end

        it 'sets the proper flash message' do
          subject
          expect(flash[:success]).to eq(I18n.t('course.users.update.success'))
        end

        context 'when the user cannot be saved' do
          before do
            controller.instance_variable_set(:@course_user, course_user_immutable_stub)
            subject
          end

          it { is_expected.to redirect_to(course_users_path(course)) }
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
        let!(:course_user) { create(:course_manager, course: course, user: user) }

        it 'destroys the registration record' do
          expect { subject }.to change { course.course_users.reload.count }.by(-1)
        end
        it { is_expected.to redirect_to(course_users_path(course)) }
        it 'sets the proper flash message' do
          subject
          expect(flash[:success]).to eq(I18n.t('course.users.destroy.success'))
        end

        context 'when the user cannot be destroyed' do
          before do
            controller.instance_variable_set(:@course_user, course_user_immutable_stub)
            subject
          end

          it { is_expected.to redirect_to(course_users_path(course)) }
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
