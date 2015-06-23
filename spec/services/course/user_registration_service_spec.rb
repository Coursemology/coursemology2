require 'rails_helper'

RSpec.describe Course::UserRegistrationService, type: :service do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:open_course) }
    let(:invitation) { build(:course_user_invitation, course: course, user: nil) }
    let(:user) { create(:user) }
    let(:registration) { Course::Registration.new(course: course, user: user, code: '') }
    subject { Course::UserRegistrationService.new }

    def self.registration_with_code
      before { invitation.save }
      let(:registration) do
        Course::Registration.new(course: course, user: user, code: invitation.invitation_key)
      end
    end

    describe '#register' do
      context 'when the given registration has a registration code' do
        before { invitation.save! }
        registration_with_code

        it 'succeeds' do
          expect do
            expect(subject.register(registration)).to be_truthy
          end.to change { course.course_users.with_approved_state.reload.count }.by(1)
        end
      end

      context 'when the given registration does not have a registration code' do
        it 'succeeds' do
          expect do
            expect(subject.register(registration)).to be_truthy
          end.to change { course.course_users.with_requested_state.reload.count }.by(1)
        end
      end
    end

    describe '#register_course_user' do
      it 'creates a new CourseUser' do
        expect do
          expect(subject.send(:register_course_user, registration)).to be_truthy
        end.to change { course.course_users.with_requested_state.reload.count }.by(1)
      end
    end

    describe '#claim_registration_code' do
      registration_with_code
      context 'when the code is valid' do
        it 'associates the user' do
          expect(subject.send(:claim_registration_code, registration)).to be_truthy
          expect(invitation.reload.course_user.user).to eq(user)
        end

        it 'increases the number of approved users' do
          expect do
            expect(subject.send(:claim_registration_code, registration)).to be_truthy
          end.to change { course.course_users.with_approved_state.reload.count }.by(1)
        end
      end
    end

    describe '#accept_invitation' do
      it 'accepts the given invitation' do
        invitation.save!
        expect(subject.send(:accept_invitation, registration, invitation)).to be_truthy
        expect(registration.course_user).to eq(invitation.course_user)
        expect(registration.course_user).to be_approved
      end
    end
  end
end
