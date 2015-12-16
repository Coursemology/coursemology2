require 'rails_helper'

RSpec.describe User::Email do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:email) { create(:user_email) }
    let(:user) { email.user }
    let(:email_of_other_user) { create(:user_email) }

    subject { Ability.new(user) }

    it { is_expected.to be_able_to(:manage, email) }
    it { is_expected.not_to be_able_to(:show, email_of_other_user) }
  end
end
