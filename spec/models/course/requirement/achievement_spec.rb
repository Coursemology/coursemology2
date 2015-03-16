require 'rails_helper'

RSpec.describe Course::Requirement::Achievement, type: :model do
  it { is_expected.to act_as(:requirement).class_name('Course::Requirement') }
  it { is_expected.to belong_to(:achievement) }
end
