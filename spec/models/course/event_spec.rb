# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::LessonPlan::Event, type: :model do
  it { is_expected.to define_enum_for(:event_type) }
end
