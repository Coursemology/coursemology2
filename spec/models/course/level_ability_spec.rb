require 'rails_helper'

RSpec.describe Course::Level do
  let(:instance) { create(:instance) }

  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let!(:level) { create(:course_level, course: course) }

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      it { is_expected.to be_able_to(:manage, level) }

      it 'sees all levels' do
        expect(course.levels.accessible_by(subject)).to contain_exactly(level)
      end
    end
  end
end
