# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::TextResponse, type: :model do
  it { is_expected.to act_as(Course::Assessment::Question) }

  it 'has many solutions' do
    expect(subject).to have_many(:solutions).
      class_name(Course::Assessment::Question::TextResponseSolution.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:solutions) }

  it 'has many groups' do
    expect(subject).to have_many(:groups).
      class_name(Course::Assessment::Question::TextResponseComprehensionGroup.name).
      dependent(:destroy)
  end
  it { is_expected.to accept_nested_attributes_for(:groups) }

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    describe '#auto_gradable?' do
      context 'text response question' do
        subject { create(:course_assessment_question_text_response) }
        it 'returns true' do
          expect(subject.auto_gradable?).to be(true)
          expect(subject.csv_downloadable?).to be(true)
        end
      end

      context 'comprehension question' do
        subject { create(:course_assessment_question_text_response, :comprehension_question) }
        it 'returns true' do
          expect(subject.auto_gradable?).to be(true)
        end
      end
    end

    describe '#attempt' do
      let(:course) { create(:course) }
      let(:student_user) { create(:course_student, course: course).user }
      let(:assessment) { create(:assessment, course: course) }
      let(:question) { create(:course_assessment_question_text_response, assessment: assessment) }
      let(:submission) { create(:submission, assessment: assessment, creator: student_user) }
      subject { question }

      it 'returns an Answer' do
        expect(subject.attempt(submission)).to be_a(Course::Assessment::Answer)
      end

      context 'when last_attempt is given' do
        let(:last_attempt) { build(:course_assessment_answer_text_response) }

        it 'builds a new answer with old answer_text' do
          answer = subject.attempt(submission, last_attempt).actable
          answer.save!

          expect(last_attempt.answer_text).to eq(answer.answer_text)
        end
      end
    end

    describe '#file_upload_question?' do
      subject { question.file_upload_question? }

      context 'when hide_text is enabled' do
        let(:question) { build(:course_assessment_question_text_response, :file_upload_question) }
        it { is_expected.to eq(true) }
      end

      context 'when hide_text is disabled' do
        let(:question) { build(:course_assessment_question_text_response) }
        it { is_expected.to eq(false) }
      end
    end

    describe 'validations' do
      context 'text response question' do
        subject { create(:course_assessment_question_text_response, maximum_grade: 10) }

        it 'validates that solution grade does not exceed maximum grade ' do
          subject.solutions.first.grade = 20

          expect(subject.valid?).to be(false)
          expect(subject.errors[:maximum_grade]).to include(
            I18n.t('activerecord.errors.models.course/assessment/question/text_response.attributes.' \
                   'maximum_grade.invalid_grade')
          )
        end
      end
    end

    describe '#initialize_duplicate' do
      let(:course) { create(:course) }
      let(:assessment) { create(:assessment, course: course) }
      let(:duplicator) { Duplicator.new([]) }

      context 'when duplicating a question with keyword solutions' do
        let!(:source) { create(:course_assessment_question_text_response, assessment: assessment) }

        subject(:duplicate) do
          dup = described_class.new
          dup.initialize_duplicate(duplicator, source)
          dup
        end

        it 'copies scalar attributes' do
          expect(duplicate.title).to eq(source.title)
          expect(duplicate.maximum_grade).to eq(source.maximum_grade)
        end

        it 'sets up new solution records' do
          expect(duplicate.solutions.size).to eq(source.solutions.size)
          expect(duplicate.solutions).to all(be_new_record)
        end

        it 'sets each solution question to the duplicate, not the original' do
          duplicate.solutions.each do |sol|
            expect(sol.question).to equal(duplicate)
          end
        end

        it 'preserves solution values' do
          source.solutions.each do |orig|
            dup_sol = duplicate.solutions.find { |s| s.solution_type == orig.solution_type }
            expect(dup_sol.solution).to eq(orig.solution)
            expect(dup_sol.grade).to eq(orig.grade)
            expect(dup_sol.explanation).to eq(orig.explanation)
          end
        end
      end

      context 'when duplicating a question with a spreadsheet_formula solution' do
        let(:timestamp) { Time.zone.parse('2024-01-15T10:30:00Z') }

        let!(:source) do
          q = create(:course_assessment_question_text_response, :exact_match_solution, assessment: assessment)
          solution = q.solutions.create!(solution_type: :spreadsheet_formula,
                                         solution: '=SUM(A1:A5)', grade: 2, explanation: 'great')
          spreadsheet = solution.build_test_spreadsheet(
            is_randomization_enabled: false,
            is_random_seed_fixed: true,
            test_random_seed: 42,
            is_timestamp_fixed: true,
            test_timestamp: timestamp,
            num_random_tests: 3,
            variables: []
          )
          spreadsheet.attachment_reference = create(:attachment_reference)
          solution.save!
          q
        end

        subject(:duplicate) do
          dup = described_class.new
          dup.initialize_duplicate(duplicator, source)
          dup
        end

        let(:source_solution) { source.solutions.spreadsheet_formula.first }
        let(:duplicate_solution) { duplicate.solutions.find(&:spreadsheet_formula?) }

        it 'sets up a new spreadsheet_formula solution' do
          expect(duplicate_solution).to be_new_record
          expect(duplicate_solution.solution).to eq(source_solution.solution)
          expect(duplicate_solution.grade).to eq(source_solution.grade)
          expect(duplicate_solution.explanation).to eq(source_solution.explanation)
        end

        it 'sets up a new test_spreadsheet with matching scalar values' do
          dup_ss = duplicate_solution.test_spreadsheet
          orig_ss = source_solution.test_spreadsheet

          expect(dup_ss).to be_present
          expect(dup_ss).to be_new_record
          expect(dup_ss.is_random_seed_fixed).to eq(orig_ss.is_random_seed_fixed)
          expect(dup_ss.test_random_seed).to eq(orig_ss.test_random_seed)
          expect(dup_ss.is_timestamp_fixed).to eq(orig_ss.is_timestamp_fixed)
          expect(dup_ss.test_timestamp).to be_within(1.second).of(orig_ss.test_timestamp)
          expect(dup_ss.num_random_tests).to eq(orig_ss.num_random_tests)
          expect(dup_ss.variables).to eq(orig_ss.variables)
        end

        it 'sets up a new attachment reference for the test_spreadsheet' do
          dup_ar = duplicate_solution.test_spreadsheet.attachment_reference
          orig_ar = source_solution.test_spreadsheet.attachment_reference

          expect(dup_ar).to be_present
          expect(dup_ar).not_to equal(orig_ar)
        end

        it 'does not set a test_spreadsheet on non-spreadsheet_formula solutions' do
          duplicate.solutions.reject(&:spreadsheet_formula?).each do |sol|
            expect(sol.test_spreadsheet).to be_nil
          end
        end
      end
    end

    describe '#question_type' do
      let(:file_upload_question) { build(:course_assessment_question_text_response, :file_upload_question) }
      let(:text_response_question) { build(:course_assessment_question_text_response) }

      context 'when question type is file upload' do
        subject { file_upload_question.question_type_readable }

        it 'returns correct question type' do
          is_expected.to eq(
            I18n.t('activerecord.attributes.models.course/assessment/question/text_response.file_upload')
          )
        end
      end

      context 'when question type is text response' do
        subject { text_response_question.question_type_readable }

        it 'returns correct question type' do
          is_expected.to eq(
            I18n.t('activerecord.attributes.models.course/assessment/question/text_response.text_response')
          )
        end
      end
    end
  end
end
