require 'rails_helper'

RSpec.describe Course::Assessment::Answer::Programming do
  it { is_expected.to act_as(:answer) }
  it 'has many files' do
    expect(subject).to have_many(:files).
      class_name(Course::Assessment::Answer::ProgrammingFile.name)
  end
end
