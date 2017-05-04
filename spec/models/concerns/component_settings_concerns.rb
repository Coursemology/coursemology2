# frozen_string_literal: true
require 'rails_helper'

RSpec.describe ComponentSettingsConcern do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    describe 'default behaviours' do
      class self::DummyModel
        include ComponentSettingsConcern
      end

      let(:dummy_model) { self.class::DummyModel.new }

      describe '#enabled_component_ids' do
        it 'raises an error' do
          expect { dummy_model.enabled_component_ids }.to raise_error(NotImplementedError)
        end
      end

      describe '#enabled_component_ids=' do
        it 'raises an error' do
          expect { dummy_model.enabled_component_ids = [] }.to raise_error(NotImplementedError)
        end
      end
    end
  end
end
