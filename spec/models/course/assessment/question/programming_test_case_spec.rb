# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingTestCase do
  it 'belongs to a question' do
    expect(subject).to belong_to(:question).
      class_name(Course::Assessment::Question::Programming.name)
  end
  it { is_expected.to have_many(:test_results).dependent(:destroy).with_foreign_key(:test_case_id) }
end
