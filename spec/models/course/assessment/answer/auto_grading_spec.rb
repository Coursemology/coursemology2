require 'rails_helper'

RSpec.describe Course::Assessment::Answer::AutoGrading do
  it { is_expected.to belong_to(:answer) }
end
