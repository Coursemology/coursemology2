# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Question::KoditsuQuestionConcern do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    class self::DummyController < ApplicationController
      include Course::Assessment::Question::KoditsuQuestionConcern
    end

    let!(:dummy_controller) { self.class::DummyController.new }

    let!(:course) { create(:course, koditsu_workspace_id: '66fd754a3486c7994c809e16') }
    let!(:assessment) do
      create(:course_assessment_assessment,
             course: course,
             start_at: Time.zone.now - 30.minutes,
             end_at: 2.hours.from_now)
    end
    let!(:programming_question) do
      create(:course_assessment_question_programming,
             assessment: assessment,
             maximum_grade: 10)
    end

    before do
      dummy_controller.instance_variable_set(:@assessment, assessment)
      dummy_controller.instance_variable_set(:@programming_question, programming_question)
    end

    context 'upon receiving success response from API call' do
      let(:success) { 201 }
      let(:response) do
        JSON.parse(
          File.read(File.join(Rails.root,
                              'spec/fixtures/course/koditsu/koditsu_question_success_response_test.json'))
        )
      end

      it 'flag related question as synced' do
        dummy_controller.send(:adjust_question_from_koditsu_response, success, response['data'])

        updated_question = dummy_controller.instance_variable_get(:@question)
        expect(updated_question.is_synced_with_koditsu).to be(true)
        expect(updated_question.koditsu_question_id).to eq(response['data']['id'])
      end
    end

    context 'upon receiving failure response from API call' do
      let(:failure) { 400 }
      let(:response) do
        JSON.parse(
          File.read(File.join(Rails.root,
                              'spec/fixtures/course/koditsu/koditsu_question_failure_response_test.json'))
        )
      end

      it 'flag related question as not synced' do
        dummy_controller.send(:adjust_question_from_koditsu_response, failure, response)

        updated_question = dummy_controller.instance_variable_get(:@question)
        expect(updated_question.is_synced_with_koditsu).to be(false)
        expect(updated_question.koditsu_question_id).to eq(nil)
      end
    end
  end
end
