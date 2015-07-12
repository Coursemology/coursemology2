require 'rails_helper'

RSpec.describe System::Announcement, type: :model do
  it { is_expected.to belong_to(:instance).inverse_of(:announcements) }
  it { is_expected.to validate_presence_of(:title) }

  describe '.default_scope' do
    before { create_list(:system_announcement, 3) }

    it 'orders by descending valid_from' do
      dates = System::Announcement.all.map(&:valid_from)
      expect(dates.each_cons(2).all? { |x, y| x >= y }).to be_truthy
    end
  end
end
