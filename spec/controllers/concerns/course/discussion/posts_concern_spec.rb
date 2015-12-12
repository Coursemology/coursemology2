require 'rails_helper'

RSpec.describe Course::Discussion::PostsConcern do
  let!(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe 'default behaviours' do
      class self::DummyController < ApplicationController
        include Course::Discussion::PostsConcern
      end

      let(:dummy_controller) { self.class::DummyController.new }

      describe '#discussion_topic' do
        it 'raises an error' do
          expect { dummy_controller.send(:discussion_topic) }.to raise_error(NotImplementedError)
        end
      end

      describe '#create_topic_subscription' do
        it 'raises an error' do
          expect { dummy_controller.send(:create_topic_subscription) }.
            to raise_error(NotImplementedError)
        end
      end
    end
  end
end
