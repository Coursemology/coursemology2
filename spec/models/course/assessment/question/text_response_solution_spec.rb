require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponseSolution, type: :model do
  it 'belongs to question' do
    expect(subject).to belong_to(:question).
      class_name(Course::Assessment::Question::TextResponse.name)
  end
end
