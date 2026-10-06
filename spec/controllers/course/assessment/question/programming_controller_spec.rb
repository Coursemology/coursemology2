# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingController do
  render_views
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:programming_question) { nil }
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:question_programming_attributes) do
      attributes_for(:course_assessment_question_programming).
        slice(:title, :description, :maximum_grade, :language, :memory_limit,
              :time_limit).tap do |result|
        result[:language_id] = result.delete(:language).id
      end
    end
    let(:immutable_programming_question) do
      create(:course_assessment_question_programming, assessment: assessment).tap do |question|
        allow(question).to receive(:save).and_return(false)
        allow(question).to receive(:destroy).and_return(false)
      end
    end

    before do
      controller_sign_in(controller, user)
      controller.instance_variable_set(:@programming_question, programming_question)
    end

    describe '#create' do
      subject do
        request.accept = 'application/json'
        post :create, params: {
          course_id: course, assessment_id: assessment,
          question_programming: question_programming_attributes
        }
      end

      context 'when saving fails' do
        let(:programming_question) { immutable_programming_question }

        it 'returns bad request' do
          subject
          expect(response).to have_http_status(:bad_request)
        end
      end

      context 'when attaching a template package' do
        include Rails.application.routes.url_helpers

        let(:question_programming_attributes) do
          attributes_for(:course_assessment_question_programming, template_package: true).
            slice(:title, :description, :maximum_grade, :language, :memory_limit,
                  :time_limit, :file).tap do |result|
            result[:language_id] = result.delete(:language).id
            result[:file] = fixture_file_upload('course/programming_question_template.zip')
          end
        end

        it 'returns the correct import job url' do
          import_job_url = JSON.parse(subject.body)['importJobUrl']
          expect(import_job_url).to eq(job_path(controller.instance_variable_get(:@programming_question).import_job))
        end
      end
    end

    describe '#edit' do
      let!(:programming_question) do
        programming_question = create(:course_assessment_question_programming, assessment: assessment)
        programming_question.question.update_column(:description, "<script>alert('boo');</script>")
        programming_question
      end

      subject do
        get :edit, format: :json, params: {
          course_id: course,
          assessment_id: assessment,
          id: programming_question
        }
      end

      context 'when edit page is loaded' do
        it 'sanitizes the description text' do
          rendered_description = JSON.parse(subject.body)['question']['description']
          expect(rendered_description).not_to include('script')
        end
      end
    end

    describe '#update' do
      subject do
        request.accept = 'application/json'
        patch :update, params: {
          course_id: course, assessment_id: assessment, id: programming_question,
          question_programming: question_programming_attributes
        }
      end

      let!(:existing_language) { Coursemology::Polyglot::Language.find_by(name: 'Python 3.10') }

      context 'when the selected language is enabled' do
        let!(:programming_question) do
          create(:course_assessment_question_programming, assessment: assessment, language: existing_language)
        end
        let(:question_programming_attributes) do
          attributes_for(:course_assessment_question_programming).
            slice(:title, :description, :maximum_grade, :memory_limit,
                  :time_limit).tap do |result|
            result[:language_id] = existing_language.id
          end
        end

        it 'updates the question successfully' do
          subject
          expect(response).to have_http_status(:ok)
        end
      end

      context 'when the selected language is disabled' do
        let!(:programming_question) do
          create(:course_assessment_question_programming, assessment: assessment, language: existing_language)
        end
        let(:question_programming_attributes) do
          attributes_for(:course_assessment_question_programming).
            slice(:title, :description, :maximum_grade, :memory_limit,
                  :time_limit).tap do |result|
            result[:language_id] = existing_language.id
          end
        end

        # Disable the language before the test, and enable it after the test
        # Direct SQL is used to avoid the readonly limitations
        before do
          ActiveRecord::Base.connection.execute(
            "UPDATE polyglot_languages SET enabled = false WHERE id = #{existing_language.id}"
          )
          programming_question.reload
        end

        after do
          ActiveRecord::Base.connection.execute(
            "UPDATE polyglot_languages SET enabled = true WHERE id = #{existing_language.id}"
          )
        end

        it 'returns bad request with an appropriate error message' do
          subject
          expect(response).to have_http_status(:bad_request)
          expect(JSON.parse(response.body)['errors']).to include(
            'The selected programming language has been deprecated and cannot be used. ' \
            'Please select another language.'
          )
        end
      end

      context 'when the question cannot be saved' do
        let(:programming_question) { immutable_programming_question }

        it 'returns bad request' do
          subject
          expect(response).to have_http_status(:bad_request)
        end
      end

      context 'when attaching a template package' do
        include Rails.application.routes.url_helpers

        let(:programming_question) do
          create(:course_assessment_question_programming,
                 assessment: assessment, template_package: true)
        end
        let(:question_programming_attributes) do
          attributes_for(:course_assessment_question_programming, template_package: true).
            slice(:title, :description, :maximum_grade, :language, :memory_limit,
                  :time_limit).tap do |result|
            result[:language_id] = result.delete(:language).id
            result[:file] = fixture_file_upload('course/programming_question_template.zip')
          end
        end

        it 'returns the correct import job url' do
          import_job_url = JSON.parse(subject.body)['importJobUrl']
          expect(import_job_url).to eq(job_path(controller.instance_variable_get(:@programming_question).import_job))
        end
      end
    end

    describe '#update_question_setting' do
      let!(:programming_question) do
        programming_question = create(:course_assessment_question_programming, assessment: assessment)
        programming_question.question.update_column(:description, "<script>alert('boo');</script>")
        programming_question
      end

      subject do
        patch :update_question_setting, params: {
          course_id: course, assessment_id: assessment, id: programming_question,
          question_programming: { is_codaveri: false, live_feedback_enabled: true }
        }
      end

      context 'when codaveri evaluator is disabled and live feedback is enabled' do
        it 'will have codaveri evaluator turned off and live feedback turned on' do
          subject
          expect(programming_question.reload.live_feedback_enabled).to be_truthy
          expect(programming_question.reload.is_codaveri).to be_falsey
        end
      end
    end

    describe '#destroy' do
      let(:programming_question) { immutable_programming_question }
      subject do
        post :destroy, params: { course_id: course, assessment_id: assessment, id: programming_question }
      end

      context 'when the question cannot be destroyed' do
        let(:programming_question) { immutable_programming_question }

        it 'responds bad request with an error message' do
          expect(subject).to have_http_status(:bad_request)
          json_response = JSON.parse(response.body, { symbolize_names: true })
          expect(json_response[:errors]).to include(immutable_programming_question.errors.full_messages.to_sentence)
        end
      end
    end

    describe 'snapshots' do
      let(:assessment) { create(:assessment, :published_with_programming_question, course: course) }
      let(:live_question) { assessment.questions.first.specific }
      let(:submission) { create(:submission, :attempting, assessment: assessment, creator: user) }
      let!(:graded_test_result) do
        grading = Course::Assessment::Answer::ProgrammingAutoGrading.create!(answer: submission.answers.first)
        create(:course_assessment_answer_programming_auto_grading_test_result,
               auto_grading: grading, test_case: live_question.test_cases.first)
      end

      # Switching to non-autograded removes the package and test cases outside of an import.
      context 'when an online editor question is made non-autograded after an answer was graded against it' do
        before { live_question.update_column(:package_type, :online_editor) }

        subject do
          request.accept = 'application/json'
          patch :update, params: {
            course_id: course, assessment_id: assessment, id: live_question,
            question_programming: {
              title: live_question.title, language_id: live_question.language_id,
              memory_limit: live_question.memory_limit, time_limit: live_question.time_limit,
              autograded: false, submission: 'print(1)'
            }
          }
        end

        it 'keeps the version it was graded against as a snapshot' do
          test_case_ids = live_question.test_cases.map(&:id)

          expect(subject).to have_http_status(:ok)

          snapshot = live_question.reload.snapshots.sole
          expect(snapshot.test_cases.map(&:id)).to match_array(test_case_ids)
          expect(snapshot.superseder).to eq(user)
          expect(graded_test_result.reload.test_case.question_id).to eq(snapshot.id)
          expect(live_question.test_cases).to be_empty
        end
      end

      # Every action loads the question through the assessment, and a snapshot is in none: it has no parent question
      # row. Rails renders the RecordNotFound as a 404.
      context 'when a request is made for a snapshot' do
        let(:snapshot) do
          path = File.join(Rails.root, 'spec/fixtures/course/programming_question_template_with_add_files.zip')
          package = create(:attachment_reference, binary: true, file_path: path)
          Course::Assessment::Question::ProgrammingImportService.import(live_question, package)
          live_question.reload.snapshots.sole
        end
        let(:snapshot_params) { { course_id: course, assessment_id: assessment, id: snapshot.id } }

        it 'is not found, for reading or for changing it' do
          expect { get :edit, format: :json, params: snapshot_params }.to raise_error(ActiveRecord::RecordNotFound)
          expect { get :import_result, format: :json, params: snapshot_params }.
            to raise_error(ActiveRecord::RecordNotFound)
          expect do
            patch :update, format: :json, params: snapshot_params.merge(question_programming: { attempt_limit: 3 })
          end.to raise_error(ActiveRecord::RecordNotFound)
          expect do
            patch :update_question_setting,
                  params: snapshot_params.merge(question_programming: { live_feedback_enabled: true })
          end.to raise_error(ActiveRecord::RecordNotFound)
          expect { delete :destroy, params: snapshot_params }.to raise_error(ActiveRecord::RecordNotFound)

          expect(snapshot.reload).to have_attributes(attempt_limit: nil, live_feedback_enabled: false)
          expect(snapshot.test_cases).to include(graded_test_result.reload.test_case)
        end
      end
    end

    describe '#codaveri_languages' do
      subject do
        get :codaveri_languages, params: { course_id: course, assessment_id: assessment }, format: :json
      end

      let!(:language) { Coursemology::Polyglot::Language.find_by(name: 'Python 3.10') }

      context 'when the language is enabled' do
        it 'returns the enabled languages' do
          subject
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body).map { |language| language['name'] }).to include('Python 3.10')
        end
      end

      context 'when the language is disabled' do
        before do
          ActiveRecord::Base.connection.execute(
            "UPDATE polyglot_languages SET enabled = false WHERE id = #{language.id}"
          )
        end
        after do
          ActiveRecord::Base.connection.execute(
            "UPDATE polyglot_languages SET enabled = true WHERE id = #{language.id}"
          )
        end

        it 'does not return the disabled language' do
          subject
          expect(JSON.parse(response.body).map { |l| l['name'] }).not_to include('Python 3.10')
        end
      end
    end
  end
end
