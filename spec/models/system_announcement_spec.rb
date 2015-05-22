require 'rails_helper'

RSpec.describe SystemAnnouncement, type: :model do
  context 'when title is not present' do
    subject { build(:system_announcement, title: '') }

    it { is_expected.not_to be_valid }
  end

  describe '.default_scope' do
    before { create_list(:system_announcement, 3) }

    it 'orders by descending valid_from' do
      dates = SystemAnnouncement.all.map(&:valid_from)
      sorted_dates = dates.sort { |a, b| b <=> a }
      expect(dates).to eq(sorted_dates)
    end
  end
end
