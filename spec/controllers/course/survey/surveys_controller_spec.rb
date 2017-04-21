# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Survey::SurveysController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:admin) { create(:administrator) }
    let!(:course) { create(:course, creator: admin) }
    let!(:survey) do
      create(:survey, *survey_traits,
             course: course, section_count: 2, section_traits: [:with_all_question_types])
    end
    let(:survey_traits) { nil }

    before { sign_in(user) }

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
  end
end
