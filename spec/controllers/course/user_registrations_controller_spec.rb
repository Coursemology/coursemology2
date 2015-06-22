require 'rails_helper'

RSpec.describe Course::UserRegistrationsController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:open_course) }
    describe '#create' do
      before { sign_in(user) }
      subject { post :create, course_id: course, registration: registration_params }

      context 'when no registration code is specified' do
        let(:registration_params) { { code: '' } }
        context 'when the user is not in the course' do
          context 'when the course is open' do
            it 'creates a new request' do
              expect { subject }.
                to change { course.course_users.with_requested_state.reload.count }.by(1)
            end
            it { is_expected.to redirect_to(course_path(course)) }
            it 'sets the proper flash message' do
              subject
              expect(flash[:success]).to eq(I18n.t('course.user_registrations.create.requested'))
            end
          end

          context 'when the course is closed' do
            before { course.update_attributes!(status: :closed) }
            it 'rejects the request' do
              expect { subject }.to raise_exception(CanCan::AccessDenied)
            end
          end
        end

        context 'when the user is already registered' do
          context 'when the user is a student of the course' do
            let!(:course_student) { create(:course_student, course: course, user: user) }

            it { expect { subject }.not_to change { course.course_users.reload.count } }
            it { is_expected.to redirect_to(course_path(course)) }
            it 'sets the proper flash message' do
              subject
              expect(flash[:info]).to eq(I18n.t('course.users.new.already_registered'))
            end
          end

          context 'when the user is a manager of the course' do
            let!(:course_manager) { create(:course_manager, course: course, user: user) }

            it { expect { subject }.not_to change { course.course_users.reload.count } }
            it { is_expected.to redirect_to(course_path(course)) }
            it 'sets the proper flash message' do
              subject
              expect(flash[:info]).to eq(I18n.t('course.users.new.already_registered'))
            end
          end
        end
      end

      context 'when a registration code is specified' do
        let(:registration_params) { { code: registration_code } }

        context 'when a user registration code is specified' do
          let(:registration_code) { create(:course_user_invitation, course: course).invitation_key }

          context 'when the user is not in the course' do
            context 'when the course is open' do
              it 'registers the user' do
                expect { subject }.
                  to change { course.course_users.with_approved_state.reload.count }.by(1)
              end
              it { is_expected.to redirect_to(course_path(course)) }
              it 'sets the proper flash message' do
                subject
                expect(flash[:success]).to eq(I18n.t('course.user_registrations.create.registered'))
              end
            end

            context 'when the course is closed' do
              before { course.update_attributes!(status: :closed) }
              it 'rejects the request' do
                expect { subject }.to raise_exception(CanCan::AccessDenied)
              end
            end
          end

          context 'when the user is already registered' do
            let(:invitation) { Course::UserInvitation.find_by(invitation_key: registration_code) }
            before { invitation.course_user.accept!(user) }

            it { expect { subject }.not_to change { course.course_users.reload.count } }
            it 'shows the proper error message' do
              subject
              errors = controller.instance_variable_get(:@registration).errors
              expect(errors).to have_key(:code)
              expect(errors[:code].to_sentence).to eq(
                I18n.t('course.user_registrations.create.invalid_code'))
            end
          end
        end

        context 'when a course registration code is specified' do
          it 'registers the user' do
            pending 'Not implemented'
            fail
          end
        end
      end
    end
  end
end
