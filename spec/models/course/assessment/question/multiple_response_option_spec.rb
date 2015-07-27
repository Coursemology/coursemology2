require 'rails_helper'

RSpec.describe Course::Assessment::Question::MultipleResponseOption do
  it 'belongs to question' do
    expect(subject).to belong_to(:question).
      class_name(Course::Assessment::Question::MultipleResponse.name)
  end
end
