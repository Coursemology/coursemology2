require 'rails_helper'

RSpec.describe Course::Assessment::Answer::MultipleResponse do
  it { is_expected.to act_as(Course::Assessment::Answer) }
  it 'has many answer_options' do
    expect(subject).to have_many(:answer_options).
      class_name(Course::Assessment::Answer::MultipleResponseOption.name).
      dependent(:destroy)
  end
  it 'has many options' do
    expect(subject).to have_many(:options).
      class_name(Course::Assessment::Question::MultipleResponseOption.name)
  end
end
