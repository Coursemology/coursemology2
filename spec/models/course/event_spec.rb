require 'rails_helper'

RSpec.describe Course::Event, type: :model do
  it { is_expected.to define_enum_for(:event_type) }
end
