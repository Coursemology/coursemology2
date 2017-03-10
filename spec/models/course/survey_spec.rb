# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey, type: :model do
  it { is_expected.to act_as(Course::LessonPlan::Item) }
  it { is_expected.to have_many(:questions).through(:sections) }
  it { is_expected.to have_many(:responses).inverse_of(:survey).dependent(:destroy) }
  it { is_expected.to have_many(:sections).inverse_of(:survey).dependent(:destroy) }
end
