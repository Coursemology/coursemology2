require 'rails_helper'

RSpec.describe Course::LessonPlan::Item do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    subject { Ability.new(user) }
    let(:course) { create(:course) }
    let(:lesson_plan_item) { create(:course_lesson_plan_item, course: course) }

    context 'when the user is a Course Staff' do
      let(:user) { create(:course_manager, :approved, course: course).user }

      it { is_expected.to be_able_to(:manage, lesson_plan_item) }

      it 'sees all lesson plan items' do
        expect(course.lesson_plan_items.accessible_by(subject)).
          to contain_exactly(lesson_plan_item)
      end
    end
  end
end
