require 'rails_helper'

RSpec.describe Course::Assessment::Answer::ProgrammingFile do
  it { is_expected.to belong_to(:answer).class_name(Course::Assessment::Answer::Programming.name) }
end
