# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::AssessmentsController, type: :controller do
  render_views
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user, koditsu_v1_workspace_id: v1_workspace_id) }
    let(:v1_workspace_id) { '670040c49a72e414c8f04bd7' }
    let(:assessment) do
      # Koditsu assessments require an end date.
      create(:assessment, course: course, end_at: 1.day.from_now,
                          is_koditsu_enabled: true, koditsu_v1_assessment_id: '673723b9c0e624233e4f201f')
    end

    before do
      instance.set_component_enabled_boolean!(:course_koditsu_platform_component, true)
      course.set_component_enabled_boolean!(:course_koditsu_platform_component, true)
      controller_sign_in(controller, user)
    end
    # Instance.default is memoised, so the setting would outlive this example's rolled-back transaction.
    after { instance.set_component_enabled_boolean!(:course_koditsu_platform_component, false) }

    def expect_retired
      expect(response).to have_http_status(:gone)
      expect(JSON.parse(response.body)['errors']).to eq(
        Course::Assessment::KoditsuV1RetirementConcern::KODITSU_V1_RETIRED_MESSAGE
      )
    end

    describe '#sync_with_koditsu' do
      it 'refuses in a course linked to Koditsu v1, without calling Koditsu' do
        expect(KoditsuAsyncApiService).not_to receive(:new)

        put :sync_with_koditsu, as: :json, params: { course_id: course, id: assessment }
        expect_retired
        expect(course.reload.koditsu_workspace_id).to be_nil
        expect(assessment.reload.koditsu_assessment_id).to be_nil
      end
    end

    describe '#invite_to_koditsu' do
      it 'refuses in a course linked to Koditsu v1, without calling Koditsu' do
        expect(KoditsuAsyncApiService).not_to receive(:new)

        post :invite_to_koditsu, as: :json, params: { course_id: course, id: assessment }
        expect_retired
      end
    end

    describe '#update' do
      def update_koditsu_mode(enabled, target = assessment)
        patch :update, as: :json, params: {
          course_id: course, id: target, assessment: { title: 'Renamed', is_koditsu_enabled: enabled }
        }
      end

      it 'refuses to switch Koditsu mode off, which would reopen a retired assessment' do
        update_koditsu_mode(false)
        expect_retired
        expect(assessment.reload.is_koditsu_enabled).to be(true)
        expect(assessment.title).not_to eq('Renamed')
      end

      it 'treats an explicit null as switching it off, since it would be saved as null' do
        update_koditsu_mode(nil)
        expect_retired
        expect(assessment.reload.is_koditsu_enabled).to be(true)
      end

      it 'saves a request that leaves the mode out' do
        patch :update, as: :json, params: { course_id: course, id: assessment, assessment: { title: 'Renamed' } }
        expect(response).to have_http_status(:ok)
        expect(assessment.reload).to have_attributes(title: 'Renamed', is_koditsu_enabled: true)
      end

      context 'for an assessment outside Koditsu mode that still carries a v1 ID' do
        let(:plain_assessment) do
          create(:assessment, course: course, is_koditsu_enabled: false,
                              koditsu_v1_assessment_id: '670041d39a72e414c8f04c2e')
        end

        it 'refuses to switch Koditsu mode on, which would retire a working assessment' do
          update_koditsu_mode(true, plain_assessment)
          expect_retired
          expect(plain_assessment.reload.is_koditsu_enabled).to be(false)
        end

        it 'saves other changes that repeat the current mode' do
          update_koditsu_mode(false, plain_assessment)
          expect(response).to have_http_status(:ok)
          expect(plain_assessment.reload.title).to eq('Renamed')
        end
      end

      context 'when the course is not linked to Koditsu v1' do
        let(:v1_workspace_id) { nil }

        it 'switches Koditsu mode as usual' do
          update_koditsu_mode(false)
          expect(response).to have_http_status(:ok)
          expect(assessment.reload.is_koditsu_enabled).to be(false)
        end
      end
    end

    describe '#create' do
      def create_assessment(koditsu_enabled)
        post :create, as: :json, params: {
          course_id: course, category: course.assessment_categories.first,
          tab: course.assessment_categories.first.tabs.first,
          assessment: { title: 'New exam', base_exp: 0, start_at: 1.day.from_now, end_at: 2.days.from_now,
                        autograded: false, is_koditsu_enabled: koditsu_enabled }
        }
      end

      it 'refuses a new Koditsu assessment' do
        expect { create_assessment(true) }.not_to change(Course::Assessment, :count)
        expect_retired
      end

      it 'creates other assessments as usual' do
        expect { create_assessment(false) }.to change(Course::Assessment, :count).by(1)
      end
    end

    describe '#show' do
      subject(:body) do
        get :show, as: :json, params: { course_id: course, id: assessment }
        JSON.parse(response.body)
      end

      it 'omits the Koditsu sync state, so the page does not sync' do
        expect(body).not_to have_key('isKoditsuAssessmentEnabled')
        expect(body).not_to have_key('isSyncedWithKoditsu')
      end

      context 'when the course is not linked to Koditsu v1' do
        let(:v1_workspace_id) { nil }

        it 'includes it' do
          expect(body).to include('isKoditsuAssessmentEnabled' => true, 'isSyncedWithKoditsu' => false)
        end
      end
    end

    describe '#edit' do
      subject(:body) do
        get :edit, as: :json, params: { course_id: course, id: assessment }
        JSON.parse(response.body)
      end

      it 'reports the retirement, while still reporting the course component as it is' do
        expect(body).to include('isKoditsuExamEnabled' => true, 'isKoditsuV1Linked' => true)
      end

      context 'when the course is not linked to Koditsu v1' do
        let(:v1_workspace_id) { nil }

        it { is_expected.to include('isKoditsuExamEnabled' => true, 'isKoditsuV1Linked' => false) }
      end
    end

    describe '#index' do
      subject(:body) do
        assessment
        get :index, as: :json, params: { course_id: course }
        JSON.parse(response.body)
      end

      it 'reports the retirement for new assessments' do
        expect(body['display']).to include('isKoditsuExamEnabled' => true, 'isKoditsuV1Linked' => true)
      end

      context 'when the course is not linked to Koditsu v1' do
        let(:v1_workspace_id) { nil }

        it 'does not' do
          expect(body['display']).to include('isKoditsuExamEnabled' => true, 'isKoditsuV1Linked' => false)
        end
      end
    end
  end
end
