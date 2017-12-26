# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Answer::TextResponseAutoGradingService do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:answer) do
      arguments = *answer_traits
      options = arguments.extract_options!
      options[:question_traits] = question_traits
      options[:submission_traits] = submission_traits
      create(:course_assessment_answer_text_response, :submitted, *arguments, options).answer
    end
    let(:question) { answer.question.actable }
    let(:question_traits) { nil }
    let(:submission_traits) { [{ auto_grade: false }] }
    let(:answer_traits) { nil }
    let!(:grading) do
      create(:course_assessment_answer_auto_grading, answer: answer)
    end

    describe '#grade' do
      before { allow(answer.submission.assessment).to receive(:autograded?).and_return(true) }

      context 'when an exact match is present' do
        let(:answer_traits) { :exact_match }

        it 'matches the entire answer' do
          subject.grade(answer)
          expect(answer).to be_correct
          expect(answer.grade).to eq(question.solutions.exact_match.first.grade)
          expect(grading.result['messages']).to \
            contain_exactly(question.solutions.exact_match.first.explanation)
        end
      end

      context 'when the solution contains Windows newlines' do
        let(:question_traits) { :multiline_windows }
        let(:answer_traits) { :multiline_linux }

        it 'treats different answer and question newlines as equivalent' do
          subject.grade(answer)
          expect(answer).to be_correct
          expect(answer.grade).to eq(question.solutions.exact_match.first.grade)
          expect(grading.result['messages']).to \
            contain_exactly(question.solutions.exact_match.first.explanation)
        end
      end

      context 'when the solution contains Linux newlines' do
        let(:question_traits) { :multiline_linux }
        let(:answer_traits) { :multiline_windows }

        it 'treats different answer and question newlines as equivalent' do
          subject.grade(answer)
          expect(answer).to be_correct
          expect(answer.grade).to eq(question.solutions.exact_match.first.grade)
          expect(grading.result['messages']).to \
            contain_exactly(question.solutions.exact_match.first.explanation)
        end
      end

      context 'when one keyword is present' do
        let(:answer_traits) { :keyword }

        it 'matches the keyword' do
          subject.grade(answer)
          expect(answer).not_to be_correct
          expect(answer.grade).to eq(question.solutions.keyword.first.grade)
          expect(grading.result['messages']).to \
            contain_exactly(question.solutions.keyword.first.explanation)
        end
      end

      context 'when multiple keywords are present' do
        let(:question_traits) { :multiple_keywords }

        it 'matches all keywords' do
          answer.actable.answer_text = 'keywordA keywordB'
          expected_grade = [question.solutions.keyword.map(&:grade).reduce(0, :+),
                            question.maximum_grade].min

          subject.grade(answer)
          expect(answer).to be_correct
          expect(answer.grade).to eq(expected_grade)
          expect(grading.result['messages']).to \
            match_array(question.solutions.keyword.map(&:explanation))
        end
      end

      context 'when no match is found' do
        let(:answer_traits) { :no_match }

        it 'matches nothing' do
          subject.grade(answer)
          expect(answer.grade).to eq(0)
          expect(grading.result['messages']).to be_empty
        end
      end
    end
  end
end
