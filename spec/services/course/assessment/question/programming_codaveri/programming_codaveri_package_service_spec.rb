# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingCodaveri::ProgrammingCodaveriPackageService do
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
    let(:package) { Course::Assessment::ProgrammingPackage.new(package_path) }
    subject do
      Course::Assessment::Question::ProgrammingCodaveri::ProgrammingCodaveriPackageService.new(question, package)
    end

    before do
      Course::Assessment::Question::ProgrammingImportService.import(question, attachment)
    end

    describe '.init_language_codaveri_package_service' do
      it 'returns the correct class' do
        expect(subject.send(:init_language_codaveri_package_service, question,
                            package).class).to eq Course::Assessment::Question::ProgrammingCodaveri::
                            Python::PythonPackageService
      end

      context 'when the language of the question has not been implemented yet' do
        it 'raises the correct error' do
          # question.update!(language: Coursemology::Polyglot::Language::CPlusPlus.instance)
          question.language = Coursemology::Polyglot::Language::CPlusPlus.instance
          question.save(validate: false)

          expect do
            subject.send(:init_language_codaveri_package_service, question, package)
          end.to raise_error(NotImplementedError)
        end
      end
    end
  end
end
