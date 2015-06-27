require 'rails_helper'

RSpec.describe Course::UserRegistrationService, type: :service do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:open_course) }
    let(:user) { create(:user) }
    let(:registration) { Course::Registration.new(course: course, user: user, code: '') }
    subject { Course::UserRegistrationService.new }

    def self.registration_with_invitation_code
      let!(:invitation) { create(:course_user_invitation, course: course) }
      let(:registration) do
        Course::Registration.new(course: course, user: user, code: invitation.invitation_key.dup)
      end
    end

    def self.registration_with_registration_code
      let(:registration) do
        course.generate_registration_key
        course.save!
        Course::Registration.new(course: course, user: user, code: course.registration_key.dup)
      end
    end

    describe '#register' do
      context 'when the given registration has an invitation code' do
        registration_with_invitation_code

        it 'succeeds' do
          expect do
            expect(subject.register(registration)).to be_truthy
          end.to change { course.course_users.with_approved_state.reload.count }.by(1).and \
            change { course.course_users.with_invited_state.reload.count }.by(-1)
        end
      end

      context 'when the given registration has a course registration code' do
        registration_with_registration_code

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

        it 'emails the course staff' do
          expect do
            expect(subject.register(registration)).to be_truthy
          end.to change { ActionMailer::Base.deliveries.count }.by(1)
        end
      end
    end

    describe '#register_course_user' do
      it 'creates a new CourseUser' do
        expect do
          expect(subject.send(:register_course_user, registration)).to be_truthy
        end.to change { course.course_users.with_requested_state.reload.count }.by(1)
      end

      context 'when the user provided is already part of the course' do
        let!(:course_user) { create(:course_user, course: course, user: user) }
        it 'does not create another user' do
          expect do
            subject.send(:register_course_user, registration)
          end.to change { course.course_users.with_requested_state.reload.count }.by(0)
        end
      end
    end

    describe '#claim_registration_code' do
      context 'when an invalid code is given' do
        it 'returns false' do
          registration.code = ''
          expect(subject.send(:claim_registration_code, registration)).to be_falsey
          registration.code = '*'
          expect(subject.send(:claim_registration_code, registration)).to be_falsey
        end
      end
    end

    describe '#claim_course_registration_code' do
      registration_with_registration_code
      context 'when the correct code is given' do
        it 'registers the user' do
          expect do
            expect(subject.send(:claim_course_registration_code, registration)).to be_truthy
          end.to change { course.course_users.with_approved_state.reload.count }.by(1)
        end
      end

      context 'when the wrong code is given' do
        it 'does not register the user' do
          registration.code += 'A'
          expect do
            expect(subject.send(:claim_course_registration_code, registration)).to be_falsey
          end.to change { course.course_users.with_approved_state.reload.count }.by(0)
        end
      end
    end

    describe '#claim_course_invitation_code' do
      registration_with_invitation_code
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

      context 'when the code is invalid' do
        it 'does not change the number of approved users' do
          registration.code += 'A'
          expect do
            expect(subject.send(:claim_registration_code, registration)).to be_falsey
          end.to change { course.course_users.with_approved_state.reload.count }.by(0)
        end
      end
    end

    describe '#accept_invitation' do
      registration_with_invitation_code
      it 'accepts the given invitation' do
        invitation.save!
        expect(subject.send(:accept_invitation, registration, invitation)).to be_truthy
        expect(registration.course_user).to eq(invitation.course_user)
        expect(registration.course_user).to be_approved
      end
    end
  end
end
