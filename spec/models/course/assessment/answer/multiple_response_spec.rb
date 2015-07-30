require 'rails_helper'

RSpec.describe Course::Assessment::Answer::MultipleResponse do
  it { is_expected.to act_as(:answer) }
  it 'has many options' do
    expect(subject).to have_many(:options).
      class_name(Course::Assessment::Answer::MultipleResponseOption.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:options) }
end
