# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::KoditsuAssessmentConcern do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    class self::DummyController < ApplicationController
      include Course::Assessment::KoditsuAssessmentConcern
    end

    let!(:dummy_controller) { self.class::DummyController.new }

    let!(:course) { create(:course, koditsu_workspace_id: '66fd754a3486c7994c809e16') }
    let!(:assessment) do
      create(:course_assessment_assessment,
             course: course,
             start_at: Time.zone.now - 30.minutes,
             end_at: 2.hours.from_now)
    end

    before do
      dummy_controller.instance_variable_set(:@assessment, assessment)
    end

    context 'upon receiving success response from API call' do
      let(:success) { 201 }
      let(:response) do
        JSON.parse(
          File.read(File.join(Rails.root,
                              'spec/fixtures/course/koditsu/koditsu_assessment_success_response_test.json'))
        )
      end

      it 'flag related assessment as synced' do
        dummy_controller.send(:adjust_assessment_from_koditsu_response, success, response['data'])

        updated_assessment = dummy_controller.instance_variable_get(:@assessment)
        expect(updated_assessment.is_synced_with_koditsu).to be(true)
        expect(updated_assessment.koditsu_assessment_id).to eq(response['data']['id'])
      end
    end

    context 'upon receiving failure response from API call' do
      let(:failure) { 400 }
      let(:response) do
        JSON.parse(
          File.read(File.join(Rails.root,
                              'spec/fixtures/course/koditsu/koditsu_assessment_failure_response_test.json'))
        )
      end

      it 'flag related assessment as not synced' do
        dummy_controller.send(:adjust_assessment_from_koditsu_response, failure, response)

        updated_assessment = dummy_controller.instance_variable_get(:@assessment)
        expect(updated_assessment.is_synced_with_koditsu).to be(false)
        expect(updated_assessment.koditsu_assessment_id).to eq(nil)
      end
    end
  end
end
