require 'rails_helper'

RSpec.describe SystemAnnouncement, type: :model do
  context 'when title is not present' do
    subject { build(:system_announcement, title: '') }

    it { is_expected.not_to be_valid }
  end
end
