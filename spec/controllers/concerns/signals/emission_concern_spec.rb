# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Signals::EmissionConcern do
  HEADER_KEY = Signals::EmissionConcern::HEADER_KEY

  class OutOfOrder < StandardError; end

  module Signals::Slices::DummySlice1
    def generate_sync_for_dummy_slice1
      (@first && @second) ? :dummy1 : raise(OutOfOrder, 'signal should be resolved after all controller callbacks')
    end
  end

  module Signals::Slices::DummySlice2
    def generate_sync_for_dummy_slice2
      (@first && @second) ? :dummy2 : raise(OutOfOrder, 'signal should be resolved after all controller callbacks')
    end
  end

  controller(ActionController::Base) do
    include Signals::EmissionConcern

    after_action :callback2
    after_action :callback1

    signals :dummy_slice1, after: [:index, :show], if: :should_emit_signal1?
    signals :dummy_slice1, after: [:update]
    signals :dummy_slice2, after: [:edit]

    def index; end

    def new; end

    def edit; end

    def update; end

    def show
      head :bad_request
    end

    private

    def callback1
      @first = true
    end

    def callback2
      @first ? (@second = true) : raise(OutOfOrder, 'callback2 should be called after callback1')
    end

    def should_emit_signal1?
      true
    end
  end

  before do
    routes.draw do
      get 'index' => 'anonymous#index'
      get 'show' => 'anonymous#show'
      get 'new' => 'anonymous#new'
      get 'edit' => 'anonymous#edit'
      get 'update' => 'anonymous#update'
    end
  end

  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    context 'if request succeeds' do
      it 'emits signal if action is attached' do
        get :index, as: :json

        expect(response).to be_successful
        expect(response.headers).to include(HEADER_KEY)
        expect(JSON.parse(response.headers[HEADER_KEY])).to eq('dummy1')
      end

      it 'does not emit signal if action is not attached' do
        get :new, as: :json

        expect(response).to be_successful
        expect(response.headers).not_to include(HEADER_KEY)
      end

      it 'does not emit signal if condition is false' do
        allow(controller).to receive(:should_emit_signal1?).and_return(false)

        get :index, as: :json

        expect(response).to be_successful
        expect(response.headers).not_to include(HEADER_KEY)
      end

      it 'emit different signals for different actions' do
        response1 = get :index, as: :json

        expect(response1).to be_successful
        expect(response1.headers).to include(HEADER_KEY)
        expect(JSON.parse(response1.headers[HEADER_KEY])).to eq('dummy1')

        response2 = get :edit, as: :json

        expect(response2).to be_successful
        expect(response2.headers).to include(HEADER_KEY)
        expect(JSON.parse(response2.headers[HEADER_KEY])).to eq('dummy2')
      end

      it 'emits the same signal depending on configuration' do
        allow(controller).to receive(:should_emit_signal1?).and_return(false)

        response1 = get :update, as: :json

        expect(response1).to be_successful
        expect(response1.headers).to include(HEADER_KEY)
        expect(JSON.parse(response1.headers[HEADER_KEY])).to eq('dummy1')

        response2 = get :index, as: :json

        expect(response2).to be_successful
        expect(response2.headers).not_to include(HEADER_KEY)
      end
    end

    context 'if request fails' do
      it 'does not emit signal if request fails' do
        get :show, as: :json

        expect(response).not_to be_successful
        expect(response.headers).not_to include(HEADER_KEY)
      end
    end
  end
end
