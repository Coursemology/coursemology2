require 'rails_helper'

RSpec.describe Course::Achievement, type: :model do
  it { is_expected.to have_many :conditions }
  it { is_expected.to validate_presence_of :title }
  it { is_expected.to belong_to(:creator).class_name User.name }
  it { is_expected.to belong_to(:course).inverse_of :achievements }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
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
