# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::CodaveriProblemGenerationService do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course, creator: user) }

    subject { described_class.new(assessment, params, language, version) }

    describe '#initialize' do
      before { described_class.new(assessment, params, language, version) }

      context 'when generating a Python problem' do
        let(:params) do
          JSON.parse(
            File.read(File.join(Rails.root,
                                'spec/fixtures/course/codaveri/codaveri_problem_generation_python_test.json'))
          ).symbolize_keys
        end
        let(:language) { 'python' }
        let(:version) { '3.12' }
        context 'when initializing with problem details' do
          it 'sets the problem title and description correctly' do
            payload = subject.instance_variable_get(:@payload)
            expect(payload[:problem][:title]).to eq('Absolute Value')
            expect(payload[:problem][:description]).to eq('Given a number n, return its absolute value')
          end

          it 'sets the template content correctly' do
            payload = subject.instance_variable_get(:@payload)
            expect(payload[:problem][:templates].first[:path]).to eq('main.py')
            expect(payload[:problem][:templates].first[:content]).to eq(params[:template])
          end

          it 'initializes solution as an empty string' do
            payload = subject.instance_variable_get(:@payload)
            expect(payload[:problem][:solutions].first[:tag]).to eq('solution')
            expect(payload[:problem][:solutions].first[:files].first[:path]).to eq('main.py')
            expect(payload[:problem][:solutions].first[:files].first[:content]).to eq('')
          end
        end

        context 'when appending test cases' do
          it 'appends public test cases to exprTestcases' do
            payload = subject.instance_variable_get(:@payload)
            public_test_cases = payload[:problem][:exprTestcases].select { |tc| tc[:visibility] == 'public' }

            expect(public_test_cases.size).to eq(2)
            expect(public_test_cases[0]).to include(
              hint: 'Positive number',
              lhsExpression: 'absolute(1)',
              rhsExpression: '1',
              display: 'absolute(1)'
            )
            expect(public_test_cases[1]).to include(
              hint: 'Negative number',
              lhsExpression: 'absolute(-2)',
              rhsExpression: '2',
              display: 'absolute(-2)'
            )
          end

          it 'appends private test cases to exprTestcases' do
            payload = subject.instance_variable_get(:@payload)
            private_test_case = payload[:problem][:exprTestcases].find { |tc| tc[:visibility] == 'private' }

            expect(private_test_case).to include(
              hint: 'Zero number',
              lhsExpression: 'absolute(0)',
              rhsExpression: '0',
              display: 'absolute(0)'
            )
          end

          it 'appends hidden (evaluation) test cases to exprTestcases' do
            payload = subject.instance_variable_get(:@payload)
            hidden_test_case = payload[:problem][:exprTestcases].find { |tc| tc[:visibility] == 'hidden' }

            expect(hidden_test_case).to include(
              hint: 'Any number',
              lhsExpression: 'absolute(0.5)',
              rhsExpression: '0.5',
              display: 'absolute(0.5)'
            )
          end

          it 'assigns incremental indices to exprTestcases' do
            payload = subject.instance_variable_get(:@payload)
            indices = payload[:problem][:exprTestcases].map { |tc| tc[:index] }

            expect(indices).to eq([1, 2, 3, 4]) # Ensuring the indices are assigned incrementally
          end
        end
      end

      context 'when generating a Java problem' do
        let(:params) do
          JSON.parse(
            File.read(File.join(Rails.root,
                                'spec/fixtures/course/codaveri/codaveri_problem_generation_java_test.json'))
          ).symbolize_keys
        end
        let(:language) { 'java' }
        let(:version) { '21' }
        context 'when initializing with problem details' do
          it 'sets the problem title and description correctly' do
            payload = subject.instance_variable_get(:@payload)
            expect(payload[:problem][:title]).to eq('Absolute Value')
            expect(payload[:problem][:description]).to eq('Given a number n, return its absolute value')
          end

          it 'sets the template content correctly' do
            payload = subject.instance_variable_get(:@payload)
            expect(payload[:problem][:templates].first[:path]).to eq('Absolute.java')
            expect(payload[:problem][:templates].first[:content]).to eq(params[:template])
          end

          it 'initializes solution as an empty string' do
            payload = subject.instance_variable_get(:@payload)
            expect(payload[:problem][:solutions].first[:tag]).to eq('solution')
            expect(payload[:problem][:solutions].first[:files].first[:path]).to eq('Main.java')
            expect(payload[:problem][:solutions].first[:files].first[:content]).to eq('')
          end
        end

        context 'when appending test cases' do
          it 'appends public test case to exprTestcase with inline code' do
            payload = subject.instance_variable_get(:@payload)
            public_test_cases = payload[:problem][:exprTestcases]

            expect(public_test_cases.size).to eq(1)
            expect(public_test_cases[0]).to include(
              hint: 'Positive number',
              lhsExpression: 'absolute(1)',
              rhsExpression: '1',
              display: 'absolute(1)',
              prefix: 'System.out.println("Hello World!");',
              visibility: 'public'
            )
          end
        end
      end
    end
  end
end
