# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::MultipleResponseOption do
  it 'belongs to answer' do
    is_expected.to belong_to(:answer).
      class_name(Course::Assessment::Answer::MultipleResponse.name)
  end

  it 'belongs to option' do
    expect(subject).to belong_to(:option).
      class_name(Course::Assessment::Question::MultipleResponseOption.name)
  end
end
