require 'rails_helper'

RSpec.describe Course::LessonPlan::Milestone, type: :model do
  it { is_expected.to belong_to(:course).inverse_of(:lesson_plan_milestones) }
end
