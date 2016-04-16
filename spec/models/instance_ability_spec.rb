# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Instance do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject { Ability.new(user) }

    context 'when the user is an Administrator' do
      let(:user) { create(:administrator) }

      it { is_expected.to be_able_to(:show, instance) }
      it { is_expected.not_to be_able_to(:edit, instance) }
      it { is_expected.not_to be_able_to(:update, instance) }
      it { is_expected.not_to be_able_to(:delete, instance) }
    end
  end
end
