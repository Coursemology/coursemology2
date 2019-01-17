# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UserRegistrationService, type: :service do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course, :enrollable) }
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
          end.to change { course.course_users.reload.count }.by(1)
        end
      end

      context 'when the given registration has a course registration code' do
        registration_with_registration_code

        it 'succeeds' do
          expect do
            expect(subject.register(registration)).to be_truthy
          end.to change { course.course_users.reload.count }.by(1)
        end
      end

      context 'when the given registration does not have a registration code' do
        it 'fails' do
          expect(subject.register(registration)).to eq(false)
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
          end.to change { course.course_users.reload.count }.by(1)
        end
      end

      context 'when the wrong code is given' do
        it 'does not register the user' do
          registration.code += 'A'
          expect do
            expect(subject.send(:claim_course_registration_code, registration)).to be_falsey
          end.to change { course.course_users.reload.count }.by(0)
        end
      end
    end

    describe '#claim_course_invitation_code' do
      registration_with_invitation_code
      context 'when the code is valid' do
        it 'increases the number of course users' do
          expect do
            expect(subject.send(:claim_registration_code, registration)).to be_truthy
          end.to change { course.course_users.reload.count }.by(1)
        end

        context 'when role is not specified' do
          it 'associates the user as student' do
            expect(subject.send(:claim_registration_code, registration)).to be_truthy
            expect(course.course_users.find_by(user_id: user.id)).to be_present
            expect(course.course_users.find_by(user_id: user.id).role).to eq('student')
          end
        end

        context 'when a role is specified' do
          let!(:invitation_with_role) do
            create(:course_user_invitation, course: course, role: :teaching_assistant)
          end
          let(:registration_with_role) do
            Course::Registration.new(course: course, user: user, code: invitation_with_role.invitation_key.dup)
          end
          it 'associates the user with the specified role' do
            expect(subject.send(:claim_registration_code, registration_with_role)).to be_truthy
            expect(course.course_users.find_by(user_id: user.id).role).to eq('teaching_assistant')
          end
        end

        context 'when the phantom option is not specified' do
          let!(:invitation) { create(:course_user_invitation, course: course) }
          let(:registration) do
            Course::Registration.new(course: course, user: user, code: invitation.invitation_key.dup)
          end

          it 'sets phantom to false' do
            expect(subject.send(:claim_registration_code, registration)).to be_truthy
            expect(course.course_users.find_by(user_id: user.id).phantom).to be_falsey
          end
        end

        context 'when the phantom option is specified as true' do
          let!(:invitation) { create(:course_user_invitation, :phantom, course: course) }
          let(:registration) do
            Course::Registration.new(course: course, user: user, code: invitation.invitation_key.dup)
          end

          it 'sets phantom to true' do
            expect(subject.send(:claim_registration_code, registration)).to be_truthy
            expect(course.course_users.find_by(user_id: user.id).phantom).to be_truthy
          end
        end
      end

      context 'when the code is invalid' do
        it 'does not change the number of course users' do
          registration.code += 'A'
          expect do
            expect(subject.send(:claim_registration_code, registration)).to be_falsey
          end.to change { course.course_users.reload.count }.by(0)
        end
      end
    end

    describe '#accept_invitation' do
      registration_with_invitation_code
      it 'accepts the given invitation' do
        invitation.save!
        expect(subject.send(:accept_invitation, registration, invitation)).to be_truthy
        expect(registration.course_user).to be_present
      end
    end
  end
end
