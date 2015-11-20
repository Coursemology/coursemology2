require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingTestCase do
  it 'belongs to a question' do
    expect(subject).to belong_to(:question).
      class_name(Course::Assessment::Question::Programming.name)
  end
end
