require 'rails_helper'

RSpec.describe Course::Achievement, type: :model do
  it { is_expected.to have_many(:course_user_achievements).inverse_of(:achievement) }
  it { is_expected.to have_many(:course_users) }
  it { is_expected.to have_many :conditions }
  it { is_expected.to validate_presence_of :title }
  it { is_expected.to belong_to(:course).inverse_of :achievements }

  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '.default_scope' do
      let(:course) { create(:course) }
      let!(:achievements) { create_list(:course_achievement, 2, course: course) }
      it 'orders by ascending weight' do
        weights = course.achievements.pluck(:weight)
        expect(weights.length).to be > 1
        expect(weights.each_cons(2).all? { |a, b| a <= b }).to be_truthy
      end
    end
  end
end
