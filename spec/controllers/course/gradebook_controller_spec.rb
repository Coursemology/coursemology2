# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::GradebookController, type: :controller do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:course) { create(:course) }
    let(:student) { create(:course_user, :student, course: course) }
    let(:staff) { create(:course_user, :teaching_assistant, course: course) }
    let(:manager) { create(:course_user, :manager, course: course) }

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

        it { expect { subject }.to raise_error(CanCan::AccessDenied) }
      end

      context 'when a manager visits the page' do
        let(:manager) { create(:course_manager, course: course) }
        before { controller_sign_in(controller, manager.user) }

        it { expect(subject).to be_successful }

        it 'returns all required top-level keys' do
          subject
          data = JSON.parse(response.body)
          %w[categories tabs assessments students submissions].each do |key|
            expect(data).to have_key(key), "expected response to have key '#{key}'"
          end
        end

        it 'serializes courseMaxLevel and a default levelContribution' do
          subject
          data = JSON.parse(response.body)
          expect(data).to have_key('courseMaxLevel')
          expect(data['courseMaxLevel']).to be_a(Integer)
          expect(data['levelContribution']).to include(
            'enabled' => false, 'formula' => '', 'weight' => 0, 'show' => false
          )
          expect(data['levelContribution']).to include('clamp' => true)
        end

        it 'includes levelContribution (null) on each student when level contribution disabled' do
          subject
          data = JSON.parse(response.body)
          data['students'].each do |s|
            expect(s).to have_key('levelContribution')
            expect(s['levelContribution']).to be_nil
          end
        end
      end

      context 'when an observer visits the page' do
        let(:observer) { create(:course_observer, course: course) }
        before { controller_sign_in(controller, observer.user) }

        it { expect { subject }.to raise_error(CanCan::AccessDenied) }
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
          controller_sign_in(controller, manager.user)
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

      context 'with weighted view enabled and a level config with formula_ast' do
        let(:manager) { create(:course_manager, course: course) }
        let!(:student_cu) { create(:course_student, course: course) }

        before do
          # Enable weighted view via the persisted course component setting, so the
          # controller's @settings.weighted_view_enabled reads true on the real request.
          gradebook_settings = Course::Settings::GradebookComponent.new(
            OpenStruct.new(current_course: course, key: Course::GradebookComponent.key)
          )
          gradebook_settings.weighted_view_enabled = true
          course.save!
          controller_sign_in(controller, manager.user)
          # Create a level config with a known AST: formula = 'level * 0.5'
          ast = {
            'type' => 'binop', 'op' => '*',
            'left' => { 'type' => 'var', 'name' => 'level' },
            'right' => { 'type' => 'num', 'value' => 0.5 }
          }
          Course::Gradebook::LevelConfig.upsert_for(
            course: course,
            attrs: { enabled: true, formula: 'level * 0.5', formula_ast: ast, weight: 10, show: false }
          )
        end

        it 'includes levelContribution on each student' do
          get :index, params: { course_id: course.id }, format: :json
          data = JSON.parse(response.body)
          student_data = data['students'].find { |s| s['id'] == student_cu.user_id }
          expect(student_data).not_to be_nil
          expect(student_data).to have_key('levelContribution')
          # level is 0 initially; 0 * 0.5 = 0.0
          expect(student_data['levelContribution'].to_f).to be_within(0.001).of(0.0)
        end
      end

      context 'with weighted view enabled, a level config, and a student above level 0' do
        let(:manager) { create(:course_manager, course: course) }
        let!(:level1) { create(:course_level, course: course, experience_points_threshold: 100) }
        let!(:student_cu) { create(:course_student, course: course) }
        let!(:exp_record) do
          create(:course_experience_points_record, course_user: student_cu, points_awarded: 500)
        end

        before do
          gradebook_settings = Course::Settings::GradebookComponent.new(
            OpenStruct.new(current_course: course, key: Course::GradebookComponent.key)
          )
          gradebook_settings.weighted_view_enabled = true
          course.save!
          controller_sign_in(controller, manager.user)
          # formula = 'level' → contribution equals the student's level_number.
          Course::Gradebook::LevelConfig.upsert_for(
            course: course,
            attrs: { enabled: true, formula: 'level',
                     formula_ast: { 'type' => 'var', 'name' => 'level' },
                     weight: 10, show: false }
          )
        end

        it 'computes a non-null levelContribution from the student level_number' do
          get :index, params: { course_id: course.id }, format: :json
          data = JSON.parse(response.body)
          student_data = data['students'].find { |s| s['id'] == student_cu.user_id }
          expect(student_data).not_to be_nil
          # 500 EXP places the student in level 1 (threshold 100); formula 'level' → 1.0.
          expect(student_data['level']).to eq(1)
          expect(student_data['levelContribution']).not_to be_nil
          expect(student_data['levelContribution'].to_f).to be_within(0.001).of(1.0)
        end
      end

      context 'with a clamping level config and an out-of-range student' do
        let(:manager) { create(:course_manager, course: course) }
        let!(:level1) { create(:course_level, course: course, experience_points_threshold: 100) }
        let!(:student_cu) { create(:course_student, course: course) }
        let!(:exp_record) do
          create(:course_experience_points_record, course_user: student_cu, points_awarded: 500)
        end

        before do
          gradebook_settings = Course::Settings::GradebookComponent.new(
            OpenStruct.new(current_course: course, key: Course::GradebookComponent.key)
          )
          gradebook_settings.weighted_view_enabled = true
          course.save!
          controller_sign_in(controller, manager.user)
          # formula 'level * 5', weight 3, clamp on: level 1 -> raw 5 -> clamped 3.
          Course::Gradebook::LevelConfig.upsert_for(
            course: course,
            attrs: { enabled: true, formula: 'level * 5',
                     formula_ast: { 'type' => 'binop', 'op' => '*',
                                    'left' => { 'type' => 'var', 'name' => 'level' },
                                    'right' => { 'type' => 'num', 'value' => 5 } },
                     weight: 3, show: false, clamp: true }
          )
        end

        it 'serializes the clamped per-student contribution' do
          get :index, params: { course_id: course.id }, format: :json
          data = JSON.parse(response.body)
          student_data = data['students'].find { |s| s['id'] == student_cu.user_id }
          expect(student_data['levelContribution'].to_f).to be_within(0.001).of(3.0)
          expect(data['levelContribution']).to include('clamp' => true)
        end
      end

      context 'when a student has an external ID' do
        let!(:student) { create(:course_student, course: course, external_id: 'EXT-123') }
        before { controller_sign_in(controller, manager.user) }

        it 'returns the external ID in the students array' do
          subject
          data = JSON.parse(response.body)
          student_data = data['students'].find { |s| s['id'] == student.user_id }
          expect(student_data).not_to be_nil
          expect(student_data['externalId']).to eq('EXT-123')
        end
      end

      context 'with a graded submission where the answer grade is exactly 0' do
        let(:manager) { create(:course_manager, course: course) }
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
          controller_sign_in(controller, manager.user)
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
        let(:manager) { create(:course_manager, course: course) }
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
          controller_sign_in(controller, manager.user)
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
    end

    describe 'PATCH update_weights' do
      let(:manager) { create(:course_manager, course: course) }
      let(:ta) { create(:course_teaching_assistant, course: course) }
      let(:student) { create(:course_student, course: course) }
      let(:category) { create(:course_assessment_category, course: course) }
      let!(:tab1) { create(:course_assessment_tab, category: category) }
      let!(:tab2) { create(:course_assessment_tab, category: category) }
      def weight_for(tab)
        Course::Gradebook::TabContribution.find_by(tab_id: tab.id)&.weight
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
          create(:course_gradebook_tab_contribution, tab: tab1, course: course, weight: 10)
          patch :update_weights,
                params: { course_id: course.id,
                          weights: [{ tabId: tab1.id, weight: 50 }, { tabId: tab2.id, weight: -1 }] },
                format: :json
          expect(response).to have_http_status(:unprocessable_content)
          expect(weight_for(tab1)).to eq(10)
        end

        it 'rolls back tab weights when the enabled level formula is invalid' do
          create(:course_gradebook_tab_contribution, tab: tab1, course: course, weight: 10)
          patch :update_weights, params: {
            course_id: course.id,
            weights: [tabId: tab1.id, weight: 50],
            levelContribution: { enabled: true, formula: '', weight: 5 }
          }, as: :json
          expect(response).to have_http_status(:unprocessable_content)
          expect(weight_for(tab1)).to eq(10)
        end

        it 'rejects >100 with 422' do
          patch :update_weights,
                params: { course_id: course.id, weights: [tabId: tab1.id, weight: 101] },
                format: :json
          expect(response).to have_http_status(:unprocessable_content)
        end

        it 'rejects foreign tab id with 422' do
          other_course = create(:course)
          other_tab = create(:course_assessment_tab,
                             category: create(:course_assessment_category, course: other_course))
          patch :update_weights,
                params: { course_id: course.id, weights: [tabId: other_tab.id, weight: 50] },
                format: :json
          expect(response).to have_http_status(:unprocessable_content)
        end

        it 'treats an omitted weights param as a no-op rather than a 500' do
          patch :update_weights, params: { course_id: course.id }, format: :json
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)['weights']).to eq([])
        end

        it 'rounds the echoed weight to 2dp so it matches the stored DECIMAL(5,2)' do
          patch :update_weights,
                params: { course_id: course.id, weights: [tabId: tab1.id, weight: 33.333] },
                format: :json
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)['weights'].first['weight']).to eq(33.33)
          expect(weight_for(tab1)).to eq(33.33)
        end

        it 'persists an enabled levelContribution and echoes it back' do
          patch :update_weights, params: {
            course_id: course.id,
            weights: [],
            levelContribution: {
              enabled: true, formula: 'min(level, 30) * 0.05', weight: 8, show: true,
              formulaAst: {
                type: 'binop', op: '*',
                left: { type: 'call2', fn: 'min',
                        a: { type: 'var', name: 'level' },
                        b: { type: 'num', value: 30 } },
                right: { type: 'num', value: 0.05 }
              }
            }
          }, as: :json
          expect(response).to have_http_status(:ok)
          config = course.reload.gradebook_level_config
          expect(config.enabled).to eq(true)
          expect(config.formula).to eq('min(level, 30) * 0.05')
          expect(config.weight).to eq(8)
          echoed = JSON.parse(response.body)['levelContribution']
          expect(echoed).to include('enabled' => true, 'weight' => 8.0)
          expect(echoed).not_to have_key('maxLevel')
        end

        it 'persists the clamp flag sent in the levelContribution payload' do
          patch :update_weights, params: {
            course_id: course.id,
            weights: [],
            levelContribution: {
              enabled: true, formula: 'level', weight: 8, show: false, clamp: false,
              formulaAst: { type: 'var', name: 'level' }
            }
          }, as: :json
          expect(response).to have_http_status(:ok)
          expect(course.reload.gradebook_level_config.clamp).to eq(false)
          expect(JSON.parse(response.body)['levelContribution']).to include('clamp' => false)
        end

        it 'rejects an enabled levelContribution with a blank formula (422)' do
          patch :update_weights, params: {
            course_id: course.id, weights: [],
            levelContribution: { enabled: true, formula: '', weight: 8, show: false }
          }, format: :json
          expect(response).to have_http_status(:unprocessable_content)
          expect(course.reload.gradebook_level_config).to be_nil
        end

        it 'leaves the config untouched when no levelContribution is sent' do
          patch :update_weights, params: { course_id: course.id, **valid_payload }, format: :json
          expect(response).to have_http_status(:ok)
          expect(JSON.parse(response.body)).not_to have_key('levelContribution')
          expect(course.reload.gradebook_level_config).to be_nil
        end

        it 'rejects a tampered formulaAst with 422' do
          patch :update_weights, params: {
            course_id: course.id,
            weights: [],
            levelContribution: {
              enabled: true,
              formula: 'level',
              formulaAst: { type: 'evil', payload: 'x' },
              weight: 5,
              show: false
            }
          }, format: :json
          expect(response).to have_http_status(:unprocessable_content)
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

      describe '#update_weights keepHighest' do
        render_views

        let(:category2) { create(:course_assessment_category, course: course) }
        let(:tab) { create(:course_assessment_tab, category: category2) }

        before { controller_sign_in(controller, manager.user) }

        it 'persists keepHighest and echoes it back' do
          post :update_weights, as: :json, params: {
            course_id: course.id,
            weights: [{ tabId: tab.id, weight: '50', weightMode: 'equal', keepHighest: 2 }]
          }
          expect(response).to have_http_status(:ok)
          body = JSON.parse(response.body)
          expect(body['weights'].first['keepHighest']).to eq(2)
          expect(Course::Gradebook::TabContribution.find_by(tab_id: tab.id).keep_highest).to eq(2)
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
          patch :update_weights, as: :json, params: {
            course_id: course.id,
            weights: [{
              tabId: tab.id, weight: '50', weightMode: 'custom',
              assessmentWeights: [
                { assessmentId: a1.id, weight: '30' },
                { assessmentId: a2.id, weight: '20' }
              ]
            }]
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
          patch :update_weights, as: :json, params: {
            course_id: course.id,
            weights: [{
              tabId: tab.id, weight: '50', weightMode: 'custom',
              assessmentWeights: [{ assessmentId: a1.id, weight: '10' }]
            }]
          }
          expect(response).to have_http_status(:unprocessable_content)
        end

        it 'persists and echoes per-assessment exclusion in equal mode' do
          patch :update_weights, as: :json, params: {
            course_id: course.id,
            weights: [{
              tabId: tab.id, weight: '50', weightMode: 'equal',
              excludedAssessmentIds: [a1.id]
            }]
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
      let!(:contribution) { create(:course_gradebook_tab_contribution, tab: tab, course: course, weight: 30) }
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

        it 'includes keepHighest in the weighted tabs response' do
          contribution.update!(keep_highest: 3)
          controller_sign_in(controller, manager.user)
          get :index, params: { course_id: course.id }, format: :json
          body = JSON.parse(response.body)
          tab_json = body['tabs'].find { |t| t['id'] == tab.id }
          expect(tab_json).to have_key('keepHighest')
          expect(tab_json['keepHighest']).to eq(3)
        end
      end
    end
  end
end
