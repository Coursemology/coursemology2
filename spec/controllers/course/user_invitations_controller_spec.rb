require 'rails_helper'

RSpec.describe Course::UserInvitationsController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:open_course) }

    describe '#create_invite' do
      before { sign_in(user) }
      let(:invite_params) { { users: {} } }

      subject { post :create, course_id: course, course: invite_params }

      context 'when a course manager visits the page' do
        let!(:course_lecturer) { create(:course_manager, course: course, user: user) }

        it { is_expected.to redirect_to(course_users_invitations_path(course)) }

        context 'when the invitations do not get created successfully' do
          before do
            stubbed_invitation_service = Course::UserInvitationService.new(course)
            stubbed_invitation_service.define_singleton_method(:invite) do |*|
              false
            end
            expect(controller).to receive(:invitation_service).
              and_return(stubbed_invitation_service)
          end

          it { is_expected.to render_template(:new) }
        end

        context 'when an invalid CSV is uploaded' do
          let(:invite_params) do
            { users_file: fixture_file_upload('course/invalid_invitation.csv') }
          end
          it { is_expected.to render_template(:new) }
        end
      end

      context 'when a student visits the page' do
        let!(:course_student) { create(:course_student, course: course, user: user) }
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end

      context 'when a user is not registered in the course' do
        it { expect { subject }.to raise_exception(CanCan::AccessDenied) }
      end
    end
  end
end
