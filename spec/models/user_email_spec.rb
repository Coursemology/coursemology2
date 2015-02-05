require 'rails_helper'

RSpec.describe UserEmail, type: :model do
  it { should belong_to(:user).inverse_of(:emails) }

  let(:email) { build(:user_email) }
  it 'rejects invalid email addresses' do
    email.email = 'wrong'
    expect(email.valid?).to eq(false)
  end
end
