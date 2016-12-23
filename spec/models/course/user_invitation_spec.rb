# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::UserInvitation, type: :model do
  describe '#generate_invitation_key' do
    it 'starts with "I"' do
      expect(subject.invitation_key).to start_with('I')
    end
  end
end
