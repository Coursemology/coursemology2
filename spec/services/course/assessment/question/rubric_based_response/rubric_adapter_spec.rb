# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Rubric::LlmService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:assessment) { create(:assessment, :published_with_rubric_question) }
    let(:question) { assessment.questions.first.specific }
    let(:categories) { question.categories.without_bonus_category.includes(:criterions) }

    subject { Course::Assessment::Question::RubricBasedResponse::RubricAdapter.new(question) }

    describe '#format_rubric_categories' do
      it 'formats categories and criteria correctly' do
        result = subject.formatted_rubric_categories
        categories.each do |cat|
          max_grade = cat.criterions.maximum(:grade) || 0
          expect(result).to include("<CATEGORY id=\"#{cat.id}\" name=\"#{cat.name}\" max_grade=\"#{max_grade}\">")
          cat.criterions.each do |crit|
            expect(result).to include("<BAND id=\"#{crit.id}\" grade=\"#{crit.grade}\">#{crit.explanation}</BAND>")
          end
        end
      end
    end
  end
end
