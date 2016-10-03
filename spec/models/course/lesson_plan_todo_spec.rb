# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::Todo, type: :model do
  it { is_expected.to belong_to(:item).inverse_of(:todos) }
  it { is_expected.to belong_to(:user).inverse_of(:todos) }
end
