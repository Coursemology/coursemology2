# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::SurveysController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let!(:course) { create(:course, creator: admin) }
    let(:student) { create(:course_student, course: course) }
    let(:manager) { create(:course_manager, course: course) }
    let!(:survey) do
      create(:survey, *survey_traits,
             course: course, section_count: 2, section_traits: [:with_all_question_types])
    end
    let(:survey_traits) { nil }
    let(:student_response) do
      create(:response, *response_traits,
             survey: survey, creator: student.user, course_user: student)
    end
    let(:response_traits) { nil }
    let(:survey_stub) do
      stub = create(:survey, course: course)
      allow(stub).to receive(:save).and_return(false)
      allow(stub).to receive(:update_attributes).and_return(false)
      allow(stub).to receive(:destroy).and_return(false)
      stub
    end
    let(:json_response) { JSON.parse(response.body) }

    before { sign_in(user) }

    describe '#index' do
      let!(:published_survey) { create(:survey, :published, course: course) }

      context 'when html page is requested' do
        let(:user) { student.user }
        subject { get :index, course_id: course.id }

        it { is_expected.to render_template('index') }

        context 'when survey component is disabled' do
          before do
            allow(controller).
              to receive_message_chain('current_component_host.[]').and_return(nil)
          end

          it 'raises an component not found error' do
            expect { subject }.to raise_error(ComponentNotFoundError)
          end
        end
      end

      context 'when json data is requested' do
        render_views
        subject { get :index, format: :json, course_id: course.id }
        before { subject }

        context 'when user is staff' do
          let(:user) { admin }

          it 'sees all surveys' do
            expect(json_response['surveys'].length).to eq(2)
          end
        end

        context 'when user is student' do
          let(:user) { student.user }

          it 'sees only published surveys' do
            expect(json_response['surveys'].length).to eq(1)
          end
        end
      end
    end

    describe '#create' do
      let(:user) { admin }

      subject do
        post :create, format: :json, course_id: course.id, id: survey.id,
                      survey: attributes_for(:survey)
      end

      it 'creates a survey' do
        expect { subject }.to change { course.surveys.count }.by(1)
      end

      context 'when saving fails' do
        before do
          controller.instance_variable_set(:@survey, survey_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#show' do
      let(:survey_traits) { :published }

      context 'when html page is requested' do
        let(:user) { student.user }
        subject { get :show, course_id: course.id, id: survey.id }

        it { is_expected.to render_template('index') }
      end

      context 'when json data is requested' do
        render_views
        let(:user) { manager.user }
        let(:manager_response) do
          create(:response, survey: survey, creator: manager.user, course_user: manager)
        end

        subject { get :show, format: :json, course_id: course.id, id: survey.id }
        before do
          manager_response
          subject
        end

        it 'responds with the necessary fields' do
          expect(json_response.keys).to contain_exactly(
            'id', 'title', 'description', 'base_exp', 'time_bonus_exp', 'published',
            'start_at', 'end_at', 'closing_reminded_at', 'anonymous', 'allow_response_after_end',
            'allow_modify_after_submit', 'canUpdate', 'canDelete', 'canCreateSection',
            'canViewResults', 'canRespond', 'response', 'sections', 'hasStudentResponse'
          )

          expect(json_response['response'].keys).to contain_exactly(
            'id', 'submitted_at', 'canModify', 'canSubmit'
          )

          json_section_ids = json_response['sections'].map { |section| section['id'] }
          expect(json_section_ids).to contain_exactly(*survey.sections.map(&:id))
          first_section = json_response['sections'][0]
          expect(first_section.keys).to contain_exactly(
            'id', 'canCreateQuestion', 'canDelete', 'canUpdate', 'description',
            'questions', 'title', 'weight'
          )

          json_question_ids = json_response['sections'].map do |section|
            section['questions'].map { |question| question['id'] }
          end.flatten
          question_ids = survey.sections.map(&:questions).flatten.map(&:id)
          expect(json_question_ids).to contain_exactly(*question_ids)
          expect(first_section['questions'][0].keys).to contain_exactly(
            'id', 'description', 'required', 'question_type', 'max_options', 'min_options',
            'weight', 'grid_view', 'section_id', 'canUpdate', 'canDelete', 'options'
          )
        end
      end
    end

    describe '#update' do
      let(:user) { admin }

      subject do
        patch :update, format: :json, course_id: course.id, id: survey.id,
                       survey: survey_params
      end

      context 'when survey is anonymous' do
        let(:survey_traits) { :anonymous }
        let(:survey_params) { attributes_for(:survey).merge(anonymous: false) }

        context 'when survey has no responses' do
          before { subject }

          it 'allows anonymous flag to be turned off' do
            expect(survey.reload).not_to be_anonymous
          end
        end

        context 'when survey has a student response' do
          before do
            student_response
            subject
          end

          it 'does not allow anonymous flag to be turned off' do
            expect(survey.reload).to be_anonymous
          end
        end
      end

      context 'when updating fails' do
        let(:survey_params) { attributes_for(:survey) }

        before do
          controller.instance_variable_set(:@survey, survey_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#destroy' do
      let(:user) { admin }
      subject { delete :destroy, format: :json, course_id: course.id, id: survey.id }

      context 'when destroy succeeds' do
        it 'removes the deleted survey' do
          expect { subject }.to change { course.surveys.count }.by(-1)
          expect(response).to have_http_status(:ok)
        end
      end

      context 'when destroy fails' do
        before do
          controller.instance_variable_set(:@survey, survey_stub)
          subject
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#results' do
      let(:user) { admin }

      context 'when html page is requested' do
        subject { get :results, course_id: course.id, id: survey.id }

        it { is_expected.to render_template('index') }
      end

      context 'when json data is requested' do
        render_views
        let(:response_traits) { :submitted }

        subject { get :results, format: :json, course_id: course.id, id: survey.id }
        before do
          student_response.build_missing_answers_and_options
          student_response.save!
          subject
        end

        it 'responds with the necessary fields' do
          expect(json_response.keys).to contain_exactly('survey', 'sections')

          expect(json_response['sections'].length).to be(survey.sections.length)
          first_section = json_response['sections'][0]
          expect(first_section.keys).to contain_exactly(
            'description', 'id', 'questions', 'title', 'weight'
          )

          multiple_choice_question = first_section['questions'].find do |question|
            question['question_type'] == 'multiple_choice'
          end
          expect(multiple_choice_question.keys).to contain_exactly(
            'id', 'answers', 'description', 'grid_view', 'max_options', 'min_options',
            'options', 'question_type', 'required', 'weight'
          )

          expect(multiple_choice_question['answers'][0].keys).to contain_exactly(
            'id', 'course_user_name', 'course_user_id', 'phantom', 'selected_options'
          )

          expect(multiple_choice_question['options'][0].keys).to contain_exactly(
            'id', 'option', 'weight'
          )

          text_response_question = first_section['questions'].find do |question|
            question['question_type'] == 'text'
          end
          expect(text_response_question['answers'][0].keys).to include('text_response')
        end
      end
    end

    describe '#remind' do
      let(:user) { admin }
      let(:survey_traits) { :currently_active }

      subject { post :remind, format: :json, course_id: course.id, id: survey.id }

      it 'sends reminder to students' do
        allow(Course::Survey::ReminderService).to receive(:send_closing_reminder)
        subject
        expect(Course::Survey::ReminderService).to have_received(:send_closing_reminder)
        expect(response).to have_http_status(:ok)
      end
    end

    describe '#reorder_sections' do
      let(:user) { admin }

      subject do
        post :reorder_sections,
             format: :json, course_id: course.id, id: survey.id, ordering: ordering
      end

      before { subject }

      context 'when new ordering is valid' do
        let(:ordering) { survey.sections.order(weight: :asc).pluck(:id).reverse }

        it 'persists the ordering' do
          updated_ordering = survey.sections.order(weight: :asc).pluck(:id)
          expect(updated_ordering).to eq(ordering)
        end
      end

      context 'when new ordering contains an invalid section id' do
        let(:ordering) do
          current_ordering = survey.sections.order(weight: :asc).pluck(:id)
          invalid_id = current_ordering.max + 1
          current_ordering << invalid_id
        end

        it { is_expected.to have_http_status(:bad_request) }
      end

      context 'when new ordering contains duplicate section ids' do
        let(:ordering) do
          current_ordering = survey.sections.order(weight: :asc).pluck(:id)
          current_ordering << current_ordering.last
        end

        it { is_expected.to have_http_status(:bad_request) }
      end
    end

    describe '#reorder_questions' do
      let(:user) { admin }
      let(:section_ids) { survey.sections.pluck(:id) }
      let(:question_ids) { survey.questions.pluck(:id) }

      subject do
        post :reorder_questions,
             format: :json, course_id: course.id, id: survey.id, ordering: ordering
      end
      before { subject }

      context 'when new ordering is valid' do
        let(:ordering) { [[section_ids.first, question_ids], [section_ids.last, []]] }

        it 'persists the ordering' do
          first_section_ids =
            survey.sections.find(section_ids.first).questions.order(weight: :asc).pluck(:id)
          expect(first_section_ids).to eq(question_ids)
          expect(survey.sections.find(section_ids.last).questions.count).to eq(0)
        end
      end

      context 'when new ordering is invalid' do
        let(:ordering) { [[section_ids.first, [question_ids.first]]] }
        it { is_expected.to have_http_status(:bad_request) }
      end
    end
  end
end
