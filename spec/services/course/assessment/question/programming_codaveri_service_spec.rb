# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingCodaveriService do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_programming_question, course: course) }
    let(:question) do
      create(:course_assessment_question_programming, template_file_count: 0, package_type: :zip_upload,
                                                      assessment: assessment, is_codaveri: true)
    end
    let(:package_path) do
      File.join(Rails.root, 'spec/fixtures/course/programming_question_template_codaveri.zip')
    end
    let(:attachment) { create(:attachment_reference, binary: true, file_path: package_path) }
    before do
      Course::Assessment::StubbedProgrammingEvaluationService.class_eval do
        prepend Course::Assessment::StubbedProgrammingEvaluationServiceForCodaveriTest
      end
      Excon.defaults[:mock] = true
      Excon.stub({ method: 'POST' }, Codaveri::CreateProblemApiStubs::CREATE_PROBLEM_SUCCESS)
      Course::Assessment::Question::ProgrammingImportService.import(question, attachment)
    end
    after do
      Course::Assessment::ProgrammingEvaluationService.class_eval do
        prepend Course::Assessment::StubbedProgrammingEvaluationService
      end
      Excon.stubs.clear
    end
    subject { Course::Assessment::Question::ProgrammingCodaveriService.new(question, attachment) }

    describe '.create_or_update_question' do
      subject { Course::Assessment::Question::ProgrammingCodaveriService }

      context 'when the API request is successful' do
        before do
          Excon.stub({ method: 'POST' }, Codaveri::CreateProblemApiStubs::CREATE_PROBLEM_SUCCESS)
        end
        after do
          Excon.stubs.clear
        end
        it 'creates codaveri question' do
          expect(subject).to receive(:new).
            with(question, instance_of(AttachmentReference)).
            and_call_original
          subject.create_or_update_question(question, attachment)
          expect(question.codaveri_id).to eq('6311a0548c57aae93d260927')
          expect(question.codaveri_status).to eq(200)
          expect(question.codaveri_message).to eq('Problem successfully created')
        end
      end

      context 'when the API request fails' do
        before do
          Excon.stub({ method: 'POST' }, Codaveri::CreateProblemApiStubs::CREATE_PROBLEM_FAILURE)
        end
        after do
          Excon.stubs.clear
        end

        it 'raises a CodaveriError' do
          expect { subject.create_or_update_question(question, attachment) }.to raise_error(CodaveriError)
          expect(question.codaveri_id).to eq(nil)
          expect(question.codaveri_status).to eq(500)
          expect(question.codaveri_message).to eq('Problem could not be created')
        end
      end
    end

    describe '#construct_problem_object' do
      it 'constructs API payload correctly' do
        package = Course::Assessment::ProgrammingPackage.new(package_path)
        test_payload_object = subject.send(:construct_problem_object, package)

        actual_payload_object = JSON.parse(
          File.read(File.join(Rails.root,
                              'spec/fixtures/course/codaveri/codaveri_problem_management_test.json')),
          { symbolize_names: true }
        )

        expect(test_payload_object[:languageVersion]).to eq(actual_payload_object[:languageVersion])
        expect(test_payload_object[:courseName]).to eq(course.title)
        expect(test_payload_object[:resources][0][:solutions]).to eq(actual_payload_object[:resources][0][:solutions])

        test_payload_object[:resources][0][:exprTestcases].each_with_index do |test_case, index|
          expect(test_case.except(:index)).to eq(
            actual_payload_object[:resources][0][:exprTestcases][index].except(:index)
          )
        end
      end
    end
  end
end
