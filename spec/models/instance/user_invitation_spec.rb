require 'rails_helper'

RSpec.describe Instance::UserInvitation, type: :model do
  describe '#generate_invitation_key' do
    it 'starts with "J"' do
      expect(subject.invitation_key).to start_with('J')
    end
  end

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe 'validations' do
      context 'when there is a previous invitation with the same email' do
        let(:email) { generate(:email) }
        let!(:previous_invitation) do
          create(:instance_user_invitation, *invitation_traits, instance: instance, email: email)
        end
        subject { build(:instance_user_invitation, instance: instance, email: email) }

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