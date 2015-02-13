require 'rails_helper'

RSpec.describe Course::Achievement, type: :model do
  it { is_expected.to have_many :requirements }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    context 'when title is not present' do
      subject { build(:course_achievement, title: '') }

      it { is_expected.not_to be_valid }
    end

    describe '.default_scope' do
      before { Course::Achievement.delete_all }

      let!(:achievement_1st) { create(:course_achievement, weight: 1) }
      let!(:achievement_2nd) { create(:course_achievement, weight: 5) }
      let!(:achievement_3rd) { create(:course_achievement, weight: 3) }

      it 'orders by ascending weight' do
        expect(Course::Achievement.all).to eq [achievement_1st, achievement_3rd, achievement_2nd]
      end
    end
  end
end
