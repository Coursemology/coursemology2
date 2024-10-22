# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::KoditsuAssessmentInvitationConcern do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    class self::DummyController < ApplicationController
      include Course::Assessment::KoditsuAssessmentInvitationConcern
    end

    let!(:dummy_controller) { self.class::DummyController.new }

    context 'upon receiving all success response from API call' do
      let(:response) do
        JSON.parse(
          File.read(File.join(Rails.root,
                              'spec/fixtures/course/koditsu/koditsu_invitation_success_response_test.json'))
        )
      end

      it 'will render as successfully invited to Koditsu' do
        success = dummy_controller.send(:all_invitation_successful?, response['data'])

        expect(success).to be(true)
      end
    end

    context 'upon receiving all success response from API call' do
      let(:response) do
        JSON.parse(
          File.read(File.join(Rails.root,
                              'spec/fixtures/course/koditsu/koditsu_invitation_some_duplicate_response_test.json'))
        )
      end

      it 'will render as successfully invited to Koditsu' do
        success = dummy_controller.send(:all_invitation_successful?, response['data'])

        expect(success).to be(true)
      end
    end

    context 'upon receiving partial failure due to other causes from API call' do
      let(:response) do
        JSON.parse(
          File.read(File.join(Rails.root,
                              'spec/fixtures/course/koditsu/koditsu_invitation_some_error_response_test.json'))
        )
      end

      it 'will render as successfully invited to Koditsu' do
        success = dummy_controller.send(:all_invitation_successful?, response['data'])

        expect(success).to be(false)
      end
    end
  end
end
