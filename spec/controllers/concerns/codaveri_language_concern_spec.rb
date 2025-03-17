# frozen_string_literal: true
require 'rails_helper'

RSpec.describe CodaveriLanguageConcern do
  let(:language) { nil }
  describe '#codaveri_version' do
    it 'returns the Codaveri-compatible version for Python' do
      language = Coursemology::Polyglot::Language::Python::Python3Point12.instance
      expect(language.extend(CodaveriLanguageConcern).codaveri_version).to eq('3.12')
    end

    it 'returns the Codaveri-compatible version for Java' do
      language = Coursemology::Polyglot::Language::Java::Java21.instance
      expect(language.extend(CodaveriLanguageConcern).codaveri_version).to eq('21.0')
    end
  end
end
