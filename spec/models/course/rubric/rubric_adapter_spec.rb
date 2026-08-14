# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Rubric::RubricAdapter do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:rubric) { create(:course_rubric, course: course, grading_prompt: 'Question guidance') }

    subject(:grading_prompt) { described_class.new(rubric).grading_prompt }

    context 'when the course-wide grading prompt is disabled' do
      before { course.update!(rubric_grading_prompt: 'Course-wide guidance', rubric_grading_prompt_enabled: false) }

      it 'returns just the question grading prompt' do
        expect(grading_prompt).to eq('Question guidance')
      end
    end

    context 'when the course-wide grading prompt is enabled' do
      before { course.update!(rubric_grading_prompt: 'Course-wide guidance', rubric_grading_prompt_enabled: true) }

      it 'prepends the course prompt before the question prompt' do
        expect(grading_prompt).to eq("Course-wide guidance\n\nQuestion guidance")
      end

      context 'and the question grading prompt is blank' do
        let(:rubric) { create(:course_rubric, course: course, grading_prompt: '') }

        it 'returns just the course prompt, without a dangling separator' do
          expect(grading_prompt).to eq('Course-wide guidance')
        end
      end

      context 'but the course prompt itself is blank' do
        before { course.update!(rubric_grading_prompt: '') }

        it 'returns just the question grading prompt' do
          expect(grading_prompt).to eq('Question guidance')
        end
      end
    end
  end
end
