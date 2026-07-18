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
        let(:question_traits) { :exact_match_solution }
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

      context 'when both an exact match and a keyword apply' do
        let(:question_traits) { :exact_match_with_keyword }

        it 'returns only the exact match result' do
          answer.actable.answer_text = 'hello keyword world'
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

      context 'when a regex solution is present' do
        let(:question_traits) { :regex_solution }

        context 'when the answer matches the regex' do
          it 'grades the answer' do
            answer.actable.answer_text = 'hello123'
            subject.grade(answer)
            expect(answer).not_to be_correct
            expect(answer.grade).to eq(question.solutions.regex.first.grade)
            expect(grading.result['messages']).to \
              contain_exactly(question.solutions.regex.first.explanation)
          end
        end

        context 'when the answer does not match the regex' do
          it 'matches nothing' do
            subject.grade(answer)
            expect(answer.grade).to eq(0)
            expect(grading.result['messages']).to be_empty
          end
        end
      end
    end

    describe '#save_container_test_metadata' do
      let(:target_sheet_name) { 'Sheet2' }
      let(:test_spreadsheet) do
        Course::Assessment::Question::TextResponseSolutionSpreadsheet.new(target_sheet_name: target_sheet_name)
      end
      let(:spreadsheet_solution) do
        build(:course_assessment_question_text_response_solution,
              solution_type: :spreadsheet_formula, solution: '=A1').tap do |solution|
          solution.test_spreadsheet = test_spreadsheet
        end
      end

      it 'includes the target sheet name in the container test metadata' do
        captured = nil
        container = instance_double(CoursemologyDockerContainer)
        allow(container).to receive(:store_file) { |_path, data| captured = data }

        subject.send(:save_container_test_metadata, container, '=A1', [spreadsheet_solution])

        metadata = JSON.parse(captured)
        expect(metadata['solutions'].first['spreadsheet']['target_sheet_name']).to eq(target_sheet_name)
      end
    end
  end
end
