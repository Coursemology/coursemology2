# frozen_string_literal: true
module Course::Assessment::Submission::Koditsu::TestCasesConcern
  extend ActiveSupport::Concern

  def test_cases_order_for(questions)
    questions.to_h do |question|
      test_cases = question.actable.test_cases
      [question.id, sort_for_koditsu(test_cases)]
    end
  end

  private

  def order_test_cases_type
    {
      'public' => 0,
      'private' => 1,
      'evaluation' => 2
    }
  end

  def sort_for_koditsu(test_cases)
    return [] if test_cases.empty?

    mapped_test_cases = test_cases.map do |tc|
      [tc.id, tc.identifier.split('/').last]
    end

    sorted_test_cases = mapped_test_cases.sort_by do |_, identifier|
      parts = identifier.split('_')

      [order_test_cases_type[parts[1]], parts[2].to_i]
    end

    sorted_test_cases.map { |id, _| id }.each_with_index.to_h { |id, index| [index + 1, id] }
  end
end
