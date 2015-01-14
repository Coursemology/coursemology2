require 'rails_helper'

RSpec.describe Instance::Announcement, type: :model do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    context 'when title is not present' do
      subject { build(:instance_announcement, title: '') }

      it { is_expected.not_to be_valid }
    end
  end
end
