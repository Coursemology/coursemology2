# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingCodaveriService do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:assessment) { create(:assessment, :with_programming_question, course: course) }
    let(:question) do
      create(:course_assessment_question_programming, template_file_count: 0, package_type: :zip_upload,
                                                      assessment: assessment, is_codaveri: false,
                                                      is_synced_with_codaveri: false)
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

    describe '.create_question' do
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
        expect(test_payload_object[:additionalFiles]).to eq(actual_payload_object[:additionalFiles])
        expect(test_payload_object[:resources][0][:templates]).to eq(actual_payload_object[:resources][0][:templates])
        expect(test_payload_object[:resources][0][:solutions]).to eq(actual_payload_object[:resources][0][:solutions])
        expect(test_payload_object[:resources][0]).not_to have_key(:evaluator)

        test_payload_object[:resources][0][:exprTestcases].each_with_index do |test_case, index|
          expect(test_case.except(:index)).to eq(
            actual_payload_object[:resources][0][:exprTestcases][index].except(:index)
          )
        end
      end

      context 'when the question takes the student code as files' do
        include ProgrammingPackageServiceHelpers

        let(:package) do
          test_case = { expression: 'x()', expected: '1', hint: '' }
          params = package_params(
            submit_as_file: 'true',
            submission_files: [uploaded_file('a.py', "import b\n"), uploaded_file('b.py', 'X = None')],
            solution_files: solution_files,
            data_files: [uploaded_file('data.txt', 'some data')],
            prepend: 'import a',
            append: "def x():\n    return a.b.X",
            test_cases: { public: [test_case] }
          )
          generated = Course::Assessment::Question::Programming::Python::PythonPackageService.new(params).
                      generate_package(nil)
          Course::Assessment::ProgrammingPackage.new(generated.path)
        end
        let(:solution_files) { [uploaded_file('a.py', "import b\n"), uploaded_file('b.py', 'X = 1')] }
        let(:problem) { subject.send(:construct_problem_object, package) }

        before { question.multiple_file_submission = true }

        let(:main_file_content) { "import a\n\ndef x():\n    return a.b.X\n" }

        it 'sends a generated main file holding the prepend and append first, then every file' do
          templates = problem[:resources][0][:templates]
          expect(templates.first).
            to eq(path: '_coursemology_main.py', prefix: '', content: main_file_content, suffix: '')
          expect(templates.drop(1)).to contain_exactly(
            { path: 'a.py', prefix: '', content: "import b\n", suffix: '' },
            { path: 'b.py', prefix: '', content: 'X = None', suffix: '' }
          )

          solution_files = problem[:resources][0][:solutions][0][:files]
          expect(solution_files.first).to eq(path: '_coursemology_main.py', content: main_file_content)
          expect(solution_files.drop(1)).to contain_exactly(
            { path: 'a.py', content: "import b\n" },
            { path: 'b.py', content: 'X = 1' }
          )
        end

        context 'when a solution file is empty' do
          let(:solution_files) do
            [uploaded_file('a.py', "import b\nimport helper\n"), uploaded_file('b.py', 'X = 1'),
             uploaded_file('helper.py', '')]
          end

          it 'still sends it, since an empty module can be imported' do
            solution_files = problem[:resources][0][:solutions][0][:files]
            expect(solution_files).to include(path: 'helper.py', content: '')
          end
        end

        it 'sends no evaluator, which Codaveri does not use for Python' do
          expect(problem[:resources][0]).not_to have_key(:evaluator)

          expected_test_case = { prefix: '_out = x()', lhsExpression: '_out' }
          expect(problem[:resources][0][:exprTestcases].map { |test_case| test_case.slice(:prefix, :lhsExpression) }).
            to eq([expected_test_case])
        end

        it 'sends only the data files as additional files' do
          expect(problem[:additionalFiles].map { |file| file[:path] }).to eq(['data.txt'])
        end

        describe 'the files generated for answers' do
          let(:generated_files) { Course::Assessment::Question::ProgrammingCodaveri::ProgrammingCodaveriPackageService.generated_answer_files(question) }

          before { question.attachment = create(:attachment_reference, binary: true, file_path: package.path) }

          it 'is the main file holding the prepend and append, the same as in the problem' do
            main_file = { path: '_coursemology_main.py', content: main_file_content }
            expect(generated_files).to eq([main_file])
          end

          it 'is nothing without file submission' do
            question.multiple_file_submission = false
            expect(generated_files).to eq([])
          end

          it 'is nothing for a Java question with file submission' do
            question.language = Coursemology::Polyglot::Language::Java::Java17.instance
            expect(generated_files).to eq([])
          end
        end
      end
    end
  end
end
