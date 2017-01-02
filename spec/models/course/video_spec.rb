# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Video, type: :model do
  it { is_expected.to act_as(Course::LessonPlan::Item) }
  it { is_expected.to have_many(:submissions).inverse_of(:video).dependent(:destroy) }
end
