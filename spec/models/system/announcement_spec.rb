# frozen_string_literal: true
require 'rails_helper'

RSpec.describe System::Announcement, type: :model do
  it { is_expected.to validate_absence_of(:instance) }
  it { is_expected.to validate_presence_of(:title) }

  describe '.default_scope' do
    before { create_list(:system_announcement, 3) }

    it 'orders by descending start_at' do
      dates = System::Announcement.pluck(:start_at)
      expect(dates.length).to be > 1
      expect(dates.each_cons(2).all? { |x, y| x >= y }).to be_truthy
    end
  end
end
