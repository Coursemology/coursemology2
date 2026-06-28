# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::GradebookController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student) { create(:course_user, :student, course: course) }
    let(:staff) { create(:course_user, :teaching_assistant, course: course) }

    describe '#index' do
      render_views
      subject { get :index, params: { course_id: course.id }, format: :json }

      context 'when the gradebook component is disabled' do
        let(:ta) { create(:course_teaching_assistant, course: course) }

        before do
          controller_sign_in(controller, ta.user)
          allow(controller).to receive_message_chain('current_component_host.[]').and_return(nil)
        end

        it 'raises a component not found error' do
          expect { subject }.to raise_error(ComponentNotFoundError)
        end
      end

      context 'when a student visits the page' do
        let(:student) { create(:course_student, course: course) }
        before { controller_sign_in(controller, student.user) }

        it { expect { subject }.to raise_error(CanCan::AccessDenied) }
      end

      context 'when a teaching assistant visits the page' do
        let(:ta) { create(:course_teaching_assistant, course: course) }
        before { controller_sign_in(controller, ta.user) }

        it { expect(subject).to be_successful }

        it 'returns all required top-level keys' do
          subject
          data = JSON.parse(response.body)
          %w[categories tabs assessments students submissions].each do |key|
            expect(data).to have_key(key), "expected response to have key '#{key}'"
          end
        end
      end

      context 'when a manager visits the page' do
        let(:manager) { create(:course_manager, course: course) }
        before { controller_sign_in(controller, manager.user) }

        it { expect(subject).to be_successful }
      end

      context 'when an observer visits the page' do
        let(:observer) { create(:course_observer, course: course) }
        before { controller_sign_in(controller, observer.user) }

        it { expect(subject).to be_successful }
      end

      context 'with a published assessment and a graded submission' do
        let(:ta) { create(:course_teaching_assistant, course: course) }
        let(:tab) { course.assessment_categories.first.tabs.first }
        let!(:assessment) do
          create(:course_assessment_assessment, :published_with_mcq_question,
                 course: course, tab: tab)
        end
        let!(:student) { create(:course_student, course: course) }
        let!(:submission) do
          create(:course_assessment_submission, :graded,
                 assessment: assessment, creator: student.user)
        end

        before do
          submission.answers.update_all(grade: 5.0, current_answer: true)
          controller_sign_in(controller, ta.user)
        end

        it 'includes the assessment in the assessments array' do
          subject
          data = JSON.parse(response.body)
          expect(data['assessments'].map { |a| a['id'] }).to include(assessment.id)
        end

        it 'includes the tab in the tabs array' do
          subject
          data = JSON.parse(response.body)
          expect(data['tabs'].map { |t| t['id'] }).to include(tab.id)
        end

        it 'includes the category in the categories array' do
          subject
          data = JSON.parse(response.body)
          expect(data['categories'].map { |c| c['id'] }).to include(tab.category.id)
        end

        it 'includes the student with email and level in the students array' do
          subject
          data = JSON.parse(response.body)
          student_data = data['students'].find { |s| s['id'] == student.user_id }
          expect(student_data).not_to be_nil
          expect(student_data).to have_key('email')
          expect(student_data).to have_key('externalId')
          expect(student_data['externalId']).to be_nil
          expect(student_data).to have_key('level')
          expect(student_data['level']).to be_a(Integer)
        end

        it 'returns the correct grade in the submissions array' do
          subject
          data = JSON.parse(response.body)
          sub = data['submissions'].find do |s|
            s['studentId'] == student.user_id && s['assessmentId'] == assessment.id
          end
          expect(sub).not_to be_nil
          expect(sub['grade'].to_f).to eq(5.0)
        end

        it 'returns a positive maxGrade for the assessment' do
          subject
          data = JSON.parse(response.body)
          assessment_data = data['assessments'].find { |a| a['id'] == assessment.id }
          expect(assessment_data['maxGrade'].to_f).to be > 0
        end
      end

      context 'when a student has an external ID' do
        let(:ta) { create(:course_teaching_assistant, course: course) }
        let!(:student) { create(:course_student, course: course, external_id: 'EXT-123') }
        before { controller_sign_in(controller, ta.user) }

        it 'returns the external ID in the students array' do
          subject
          data = JSON.parse(response.body)
          student_data = data['students'].find { |s| s['id'] == student.user_id }
          expect(student_data).not_to be_nil
          expect(student_data['externalId']).to eq('EXT-123')
        end
      end

      context 'with a graded submission where the answer grade is exactly 0' do
        let(:ta) { create(:course_teaching_assistant, course: course) }
        let(:tab) { course.assessment_categories.first.tabs.first }
        let!(:assessment) do
          create(:course_assessment_assessment, :published_with_mcq_question,
                 course: course, tab: tab)
        end
        let!(:student) { create(:course_student, course: course) }
        let!(:submission) do
          create(:course_assessment_submission, :graded,
                 assessment: assessment, creator: student.user)
        end

        before do
          submission.answers.update_all(grade: 0.0, current_answer: true)
          controller_sign_in(controller, ta.user)
        end

        it 'returns grade 0 (not null) in the submissions array' do
          subject
          data = JSON.parse(response.body)
          sub = data['submissions'].find do |s|
            s['studentId'] == student.user_id && s['assessmentId'] == assessment.id
          end
          expect(sub).not_to be_nil
          expect(sub['grade']).to eq(0.0)
        end
      end

      context 'with a graded submission where answer grades are null (blank)' do
        let(:ta) { create(:course_teaching_assistant, course: course) }
        let(:tab) { course.assessment_categories.first.tabs.first }
        let!(:assessment) do
          create(:course_assessment_assessment, :published_with_mcq_question,
                 course: course, tab: tab)
        end
        let!(:student) { create(:course_student, course: course) }
        let!(:submission) do
          create(:course_assessment_submission, :graded,
                 assessment: assessment, creator: student.user)
        end

        before do
          submission.answers.update_all(grade: nil, current_answer: true)
          controller_sign_in(controller, ta.user)
        end

        it 'returns null grade (not 0) in the submissions array' do
          subject
          data = JSON.parse(response.body)
          sub = data['submissions'].find do |s|
            s['studentId'] == student.user_id && s['assessmentId'] == assessment.id
          end
          expect(sub).not_to be_nil
          expect(sub['grade']).to be_nil
        end
      end

      context 'when the course has an external assessment' do
        render_views
        let(:ta) { create(:course_teaching_assistant, course: course) }
        let(:gb_student) { create(:course_student, course: course) }
        let!(:external) do
          create(:course_external_assessment, course: course, title: 'Midterm', maximum_grade: 50)
        end
        let!(:external_grade) do
          create(:course_external_assessment_grade,
                 external_assessment: external, course_user: gb_student, grade: 41)
        end
        before { controller_sign_in(controller, ta.user) }

        it 'merges the external into assessments with a negative id and external flag' do
          subject
          data = JSON.parse(response.body)
          ext_row = data['assessments'].find { |a| a['id'] == -external.id }
          expect(ext_row).to be_present
          expect(ext_row['title']).to eq('Midterm')
          expect(ext_row['external']).to be(true)
          expect(ext_row['maxGrade']).to eq(50.0)
          expect(ext_row['tabId']).to eq(external.synthetic_tab_id)
        end

        it 'merges the external grade into submissions with a negative assessmentId' do
          subject
          data = JSON.parse(response.body)
          sub = data['submissions'].find { |s| s['assessmentId'] == -external.id }
          expect(sub).to be_present
          expect(sub['studentId']).to eq(gb_student.user_id)
          expect(sub['grade']).to eq(41.0)
        end

        it 'emits a synthetic External Assessments category' do
          subject
          data = JSON.parse(response.body)
          cat = data['categories'].find { |c| c['id'] == Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID }
          expect(cat).to be_present
          expect(cat['title']).to eq('External Assessments')
        end

        it 'emits a synthetic tab with negative id under the synthetic category' do
          subject
          data = JSON.parse(response.body)
          tab = data['tabs'].find { |t| t['id'] == external.synthetic_tab_id }
          expect(tab).to be_present
          expect(tab['categoryId']).to eq(Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID)
        end

        it 'creates no real tab or category for the external' do
          tab_count_before = Course::Assessment::Tab.count
          cat_count_before = Course::Assessment::Category.count
          subject
          expect(Course::Assessment::Tab.count).to eq(tab_count_before)
          expect(Course::Assessment::Category.count).to eq(cat_count_before)
          expect(Course::Assessment::Category.where(title: 'External Assessments')).to be_empty
        end
      end
    end

    describe 'GET #index with externals' do
      render_views
      let!(:course) { create(:course) }
      let!(:external) do
        Course::ExternalAssessment.create_for_course!(course: course, title: 'Midterm',
                                                      maximum_grade: 50.0, weight: 40)
      end
      let(:ta) { create(:course_teaching_assistant, course: course) }

      before do
        ctx = Struct.new(:current_course, :key).new(course, Course::GradebookComponent.key)
        Course::Settings::GradebookComponent.new(ctx).weighted_view_enabled = true
        course.save!
        controller_sign_in(controller, ta.user)
      end

      subject(:body) do
        get(:index, params: { course_id: course }, format: :json)
        JSON.parse(response.body)
      end

      it 'emits a synthetic External Assessments category' do
        cat = body['categories'].find { |c| c['id'] == Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID }
        expect(cat['title']).to eq('External Assessments')
      end

      it 'emits one synthetic tab per external carrying its weight' do
        tab = body['tabs'].find { |t| t['id'] == -external.id }
        expect(tab['categoryId']).to eq(Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID)
        expect(tab['gradebookWeight']).to eq(40.0)
        expect(tab['weightMode']).to eq('equal')
      end

      it 'emits the external as a negative-id leaf under its synthetic tab' do
        leaf = body['assessments'].find { |a| a['id'] == -external.id }
        expect(leaf['external']).to be(true)
        expect(leaf['tabId']).to eq(-external.id)
      end

      it 'creates no real tab or category for the external' do
        tab_count_before = Course::Assessment::Tab.count
        cat_count_before = Course::Assessment::Category.count
        body
        expect(Course::Assessment::Tab.count).to eq(tab_count_before)
        expect(Course::Assessment::Category.count).to eq(cat_count_before)
        expect(Course::Assessment::Category.where(title: 'External Assessments')).to be_empty
      end
    end

    describe 'PATCH update_weights' do
      let(:manager) { create(:course_manager, course: course) }
      let(:ta) { create(:course_teaching_assistant, course: course) }
      let(:student) { create(:course_student, course: course) }
      let(:category) { create(:course_assessment_category, course: course) }
      let!(:tab1) { create(:course_assessment_tab, category: category) }
      let!(:tab2) { create(:course_assessment_tab, category: category) }
      def weight_for(tab)
        Course::Gradebook::Contribution.find_by(tab_id: tab.id)&.weight
      end

      let(:valid_payload) do
        { weights: [{ tabId: tab1.id, weight: 60 }, { tabId: tab2.id, weight: 40 }] }
      end

      context 'as manager' do
        before { controller_sign_in(controller, manager.user) }

        it 'updates and returns 200' do
          patch :update_weights, params: { course_id: course.id, **valid_payload }, format: :json
          expect(response).to have_http_status(:ok)
          expect(weight_for(tab1)).to eq(60)
          expect(weight_for(tab2)).to eq(40)
        end

        it 'accepts sum < 100' do
          patch :update_weights,
                params: { course_id: course.id, weights: [tabId: tab1.id, weight: 30] },
                format: :json
          expect(response).to have_http_status(:ok)
        end

        it 'accepts sum > 100' do
          patch :update_weights,
                params: { course_id: course.id,
                          weights: [{ tabId: tab1.id, weight: 70 }, { tabId: tab2.id, weight: 70 }] },
                format: :json
          expect(response).to have_http_status(:ok)
        end

        it 'rejects negative with 422 and no partial write' do
          create(:course_gradebook_contribution, tab: tab1, course: course, weight: 10)
          patch :update_weights,
                params: { course_id: course.id,
                          weights: [{ tabId: tab1.id, weight: 50 }, { tabId: tab2.id, weight: -1 }] },
                format: :json
          expect(response).to have_http_status(:unprocessable_entity)
          expect(weight_for(tab1)).to eq(10)
        end

        it 'rejects >100 with 422' do
          patch :update_weights,
                params: { course_id: course.id, weights: [tabId: tab1.id, weight: 101] },
                format: :json
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'rejects foreign tab id with 422' do
          other_course = create(:course)
          other_tab = create(:course_assessment_tab,
                             category: create(:course_assessment_category, course: other_course))
          patch :update_weights,
                params: { course_id: course.id, weights: [tabId: other_tab.id, weight: 50] },
                format: :json
          expect(response).to have_http_status(:unprocessable_entity)
        end
      end

      context 'as TA' do
        before { controller_sign_in(controller, ta.user) }
        it 'is denied' do
          expect do
            patch :update_weights, params: { course_id: course.id, **valid_payload }, format: :json
          end.to raise_error(CanCan::AccessDenied)
        end
      end

      context 'as student' do
        before { controller_sign_in(controller, student.user) }
        it 'is denied' do
          expect do
            patch :update_weights, params: { course_id: course.id, **valid_payload }, format: :json
          end.to raise_error(CanCan::AccessDenied)
        end
      end

      context 'when setting is disabled' do
        before { controller_sign_in(controller, manager.user) }

        it 'still allows update (storage independent of display)' do
          patch :update_weights, params: { course_id: course.id, **valid_payload }, format: :json
          expect(response).to have_http_status(:ok)
          expect(weight_for(tab1)).to eq(60)
        end
      end

      describe '#update_weights with modes' do
        render_views

        let(:category) { create(:course_assessment_category, course: course) }
        let(:tab) { create(:course_assessment_tab, category: category) }
        let!(:a1) { create(:assessment, course: course, tab: tab) }
        let!(:a2) { create(:assessment, course: course, tab: tab) }

        before { controller_sign_in(controller, manager.user) }

        it 'persists custom mode + assessment weights and echoes them back' do
          post :update_weights, as: :json, params: {
            course_id: course.id,
            weights: [
              tabId: tab.id, weight: '50', weightMode: 'custom',
              assessmentWeights: [
                { assessmentId: a1.id, weight: '30' },
                { assessmentId: a2.id, weight: '20' }
              ]
            ]
          }
          expect(response).to have_http_status(:ok)
          body = JSON.parse(response.body)
          entry = body['weights'].first
          expect(entry['weightMode']).to eq('custom')
          expect(entry['assessmentWeights']).to contain_exactly(
            { 'assessmentId' => a1.id, 'weight' => 30.0 },
            { 'assessmentId' => a2.id, 'weight' => 20.0 }
          )
          expect(a1.reload.gradebook_assessment_contribution.weight).to eq(30.0)
        end

        it 'returns 422 when custom weights do not sum to the tab total' do
          post :update_weights, as: :json, params: {
            course_id: course.id,
            weights: [
              tabId: tab.id, weight: '50', weightMode: 'custom',
              assessmentWeights: [assessmentId: a1.id, weight: '10']
            ]
          }
          expect(response).to have_http_status(:unprocessable_entity)
        end

        it 'persists and echoes per-assessment exclusion in equal mode' do
          post :update_weights, as: :json, params: {
            course_id: course.id,
            weights: [
              tabId: tab.id, weight: '50', weightMode: 'equal',
              excludedAssessmentIds: [a1.id]
            ]
          }
          expect(response).to have_http_status(:ok)
          expect(a1.reload.gradebook_assessment_contribution.excluded).to eq(true)
          expect(a2.reload.gradebook_assessment_contribution.excluded).to eq(false)
          entry = JSON.parse(response.body)['weights'].first
          expect(entry['excludedAssessmentIds']).to eq([a1.id])
        end
      end
    end

    describe 'GET index — weighted view fields' do
      render_views
      let(:manager) { create(:course_manager, course: course) }
      let(:ta) { create(:course_teaching_assistant, course: course) }
      let(:category) { create(:course_assessment_category, course: course) }
      let!(:tab) { create(:course_assessment_tab, category: category) }
      let!(:contribution) { create(:course_gradebook_contribution, tab: tab, course: course, weight: 30) }
      let!(:assessment) do
        create(:course_assessment_assessment, :published_with_mcq_question,
               course: course, tab: tab)
      end

      context 'when setting is disabled (default)' do
        before { controller_sign_in(controller, manager.user) }

        it 'returns weightedViewEnabled false and omits gradebookWeight per tab' do
          get :index, params: { course_id: course.id }, format: :json
          body = JSON.parse(response.body)
          expect(body['weightedViewEnabled']).to eq(false)
          tab_json = body['tabs'].find { |t| t['id'] == tab.id }
          expect(tab_json).not_to have_key('gradebookWeight')
        end
      end

      context 'when setting is enabled' do
        before do
          ctx = Struct.new(:current_course, :key).new(course, Course::GradebookComponent.key)
          Course::Settings::GradebookComponent.new(ctx).weighted_view_enabled = true
          course.save!
        end

        it 'includes weightedViewEnabled true and gradebookWeight per tab for manager' do
          controller_sign_in(controller, manager.user)
          get :index, params: { course_id: course.id }, format: :json
          body = JSON.parse(response.body)
          expect(body['weightedViewEnabled']).to eq(true)
          expect(body['canManageWeights']).to eq(true)
          tab_json = body['tabs'].find { |t| t['id'] == tab.id }
          expect(tab_json['gradebookWeight']).to eq(30)
        end

        it 'returns canManageWeights false for TA' do
          controller_sign_in(controller, ta.user)
          get :index, params: { course_id: course.id }, format: :json
          body = JSON.parse(response.body)
          expect(body['canManageWeights']).to eq(false)
        end

        it 'serializes weightMode on tabs and gradebookWeight on assessments when weighted view is enabled' do
          controller_sign_in(controller, manager.user)
          get :index, params: { course_id: course.id }, format: :json
          body = JSON.parse(response.body)
          tab_json = body['tabs'].find { |t| t['id'] == tab.id }
          expect(tab_json).to have_key('weightMode')
          expect(body['assessments'].first).to have_key('gradebookWeight')
        end

        it 'serializes gradebookExcluded on assessments when weighted view is enabled' do
          controller_sign_in(controller, manager.user)
          get :index, params: { course_id: course.id }, format: :json
          body = JSON.parse(response.body)
          expect(body['assessments'].first).to have_key('gradebookExcluded')
          expect(body['assessments'].first['gradebookExcluded']).to eq(false)
        end
      end
    end

    describe 'external assessment ordering' do
      render_views
      let(:manager) { create(:course_manager, course: course) }

      it 'serializes externals in position order, not creation order' do
        first = create(:course_external_assessment, course: course, title: 'Zeta')
        second = create(:course_external_assessment, course: course, title: 'Alpha')
        # Make Alpha come first by position.
        Course::ExternalAssessment.reorder!(course: course, ordered_ids: [second.id, first.id])

        controller_sign_in(controller, manager.user)
        get :index, params: { course_id: course.id, format: :json }

        body = JSON.parse(response.body)
        external_titles = body['tabs'].
                          select { |t| t['categoryId'] == Course::ExternalAssessment::SYNTHETIC_CATEGORY_ID }.
                          map { |t| t['title'] }
        expect(external_titles).to eq(%w[Alpha Zeta])
      end
    end
  end
end
