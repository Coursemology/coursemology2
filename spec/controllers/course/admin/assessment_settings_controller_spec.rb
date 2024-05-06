# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Admin::AssessmentSettingsController, type: :controller do
  let(:instance) { Instance.default }
  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    before { controller_sign_in(controller, user) }

    describe '#edit' do
      subject { get :edit, params: { course_id: course, format: :json } }
      it { is_expected.to render_template(:edit) }
    end

    describe '#update' do
      before do
        allow(course).to receive(:update).and_return(false)
        allow(controller).to receive(:current_course).and_return(course)
        allow(controller).to receive(:category_params).and_return(nil)
      end
      context 'upon update failure' do
        subject { patch :update, params: { course_id: course } }
        it 'returns bad_request with errors' do
          expect(subject).to have_http_status(:bad_request)
          expect(JSON.parse(subject.body)['errors']).not_to be_nil
        end
      end
    end

    describe 'moving actions' do
      let!(:category1) { create(:course_assessment_category, course: course) }
      let!(:category2) { create(:course_assessment_category, course: course) }
      let!(:tab1) { create(:course_assessment_tab, course: course, category: category1) }
      let!(:tab2) { create(:course_assessment_tab, course: course, category: category2) }
      let!(:assessment1) { create(:course_assessment_assessment, course: course, tab: tab1) }
      let!(:assessment2) { create(:course_assessment_assessment, course: course, tab: tab1) }

      describe '#move_assessments' do
        subject do
          post :move_assessments, as: :json, params: {
            course_id: course,
            source_tab_id: tab1.id,
            destination_tab_id: tab2.id
          }
        end

        context 'when assessments are successfully moved' do
          before { subject }

          it 'responds ok and returns the moved assessments count' do
            expect(response).to have_http_status(:ok)
            expect(JSON.parse(response.body)).to eq({ 'moved_assessments_count' => 2 })
          end

          it 'moves the assessments from the source to destination tab' do
            expect(assessment1.reload.tab).to eq(tab2)
            expect(assessment2.reload.tab).to eq(tab2)
            expect(assessment1.reload.folder.parent.owner).to eq(category2)
            expect(assessment2.reload.folder.parent.owner).to eq(category2)
          end
        end

        context 'when assessments failed to be moved' do
          before do
            allow(controller).to receive(:move_assessments_params).and_return(nil)
            subject
          end

          it 'responds bad request' do
            expect(response).to have_http_status(:bad_request)
          end
        end
      end

      describe '#move_tabs' do
        subject do
          post :move_tabs, as: :json, params: {
            course_id: course,
            source_category_id: category1.id,
            destination_category_id: category2.id
          }
        end

        context 'when the tabs are successfully moved' do
          before { subject }

          it 'responds ok and returns the moved tabs count' do
            expect(response).to have_http_status(:ok)
            expect(JSON.parse(response.body)).to eq({ 'moved_tabs_count' => 2 })
          end

          it 'moves all tabs from the source to destination category' do
            expect(tab1.reload.category).to eq(category2)
            expect(category1.reload.tabs).to be_empty
            expect(category2.reload.tabs).to include(tab1)
          end

          it 'moves all assessments from the source to destination category' do
            expect(assessment1.reload.tab.category).to eq(category2)
            expect(assessment2.reload.tab.category).to eq(category2)
            expect(assessment1.reload.folder.parent.owner).to eq(category2)
            expect(assessment2.reload.folder.parent.owner).to eq(category2)
            expect(category1.reload.assessments).to be_empty
            expect(category2.reload.assessments).to include(assessment1)
            expect(category2.reload.assessments).to include(assessment2)
          end
        end

        context 'when the tabs failed to be moved' do
          before do
            allow(controller).to receive(:move_tabs_params).and_return(nil)
            subject
          end

          it 'responds bad request' do
            expect(response).to have_http_status(:bad_request)
          end
        end
      end
    end
  end
end
