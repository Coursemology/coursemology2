# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UserInvitation, type: :model do
  describe '#generate_invitation_key' do
    it 'starts with "I"' do
      expect(subject.invitation_key).to start_with('I')
    end
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }

    describe 'validations' do
      describe 'external_id uniqueness' do
        let(:other_course) { create(:course) }

        it 'allows multiple pending invitations with nil external_id in the same course' do
          create(:course_user_invitation, course: course, external_id: nil)
          invitation = build(:course_user_invitation, course: course, external_id: nil)
          expect(invitation).to be_valid
        end

        context 'when another pending invitation in the same course has the same external_id' do
          let!(:existing) { create(:course_user_invitation, course: course, external_id: 'dup-id') }

          it 'is invalid' do
            invitation = build(:course_user_invitation, course: course, external_id: 'dup-id')
            expect(invitation).not_to be_valid
            expect(invitation.errors[:external_id]).
              to include(I18n.t('activerecord.errors.models.course/user_invitation.attributes.external_id.taken'))
          end
        end

        context 'when a pending invitation in a different course has the same external_id' do
          let!(:existing) { create(:course_user_invitation, course: other_course, external_id: 'some-id') }

          it 'is valid' do
            invitation = build(:course_user_invitation, course: course, external_id: 'some-id')
            expect(invitation).to be_valid
          end
        end

        context 'when a course user in the same course has the same external_id' do
          let!(:existing_user) { create(:course_student, course: course, external_id: 'used-id') }

          it 'is invalid' do
            invitation = build(:course_user_invitation, course: course, external_id: 'used-id')
            expect(invitation).not_to be_valid
          end
        end

        context 'when only a confirmed invitation in the same course has the same external_id' do
          let!(:confirmed) { create(:course_user_invitation, :confirmed, course: course, external_id: 'past-id') }

          # The uniqueness check (UniqueExternalIdConcern) only queries unconfirmed invitations.
          # A confirmed invitation means the user has already joined the course, so their external_id
          # is now on the CourseUser record. The invitation row is no longer an active claim on the id.
          it 'is valid' do
            invitation = build(:course_user_invitation, course: course, external_id: 'past-id')
            expect(invitation).to be_valid
          end
        end
      end

      context 'when there is a previous invitation with the same email' do
        let(:email) { generate(:email) }
        let!(:previous_invitation) do
          create(:course_user_invitation, *invitation_traits, course: course, email: email)
        end
        subject { build(:course_user_invitation, course: course, email: email) }

        context 'if the previous invitation has been confirmed' do
          let(:invitation_traits) { [:confirmed] }

          it { is_expected.to be_valid }
        end

        context 'if the previous invitation has not been confirmed' do
          let(:invitation_traits) { [] }

          it { is_expected.not_to be_valid }
        end
      end
    end
  end
end
