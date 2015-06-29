require 'rails_helper'

RSpec.describe Course::UserInvitation, type: :model do
  it { is_expected.to belong_to(:course_user) }
  it { is_expected.to belong_to(:user_email).validate(true) }

  describe '#generate_invitation_key' do
    it 'starts with "I"' do
      expect(subject.invitation_key).to start_with('I')
    end
  end
end
