# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UserInvitationsController, type: :controller do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, :opened) }
    let(:erroneous_course) do
      create(:course, :opened).tap do |course|
        user = create(:user)
        course.course_users.build(user: user).save
        course.course_users.build(user: user)

        course.course_users.build(workflow_state: :invited, name: generate(:name)).
          build_invitation.build_user_email(email: 'fdgsdf@no')
        course.save
      end
    end

    def replace_with_erroneous_course
      course = erroneous_course
      controller.define_singleton_method(:current_course) do
        course
      end
    end

    describe '#create' do
      before { sign_in(user) }
      let(:invite_params) do
        invitation = {
          course_user: { name: generate(:name) },
          user_email: { email: generate(:email) }
        }
        invitations = { generate(:nested_attribute_new_id) => invitation }
        { invitations_attributes: invitations }
      end

      subject { post :create, course_id: course, course: invite_params }

      context 'when a course manager visits the page' do
        let!(:course_lecturer) { create(:course_manager, course: course, user: user) }

        it { is_expected.to redirect_to(course_users_invitations_path(course)) }

        context 'when the invitations do not get created successfully' do
          before do
            stubbed_invitation_service = Course::UserInvitationService.new(user, course)
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
            { invitations_file: fixture_file_upload('course/invalid_invitation.csv') }
          end
          it { is_expected.to render_template(:new) }
          it 'sets the course errors property' do
            subject
            expect(controller.current_course.errors.count).not_to eq(0)
            expect(controller.current_course.errors[:invitations_file].length).not_to eq(0)
          end
        end

        context 'when no users are manually specified for invitations' do
          subject { post :create, course_id: course }
          it { is_expected.to redirect_to(course_users_invitations_path(course)) }
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

    describe '#propagate_errors' do
      subject do
        controller.define_singleton_method(:course_user_invitation_params) do
          { invitations_file: Struct.new(:tempfile).new(Tempfile.new('spec')) }
        end
        controller.send(:propagate_errors)
        controller
      end

      context 'when the uploaded file has an error' do
        it 'propagates the errors to the invitation file' do
          replace_with_erroneous_course
          subject
          current_course = controller.current_course
          expect(current_course.errors[:invitations_file]).not_to be_empty
        end
      end
    end
  end
end
