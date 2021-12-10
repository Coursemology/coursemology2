# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Instance::UserRoleRequest, type: :model do
  it 'belongs to an instance' do
    expect(subject).to belong_to(:instance).
      inverse_of(:user_role_requests).
      without_validating_presence
  end
  it 'belongs to a user' do
    expect(subject).to belong_to(:user).
      without_validating_presence
  end
end
